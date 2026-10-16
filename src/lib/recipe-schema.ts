import { z } from "zod";

export const ingredientSchema = z.object({
  quantity: z.number().nonnegative().nullable(),
  unit: z.string().trim().max(40).nullable(),
  name: z.string().trim().min(1).max(200),
});

export const recipeDataSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).nullable(),
  servings: z.number().int().positive().max(500).nullable(),
  prepMinutes: z.number().int().nonnegative().max(10000).nullable(),
  cookMinutes: z.number().int().nonnegative().max(10000).nullable(),
  ingredients: z.array(ingredientSchema).max(200),
  steps: z.array(z.string().trim().min(1).max(4000)).max(100),
  tags: z.array(z.string().trim().min(1).max(30)).max(20).default([]),
});

/** "Dessert, Rapide ,dessert" -> ["dessert", "rapide"] : minuscules, sans doublon, 20 max. */
export function parseTags(raw: string | string[]): string[] {
  const parts = Array.isArray(raw) ? raw : raw.split(/[,\n]/);
  const seen = new Set<string>();
  for (const p of parts) {
    const t = p.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 30);
    if (t) seen.add(t);
  }
  return [...seen].slice(0, 20);
}

export type Ingredient = z.infer<typeof ingredientSchema>;
export type RecipeData = z.output<typeof recipeDataSchema>;

export const ingredientsFromJson = (v: unknown): Ingredient[] => z.array(ingredientSchema).catch([]).parse(v);
export const stepsFromJson = (v: unknown): string[] => z.array(z.string()).catch([]).parse(v);
