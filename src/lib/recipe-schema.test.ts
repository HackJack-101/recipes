import { describe, expect, it } from "vitest";
import { ingredientsFromJson, parseTags, stepsFromJson } from "./recipe-schema";

describe("parseTags", () => {
  it("lowercases, trims and deduplicates", () => {
    expect(parseTags("Dessert, Rapide ,dessert")).toEqual(["dessert", "rapide"]);
  });

  it("accepts arrays and collapses whitespace", () => {
    expect(parseTags(["  Petit   déjeuner ", ""])).toEqual(["petit déjeuner"]);
  });

  it("keeps at most 20 tags of 30 characters", () => {
    const tags = parseTags(Array.from({ length: 30 }, (_, i) => `tag${i}`));
    expect(tags).toHaveLength(20);
    expect(parseTags("x".repeat(50))[0]).toHaveLength(30);
  });
});

describe("JSON readers", () => {
  it("return the data when valid", () => {
    const ing = [{ quantity: 1, unit: "g", name: "sel" }];
    expect(ingredientsFromJson(ing)).toEqual(ing);
    expect(stepsFromJson(["a", "b"])).toEqual(["a", "b"]);
  });

  it("return an empty list when invalid", () => {
    expect(ingredientsFromJson("nope")).toEqual([]);
    expect(stepsFromJson([1, 2])).toEqual([]);
  });
});
