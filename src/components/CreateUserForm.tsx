"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createUser } from "@/actions/admin";

export function CreateUserForm() {
  const t = useTranslations("admin");
  const [state, action, pending] = useActionState(createUser, undefined);
  return (
    <form action={action} className="card">
      <h3 style={{ marginTop: 0 }}>{t("newUser")}</h3>
      <div className="field"><label htmlFor="u-name">{t("name")}</label><input id="u-name" name="name" required /></div>
      <div className="field"><label htmlFor="u-email">{t("email")}</label><input id="u-email" name="email" type="email" required /></div>
      <div className="field"><label htmlFor="u-pw">{t("password")}</label><input id="u-pw" name="password" type="password" minLength={8} autoComplete="new-password" required /></div>
      {state?.error && <p className="error" role="alert">{t(state.error as "invalid" | "emailTaken")}</p>}
      <button className="primary" disabled={pending}>{t("create")}</button>
    </form>
  );
}
