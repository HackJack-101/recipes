import { getTranslations } from "next-intl/server";
import { requireRecipe } from "@/lib/permissions";
import { ingredientsFromJson, stepsFromJson } from "@/lib/recipe-schema";
import { RecipeForm } from "@/components/RecipeForm";

export default async function EditRecipePage({ params }: { params: Promise<{ recipeId: string }> }) {
  const { recipeId } = await params;
  const { recipe } = await requireRecipe(recipeId);
  const t = await getTranslations("form");
  return (
    <>
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
