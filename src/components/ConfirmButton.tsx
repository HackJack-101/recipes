"use client";

import { useTranslations } from "next-intl";

/** Submit button that asks for confirmation (default: "Delete permanently?") before submitting the parent form. */
export function ConfirmButton({
  children,
  className,
  label,
  question,
}: {
  children: React.ReactNode;
  className?: string;
  /** Accessible name, for icon-only buttons. */
  label?: string;
  question?: string;
}) {
  const t = useTranslations("common");
  return (
    <button
      type="submit"
      className={className}
      aria-label={label}
      onClick={(e) => {
        if (!confirm(question ?? t("confirmDelete"))) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
