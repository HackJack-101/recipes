"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { saveRecipe } from "@/actions/recipes";
import { quantityInput } from "@/lib/recipe-form";
import type { Ingredient } from "@/lib/recipe-schema";

type Initial = {
  title: string;
  description: string;
  servings: number | null;
  prepMinutes: number | null;
  cookMinutes: number | null;
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
};

const EMPTY: Initial = {
  title: "",
  description: "",
  servings: 4,
  prepMinutes: null,
  cookMinutes: null,
  ingredients: [],
  steps: [],
  tags: [],
};

export function RecipeForm({
  kitchenId,
  recipeId,
  initial = EMPTY,
}: {
  kitchenId: string;
  recipeId: string | null;
  initial?: Initial;
}) {
  const t = useTranslations("form");
  const tc = useTranslations("common");
  const [state, action, pending] = useActionState(saveRecipe.bind(null, kitchenId, recipeId), undefined);
  const [noGauge, setNoGauge] = useState(initial.servings === null && recipeId !== null);
  const [rows, setRows] = useState<{ id: number; ing: Ingredient }[]>(() =>
    (initial.ingredients.length ? initial.ingredients : [{ quantity: null, unit: null, name: "" }]).map((ing, id) => ({
      id,
      ing,
    })),
  );
  const [nextId, setNextId] = useState(rows.length);

  return (
    <form action={action}>
      <div className="field">
        <label htmlFor="title">{t("title")}</label>
        <input id="title" name="title" defaultValue={initial.title} required maxLength={200} />
      </div>
      <div className="field">
        <label htmlFor="description">{t("description")}</label>
        <textarea
          id="description"
          name="description"
          defaultValue={initial.description}
          style={{ minHeight: "4.5rem" }}
        />
      </div>

      <div className="field">
        <label htmlFor="tags">{t("tags")}</label>
        <input
          id="tags"
          name="tags"
          defaultValue={initial.tags.join(", ")}
          placeholder={t("tagsHint")}
          autoCapitalize="none"
        />
      </div>

      <div className="field">
        <label htmlFor="servings">{t("servings")}</label>
        <input
          id="servings"
          name="servings"
          type="number"
          inputMode="numeric"
          min={1}
          max={500}
          defaultValue={initial.servings ?? 4}
          disabled={noGauge}
        />
        <label className="check">
          <input type="checkbox" name="noGauge" checked={noGauge} onChange={(e) => setNoGauge(e.target.checked)} />
          {t("noGauge")}
        </label>
      </div>
      <div className="two">
        <div className="field">
          <label htmlFor="prepMinutes">{t("prep")}</label>
          <input
            id="prepMinutes"
            name="prepMinutes"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={initial.prepMinutes ?? ""}
          />
        </div>
        <div className="field">
          <label htmlFor="cookMinutes">{t("cook")}</label>
          <input
            id="cookMinutes"
            name="cookMinutes"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={initial.cookMinutes ?? ""}
          />
        </div>
      </div>

      <h2>{t("ingredients")}</h2>
      {rows.map(({ id, ing }) => (
        <div className="ing-row" key={id}>
          <input
            name="ing_qty"
            aria-label={t("quantity")}
            placeholder={t("quantity")}
            inputMode="decimal"
            defaultValue={quantityInput(ing.quantity)}
          />
          <input name="ing_unit" aria-label={t("unit")} placeholder={t("unit")} defaultValue={ing.unit ?? ""} />
          <input
            name="ing_name"
            className="ing-name"
            aria-label={t("name")}
            placeholder={t("name")}
            defaultValue={ing.name}
          />
          <button
            type="button"
            className="danger"
            aria-label={t("removeIngredient")}
            onClick={() => setRows((r) => r.filter((x) => x.id !== id))}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          setRows((r) => [...r, { id: nextId, ing: { quantity: null, unit: null, name: "" } }]);
          setNextId(nextId + 1);
        }}
      >
        + {t("addIngredient")}
      </button>

      <div className="field" style={{ marginTop: "1.5rem" }}>
        <label htmlFor="steps">{t("steps")}</label>
        <textarea id="steps" name="steps" defaultValue={initial.steps.join("\n\n")} style={{ minHeight: "12rem" }} />
      </div>

      {state?.error && (
        <p className="error" role="alert">
          {t("invalid")}
        </p>
      )}
      <div className="actions">
        <button className="primary" disabled={pending}>
          {tc("save")}
        </button>
      </div>
    </form>
  );
}
