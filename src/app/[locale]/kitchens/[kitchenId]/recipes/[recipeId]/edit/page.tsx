import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireRecipe } from "@/lib/permissions";
import { ingredientsFromJson, stepsFromJson } from "@/lib/recipe-schema";
import { RecipeForm } from "@/components/RecipeForm";

export default async function EditRecipePage({ params }: { params: Promise<{ kitchenId: string; recipeId: string }> }) {
  const { kitchenId, recipeId } = await params;
  const { recipe } = await requireRecipe(recipeId, kitchenId);
  const t = await getTranslations("form");
  return (
    <>
      <p>
        <Link href={`/kitchens/${recipe.kitchenId}/recipes/${recipe.id}`}>← {recipe.title}</Link>
      </p>
      <h1>{t("editTitle")}</h1>
      <RecipeForm
        kitchenId={recipe.kitchenId}
        recipeId={recipe.id}
        initial={{
          title: recipe.title,
          description: recipe.description ?? "",
          servings: recipe.servings,
          prepMinutes: recipe.prepMinutes,
          cookMinutes: recipe.cookMinutes,
          ingredients: ingredientsFromJson(recipe.ingredients),
          steps: stepsFromJson(recipe.steps),
          tags: recipe.tags.map((x) => x.name),
        }}
      />
    </>
  );
}
