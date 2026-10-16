import { describe, expect, it } from "vitest";
import { formatQuantity } from "./scale";

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
