import { getTranslations } from "next-intl/server";
import { requireKitchen } from "@/lib/permissions";
import { ImportForm } from "@/components/ImportForm";

export default async function ImportPage({ params }: { params: Promise<{ kitchenId: string }> }) {
  const { kitchenId } = await params;
  await requireKitchen(kitchenId);
  const t = await getTranslations("import");
  return (
    <>
      <h1>{t("title")}</h1>
      <p className="muted">{t("intro")}</p>
      <ImportForm kitchenId={kitchenId} />
    </>
  );
}
