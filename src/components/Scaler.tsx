"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Ingredient } from "@/lib/recipe-schema";
import { clampScale, formatQuantity } from "@/lib/scale";

/**
 * With a guest count: the reader picks a number of guests and quantities scale proportionally to `servings`.
 * Without one (servings = null): original quantities plus a free multiplier.
 */
export function Scaler({ ingredients, servings }: { ingredients: Ingredient[]; servings: number | null }) {
  const t = useTranslations("recipe");
  const base = servings ?? 1;
  const [target, setTarget] = useState(base);
  // Text being typed, so the field can be cleared or hold "0." without being snapped back to a valid value.
  const [draft, setDraft] = useState<string | null>(null);
  const factor = target / base;
  const step = servings ? 1 : 0.5;
  // Functional update: several quick clicks add up instead of restarting from the same value.
  const add = (delta: number) => {
    setDraft(null);
    setTarget((cur) => clampScale(cur + delta, servings));
  };
  const type = (value: string) => {
    setDraft(value);
    const n = Number(value);
    if (value !== "" && n > 0) setTarget(clampScale(n, servings));
  };

  return (
    <div>
      {servings === null && <p className="muted">{t("noGauge")}</p>}
      <div className="scaler">
        <label htmlFor="scale" style={{ margin: 0 }}>
          {servings ? t("guests") : t("multiplier")}
        </label>
        <button type="button" className="step-btn" aria-label={t("less")} onClick={() => add(-step)}>
          −
        </button>
        <input
          id="scale"
          type="number"
          inputMode="decimal"
          min={servings ? 1 : 0.25}
          step={step}
          value={draft ?? target}
          onChange={(e) => type(e.target.value)}
          onBlur={() => setDraft(null)}
        />
        <button type="button" className="step-btn" aria-label={t("more")} onClick={() => add(step)}>
          +
        </button>
        {target !== base && (
          <button
            type="button"
            className="link"
            onClick={() => {
              setDraft(null);
              setTarget(base);
            }}
          >
            {t("reset")}
          </button>
        )}
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
