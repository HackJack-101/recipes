import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();
  redirect({ href: user ? "/kitchens" : "/login", locale: await getLocale() });
}
