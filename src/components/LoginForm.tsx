"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { keepValues } from "@/lib/keep-values";
import { login } from "@/actions/auth";

export function LoginForm() {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} onSubmit={keepValues(action)} className="card narrow">
      <div className="field">
        <label htmlFor="email">{t("email")}</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className="field">
        <label htmlFor="password">{t("password")}</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state?.error && (
        <p className="error" role="alert">
          {t("invalid")}
        </p>
      )}
      <button className="primary" style={{ width: "100%" }} disabled={pending}>
        {t("submit")}
      </button>
    </form>
  );
}
