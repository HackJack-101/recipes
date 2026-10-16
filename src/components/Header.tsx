import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { logout } from "@/actions/auth";
import { getCurrentUser } from "@/lib/session";
import { LocaleSwitcher } from "./LocaleSwitcher";

export async function Header() {
  const t = await getTranslations("common");
  const user = await getCurrentUser();
  return (
    <header className="header">
      <div className="container">
        <Link href="/" className="brand">🍲 {t("appName")}</Link>
        <nav className="nav">
          {user && <Link href="/kitchens">{t("kitchens")}</Link>}
          {user?.isSuperAdmin && <Link href="/admin">{t("admin")}</Link>}
          <LocaleSwitcher />
          {user && (
            <form action={logout}>
              <button className="link" type="submit">{t("logout")}</button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
