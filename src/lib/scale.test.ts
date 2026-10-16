import { describe, expect, it } from "vitest";
import { clampScale, formatQuantity } from "./scale";

describe("formatQuantity", () => {
  it("prints whole numbers", () => {
    expect(formatQuantity(3)).toBe("3");
    expect(formatQuantity(2.99)).toBe("3");
    expect(formatQuantity(0)).toBe("0");
  });

  it("uses common fractions", () => {
    expect(formatQuantity(0.5)).toBe("½");
    expect(formatQuantity(1.25)).toBe("1 ¼");
    expect(formatQuantity(2 / 3)).toBe("⅔");
  });

  it("falls back to two decimals", () => {
    expect(formatQuantity(1.4)).toBe("1.4");
    expect(formatQuantity(0.123)).toBe("0.12");
  });
});

describe("clampScale", () => {
  it("keeps whole guests between 1 and 500", () => {
    expect(clampScale(3.6, 4)).toBe(4);
    expect(clampScale(0, 4)).toBe(1);
    expect(clampScale(900, 4)).toBe(500);
  });

  it("keeps a free multiplier between 0.25 and 100", () => {
    expect(clampScale(0.5, null)).toBe(0.5);
    expect(clampScale(0, null)).toBe(0.25);
    expect(clampScale(1000, null)).toBe(100);
  });
});
