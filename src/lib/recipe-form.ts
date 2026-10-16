import { parseTags, recipeDataSchema, type RecipeData } from "./recipe-schema";

const UNICODE_FRACTIONS: Record<string, string> = { "¼": "1/4", "⅓": "1/3", "½": "1/2", "⅔": "2/3", "¾": "3/4" };

const toInt = (v: FormDataEntryValue | null) => {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : null;
};

/** "1,5", "1/2", "1 1/2", "1½" -> number. Anything unreadable -> null. */
export function toQuantity(raw: string): number | null {
  const s = raw
    .trim()
    .replace(",", ".")
    .replace(/[¼⅓½⅔¾]/, (c) => ` ${UNICODE_FRACTIONS[c]}`)
    .trim();
  if (!s) return null;
  const frac = s.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);
  if (frac) return Number(frac[3]) ? Number(frac[1] ?? 0) + Number(frac[2]) / Number(frac[3]) : null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Quantity shown in the edit form: 0.3333333 -> "0.333" (no float noise). */
export const quantityInput = (q: number | null) => (q == null ? "" : String(Math.round(q * 1000) / 1000));

export function parseRecipeForm(fd: FormData): RecipeData | null {
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
