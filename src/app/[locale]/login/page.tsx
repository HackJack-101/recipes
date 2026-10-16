import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect({ href: "/kitchens", locale: await getLocale() });
  const t = await getTranslations("auth");
  return (
    <>
      <h1 style={{ textAlign: "center" }}>{t("title")}</h1>
      <LoginForm />
    </>
  );
}
