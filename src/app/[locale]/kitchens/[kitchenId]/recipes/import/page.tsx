import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireKitchen } from "@/lib/permissions";
import { ImportForm } from "@/components/ImportForm";

export default async function ImportPage({ params }: { params: Promise<{ kitchenId: string }> }) {
  const { kitchenId } = await params;
  const { kitchen } = await requireKitchen(kitchenId);
  const t = await getTranslations("import");
  return (
    <>
      <p>
        <Link href={`/kitchens/${kitchen.id}`}>← {kitchen.name}</Link>
      </p>
      <h1>{t("title")}</h1>
      <p className="muted">{t("intro")}</p>
      <ImportForm kitchenId={kitchenId} />
    </>
  );
}
