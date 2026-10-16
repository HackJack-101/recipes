import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { db } from "./db";
import { getCurrentUser } from "./session";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect({ href: "/login", locale: await getLocale() });
  return user!;
}

export async function requireSuperAdmin() {
  const user = await requireUser();
  if (!user.isSuperAdmin) notFound();
  return user;
}

/** Kitchen member, or super admin. 404 otherwise (existence is not revealed). */
export async function requireKitchen(kitchenId: string) {
  const user = await requireUser();
  const kitchen = await db.kitchen.findFirst({
    where: user.isSuperAdmin ? { id: kitchenId } : { id: kitchenId, memberships: { some: { userId: user.id } } },
  });
  if (!kitchen) notFound();
  return { user, kitchen: kitchen! };
}

/** Kitchen owner, or super admin. */
export async function requireKitchenOwner(kitchenId: string) {
  const user = await requireUser();
  if (!(await isKitchenOwner(user, kitchenId))) notFound();
  const kitchen = await db.kitchen.findUnique({ where: { id: kitchenId } });
  if (!kitchen) notFound();
  return { user, kitchen: kitchen! };
}

export async function isKitchenOwner(user: { id: string; isSuperAdmin: boolean }, kitchenId: string) {
  if (user.isSuperAdmin) return true;
  const m = await db.membership.findUnique({ where: { userId_kitchenId: { userId: user.id, kitchenId } } });
  return m?.role === "OWNER";
}

/** Recipe the user can access; when `kitchenId` is given, the recipe must also belong to that kitchen. */
export async function requireRecipe(recipeId: string, kitchenId?: string) {
  const user = await requireUser();
  const recipe = await db.recipe.findFirst({
    where: {
      id: recipeId,
      ...(kitchenId ? { kitchenId } : {}),
      ...(user.isSuperAdmin ? {} : { kitchen: { memberships: { some: { userId: user.id } } } }),
    },
    include: { photos: { orderBy: { createdAt: "asc" } }, kitchen: true, tags: { orderBy: { name: "asc" } } },
  });
  if (!recipe) notFound();
  return { user, recipe: recipe! };
}
