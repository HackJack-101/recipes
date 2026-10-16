"use client";

import { useActionState, useRef } from "react";
import { useTranslations } from "next-intl";
import { uploadPhoto } from "@/actions/recipes";

export function PhotoUpload({ recipeId }: { recipeId: string }) {
  const t = useTranslations("recipe");
  const [state, action, pending] = useActionState(uploadPhoto.bind(null, recipeId), undefined);
  const form = useRef<HTMLFormElement>(null);
  return (
    <form ref={form} action={action} className="no-print">
      <label className="btn" style={{ cursor: "pointer", marginBottom: 0 }}>
        📷 {t("addPhoto")}
        {/* capture: sur téléphone, propose directement l'appareil photo ou la galerie */}
        <input type="file" name="photo" accept="image/jpeg,image/png,image/webp,image/gif" hidden disabled={pending}
          onChange={() => form.current?.requestSubmit()} />
      </label>
      {state?.error && <p className="error" role="alert">{t("photoInvalid")}</p>}
    </form>
  );
}
