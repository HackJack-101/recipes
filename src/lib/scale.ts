const FRACTIONS: [number, string][] = [
  [0.25, "¼"], [1 / 3, "⅓"], [0.5, "½"], [2 / 3, "⅔"], [0.75, "¾"],
];

/** Formats a scaled quantity: common fractions, otherwise at most 2 decimals. */
export function formatQuantity(q: number): string {
  if (q <= 0) return "0";
  const whole = Math.floor(q + 1e-9);
  const frac = q - whole;
  if (frac < 0.02) return String(whole);
  if (frac > 0.98) return String(whole + 1);
  const hit = FRACTIONS.find(([v]) => Math.abs(v - frac) < 0.02);
  if (hit) return whole ? `${whole} ${hit[1]}` : hit[1];
  return String(Math.round(q * 100) / 100);
}
