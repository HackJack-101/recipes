"use client";

import { useTranslations } from "next-intl";

/** Submit button that asks for confirmation before submitting the parent form. */
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
