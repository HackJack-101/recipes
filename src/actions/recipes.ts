"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { requireKitchen, requireRecipe } from "@/lib/permissions";
import { parseTags, recipeDataSchema, type RecipeData } from "@/lib/recipe-schema";
import { importRecipe as runImport, type ImportMode } from "@/lib/importer";
import { ImportError } from "@/lib/fetch-page";
import { deletePhotoFile, MAX_PHOTO_BYTES, savePhotoFile, sniffImage } from "@/lib/storage";
import type { FormState } from "./auth";

const toInt = (v: FormDataEntryValue | null) => {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : null;
};

function toQuantity(raw: string): number | null {
  const s = raw.trim().replace(",", ".");
  if (!s) return null;
  const frac = s.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);
  if (frac) return Number(frac[1] ?? 0) + Number(frac[2]) / Number(frac[3]);
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function parseRecipeForm(fd: FormData): RecipeData | null {
  const qty = fd.getAll("ing_qty").map(String);
  const unit = fd.getAll("ing_unit").map(String);
  const name = fd.getAll("ing_name").map(String);
  const ingredients = name
    .map((n, i) => ({ quantity: toQuantity(qty[i] ?? ""), unit: (unit[i] ?? "").trim() || null, name: n.trim() }))
    .filter((i) => i.name);
  const steps = String(fd.get("steps") ?? "")
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const parsed = recipeDataSchema.safeParse({
    title: String(fd.get("title") ?? ""),
    description: String(fd.get("description") ?? "").trim() || null,
    servings: fd.get("noGauge") ? null : toInt(fd.get("servings")),
    prepMinutes: toInt(fd.get("prepMinutes")),
    cookMinutes: toInt(fd.get("cookMinutes")),
    ingredients,
    steps,
    tags: parseTags(String(fd.get("tags") ?? "")),
  });
  return parsed.success ? parsed.data : null;
}

const tagsInput = (kitchenId: string, names: string[]) => ({
  connectOrCreate: names.map((name) => ({
    where: { kitchenId_name: { kitchenId, name } },
    create: { kitchenId, name },
  })),
});
const pruneTags = (kitchenId: string) => db.tag.deleteMany({ where: { kitchenId, recipes: { none: {} } } });

export async function saveRecipe(
  kitchenId: string,
  recipeId: string | null,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const data = parseRecipeForm(fd);
  if (!data) return { error: "invalid" };
  const locale = await getLocale();
  if (recipeId) {
    const { recipe } = await requireRecipe(recipeId);
    const { tags, ...fields } = data;
    await db.recipe.update({
      where: { id: recipe.id },
      data: { ...fields, tags: { set: [], ...tagsInput(recipe.kitchenId, tags) } },
    });
    await pruneTags(recipe.kitchenId);
    revalidatePath("/", "layout");
    redirect({ href: `/kitchens/${recipe.kitchenId}/recipes/${recipe.id}`, locale });
  }
  const { user, kitchen } = await requireKitchen(kitchenId);
  const { tags, ...fields } = data;
  const created = await db.recipe.create({
    data: { ...fields, kitchenId: kitchen.id, authorId: user.id, tags: tagsInput(kitchen.id, tags) },
  });
  redirect({ href: `/kitchens/${kitchen.id}/recipes/${created.id}`, locale });
}

export async function importRecipeAction(kitchenId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const { user, kitchen } = await requireKitchen(kitchenId);
  const mode = String(fd.get("mode")) as ImportMode;
  if (!["url", "html", "text"].includes(mode)) return { error: "empty" };
  const input = String(fd.get(mode) ?? "");
  if (!input.trim()) return { error: "empty" };

  let data: RecipeData;
  try {
    const existing = await db.tag.findMany({ where: { kitchenId: kitchen.id }, select: { name: true } });
    data = await runImport(
      mode,
      input,
      existing.map((t) => t.name),
    );
  } catch (e) {
    return { error: e instanceof ImportError ? e.code : "aiFailed" };
  }
  const { tags, ...fields } = data;
  const created = await db.recipe.create({
    data: {
      ...fields,
      tags: tagsInput(kitchen.id, tags),
      kitchenId: kitchen.id,
      authorId: user.id,
      sourceType: mode === "url" ? "URL" : mode === "html" ? "HTML" : "TEXT",
      sourceUrl: mode === "url" ? input.trim() : null,
    },
  });
  // Redirect to the edit page so the user can review what the agent extracted.
  redirect({ href: `/kitchens/${kitchen.id}/recipes/${created.id}/edit`, locale: await getLocale() });
}

export async function deleteRecipe(recipeId: string) {
  const { recipe } = await requireRecipe(recipeId);
  await db.recipe.delete({ where: { id: recipe.id } });
  await pruneTags(recipe.kitchenId);
  await Promise.all(recipe.photos.map((p) => deletePhotoFile(p.filename)));
  revalidatePath("/", "layout");
  redirect({ href: `/kitchens/${recipe.kitchenId}`, locale: await getLocale() });
}

export async function togglePublic(recipeId: string) {
  const { recipe } = await requireRecipe(recipeId);
  await db.recipe.update({
    where: { id: recipe.id },
    data: { publicSlug: recipe.publicSlug ? null : randomBytes(9).toString("base64url") },
  });
  revalidatePath("/", "layout");
}

export async function uploadPhoto(recipeId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const { recipe } = await requireRecipe(recipeId);
  const file = fd.get("photo");
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_PHOTO_BYTES) return { error: "invalid" };
  const buf = Buffer.from(await file.arrayBuffer());
  const type = sniffImage(buf);
  if (!type) return { error: "invalid" };
  const filename = await savePhotoFile(buf, type.ext);
  await db.recipePhoto.create({ data: { recipeId: recipe.id, filename, mimeType: type.mime } });
  revalidatePath("/", "layout");
}

export async function deletePhoto(photoId: string) {
  const photo = await db.recipePhoto.findUnique({ where: { id: photoId } });
  if (!photo) return;
  await requireRecipe(photo.recipeId);
  await db.recipePhoto.delete({ where: { id: photo.id } });
  await deletePhotoFile(photo.filename);
  revalidatePath("/", "layout");
}
