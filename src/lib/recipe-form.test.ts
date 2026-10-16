import { describe, expect, it } from "vitest";
import { parseRecipeForm, quantityInput, toQuantity } from "./recipe-form";

describe("toQuantity", () => {
  it.each([
    ["2", 2],
    ["1,5", 1.5],
    ["1/2", 0.5],
    ["1 1/2", 1.5],
    ["½", 0.5],
    ["1½", 1.5],
    ["2 ¼", 2.25],
  ])("reads %s", (raw, expected) => expect(toQuantity(raw)).toBe(expected));

  it.each(["", "  ", "abc", "-1", "1/0"])("returns null for %j", (raw) => expect(toQuantity(raw)).toBeNull());
});

describe("quantityInput", () => {
  it("rounds to 3 decimals", () => {
    expect(quantityInput(1 / 3)).toBe("0.333");
    expect(quantityInput(2)).toBe("2");
    expect(quantityInput(null)).toBe("");
  });
});

const form = (entries: [string, string][]) => {
  const fd = new FormData();
  for (const [k, v] of entries) fd.append(k, v);
  return fd;
};

describe("parseRecipeForm", () => {
  it("builds a recipe from form fields", () => {
    const data = parseRecipeForm(
      form([
        ["title", " Soupe "],
        ["description", ""],
        ["servings", "4"],
        ["prepMinutes", "10"],
        ["cookMinutes", ""],
        ["tags", "Hiver, soupe"],
        ["ing_qty", "1/2"],
        ["ing_unit", "l"],
        ["ing_name", "eau"],
        ["ing_qty", "3"],
        ["ing_unit", ""],
        ["ing_name", "  "],
        ["steps", "Chauffer.\n\n  Servir.  \n\n"],
      ]),
    );
    expect(data).toEqual({
      title: "Soupe",
      description: null,
      servings: 4,
      prepMinutes: 10,
      cookMinutes: null,
      ingredients: [{ quantity: 0.5, unit: "l", name: "eau" }],
      steps: ["Chauffer.", "Servir."],
      tags: ["hiver", "soupe"],
    });
  });

  it("drops the guest count when noGauge is checked", () => {
    const data = parseRecipeForm(
      form([
        ["title", "Pain"],
        ["servings", "4"],
        ["noGauge", "on"],
      ]),
    );
    expect(data?.servings).toBeNull();
  });

  it("rejects a missing title", () => {
    expect(parseRecipeForm(form([["title", "  "]]))).toBeNull();
  });
});
