import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireKitchen } from "@/lib/permissions";
import { RecipeForm } from "@/components/RecipeForm";

export default async function NewRecipePage({ params }: { params: Promise<{ kitchenId: string }> }) {
  const { kitchenId } = await params;
  const { kitchen } = await requireKitchen(kitchenId);
  const t = await getTranslations("form");
  return (
    <>
      <p>
        <Link href={`/kitchens/${kitchen.id}`}>← {kitchen.name}</Link>
      </p>
      <h1>{t("newTitle")}</h1>
      <RecipeForm kitchenId={kitchenId} recipeId={null} />
    </>
  );
}
