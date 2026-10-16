import { describe, expect, it } from "vitest";
import type { Recipe } from "@prisma/client";
import { fileSlug, recipeToMarkdown } from "./export";

const recipe = {
  title: "Tarte aux pommes",
  description: "Une tarte simple.",
  servings: 6,
  prepMinutes: 20,
  cookMinutes: null,
  ingredients: [
    { quantity: 0.5, unit: "kg", name: "pommes" },
    { quantity: null, unit: null, name: "sel" },
  ],
  steps: ["Éplucher.", "Cuire."],
  sourceUrl: "https://example.com/tarte",
  tags: [{ name: "dessert" }],
} as unknown as Recipe & { tags: { name: string }[] };

describe("recipeToMarkdown", () => {
  it("renders a French recipe", () => {
    expect(recipeToMarkdown(recipe, "fr")).toBe(
      [
        "# Tarte aux pommes",
        "",
        "Une tarte simple.",
        "",
        "Pour 6 convives · Préparation: 20 min",
        "",
        "Tags: dessert",
        "",
        "## Ingrédients",
        "",
        "- ½ kg pommes",
        "- sel",
        "",
        "## Préparation",
        "",
        "1. Éplucher.",
        "2. Cuire.",
        "",
        "Source: https://example.com/tarte",
        "",
      ].join("\n"),
    );
  });

  it("uses English labels and handles a missing guest count", () => {
    const md = recipeToMarkdown({ ...recipe, servings: null }, "en");
    expect(md).toContain("No set number of guests · Prep: 20 min");
    expect(md).toContain("## Ingredients");
  });
});

describe("fileSlug", () => {
  it("strips accents and punctuation", () => {
    expect(fileSlug("Crème brûlée !")).toBe("creme-brulee");
  });

  it("falls back when nothing is left", () => {
    expect(fileSlug("???")).toBe("recipe");
  });
});
