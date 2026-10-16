"use client";

import { useTranslations } from "next-intl";

/** Bouton de soumission qui demande confirmation avant d'envoyer le formulaire parent. */
export function ConfirmButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const t = useTranslations("common");
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(t("confirmDelete"))) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
