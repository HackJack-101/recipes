"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Ingredient } from "@/lib/recipe-schema";
import { formatQuantity } from "@/lib/scale";

/**
 * With a guest count: the reader picks a number of guests and quantities scale proportionally to `servings`.
 * Without one (servings = null): original quantities plus a free multiplier.
 */
export function Scaler({ ingredients, servings }: { ingredients: Ingredient[]; servings: number | null }) {
  const t = useTranslations("recipe");
  const base = servings ?? 1;
  const [target, setTarget] = useState(base);
  const factor = target / base;
  // Functional update: several quick clicks add up instead of restarting from the same value.
  const clamp = (fn: (n: number) => number) =>
    setTarget((cur) => {
      const n = fn(cur);
      return servings ? Math.max(1, Math.min(500, Math.round(n))) : Math.max(0.25, Math.min(100, n));
    });
  const step = servings ? 1 : 0.5;

  return (
    <div>
      {servings === null && <p className="muted">{t("noGauge")}</p>}
      <div className="scaler">
        <label htmlFor="scale" style={{ margin: 0 }}>{servings ? t("guests") : t("multiplier")}</label>
        <button type="button" className="step-btn" aria-label="−" onClick={() => clamp((n) => n - step)}>−</button>
        <input id="scale" type="number" inputMode="decimal" min={servings ? 1 : 0.25} step={step} value={target}
          onChange={(e) => e.target.value !== "" && clamp(() => Number(e.target.value))} />
        <button type="button" className="step-btn" aria-label="+" onClick={() => clamp((n) => n + step)}>+</button>
        {target !== base && <button type="button" className="link" onClick={() => setTarget(base)}>{t("reset")}</button>}
      </div>
      <ul className="ing-list">
        {ingredients.map((i, n) => (
          <li key={n}>
            {i.quantity !== null && <b>{formatQuantity(i.quantity * factor)} </b>}
            {i.unit && `${i.unit} `}
            {i.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
