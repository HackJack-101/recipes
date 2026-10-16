import { getTranslations } from "next-intl/server";
import { requireKitchen } from "@/lib/permissions";
import { RecipeForm } from "@/components/RecipeForm";

export default async function NewRecipePage({ params }: { params: Promise<{ kitchenId: string }> }) {
  const { kitchenId } = await params;
  await requireKitchen(kitchenId);
  const t = await getTranslations("form");
  return (
    <>
      <h1>{t("newTitle")}</h1>
      <RecipeForm kitchenId={kitchenId} recipeId={null} />
    </>
  );
}
