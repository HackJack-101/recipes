import { ingredientsFromJson, stepsFromJson } from "./recipe-schema";
import { formatQuantity } from "./scale";
import type { Recipe } from "@prisma/client";

type WithTags = Recipe & { tags: { name: string }[] };

const L = {
  fr: {
    ingredients: "Ingrédients",
    steps: "Préparation",
    servings: (n: number) => `Pour ${n} convive${n > 1 ? "s" : ""}`,
    noGauge: "Pas de nombre de convives défini",
    prep: "Préparation",
    cook: "Cuisson",
    source: "Source",
    tags: "Tags",
  },
  en: {
    ingredients: "Ingredients",
    steps: "Instructions",
    servings: (n: number) => `Serves ${n}`,
    noGauge: "No set number of guests",
    prep: "Prep",
    cook: "Cook",
    source: "Source",
    tags: "Tags",
  },
} as const;

export function recipeToMarkdown(r: WithTags, locale: string): string {
  const t = L[locale === "en" ? "en" : "fr"];
  const out: string[] = [`# ${r.title}`, ""];
  if (r.description) out.push(r.description, "");
  const meta = [r.servings ? t.servings(r.servings) : t.noGauge];
  if (r.prepMinutes != null) meta.push(`${t.prep}: ${r.prepMinutes} min`);
  if (r.cookMinutes != null) meta.push(`${t.cook}: ${r.cookMinutes} min`);
  out.push(meta.join(" · "), "");
  if (r.tags.length) out.push(`${t.tags}: ${r.tags.map((x) => x.name).join(", ")}`, "");
  out.push(`## ${t.ingredients}`, "");
  for (const i of ingredientsFromJson(r.ingredients)) {
    out.push(
      `- ${[i.quantity != null ? formatQuantity(i.quantity) : "", i.unit ?? "", i.name].filter(Boolean).join(" ")}`,
    );
  }
  out.push("", `## ${t.steps}`, "");
  stepsFromJson(r.steps).forEach((s, n) => out.push(`${n + 1}. ${s}`));
  if (r.sourceUrl) out.push("", `${t.source}: ${r.sourceUrl}`);
  return out.join("\n") + "\n";
}

export function fileSlug(s: string) {
  return (
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "recipe"
  );
}
