import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { logout } from "@/actions/auth";
import { getCurrentUser } from "@/lib/session";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { NavLink } from "./NavLink";

export async function Header() {
  const t = await getTranslations("common");
  const user = await getCurrentUser();
  return (
    <header className="header">
      <div className="container">
        <Link href="/" className="brand">
          🍲 {t("appName")}
        </Link>
        <nav className="nav">
          {user && <NavLink href="/kitchens">{t("kitchens")}</NavLink>}
          {user?.isSuperAdmin && <NavLink href="/admin">{t("admin")}</NavLink>}
          <LocaleSwitcher />
          {user && (
            <form action={logout}>
              <button className="link" type="submit">
                {t("logout")}
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
