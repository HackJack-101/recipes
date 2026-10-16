"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { importRecipeAction } from "@/actions/recipes";

const MODES = ["url", "html", "text"] as const;

export function ImportForm({ kitchenId }: { kitchenId: string }) {
  const t = useTranslations("import");
  const [state, action, pending] = useActionState(importRecipeAction.bind(null, kitchenId), undefined);
  const [mode, setMode] = useState<(typeof MODES)[number]>("url");
  const modeLabel = { url: t("modeUrl"), html: t("modeHtml"), text: t("modeText") };

  return (
    <form action={action}>
      <div className="tabs" role="radiogroup">
        {MODES.map((m) => (
          <label key={m}>
            <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => setMode(m)} />
            <span>{modeLabel[m]}</span>
          </label>
        ))}
      </div>
      <div className="field">
        <label htmlFor={mode}>{t(mode)}</label>
        {mode === "url" ? (
          <input id="url" name="url" type="url" inputMode="url" placeholder="https://" required />
        ) : (
          <textarea id={mode} name={mode} required style={{ minHeight: "14rem" }} />
        )}
      </div>
      {state?.error && <p className="error" role="alert">{t(`errors.${state.error}` as "errors.empty")}</p>}
      <div className="actions">
        <button className="primary" disabled={pending}>{pending ? t("running") : t("submit")}</button>
      </div>
    </form>
  );
}
