"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { addMemberByEmail } from "@/actions/kitchen";

export function AddMemberForm({ kitchenId }: { kitchenId: string }) {
  const t = useTranslations("members");
  const [state, action, pending] = useActionState(addMemberByEmail.bind(null, kitchenId), undefined);
  return (
    <form action={action} className="card">
      <h3 style={{ marginTop: 0 }}>{t("add")}</h3>
      <div className="field">
        <label htmlFor="m-email">{t("email")}</label>
        <input id="m-email" name="email" type="email" required />
      </div>
      <div className="field">
        <label htmlFor="m-role">{t("role")}</label>
        <select id="m-role" name="role" defaultValue="MEMBER">
          <option value="MEMBER">{t("MEMBER")}</option>
          <option value="OWNER">{t("OWNER")}</option>
        </select>
      </div>
      {state?.error && (
        <p className="error" role="alert">
          {t("userNotFound")}
        </p>
      )}
      <button className="primary" disabled={pending}>
        {t("addButton")}
      </button>
    </form>
  );
}
