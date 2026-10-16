"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("language");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  return (
    <select
      aria-label={t("label")}
      value={locale}
      style={{ width: "auto" }}
      onChange={(e) =>
        router.replace({ pathname, query: Object.fromEntries(searchParams) }, { locale: e.target.value })
      }
    >
      {routing.locales.map((l) => (
        // Short codes keep the header on one line on phones; the full name is in the tooltip.
        <option key={l} value={l} title={t(l)}>
          {l.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
