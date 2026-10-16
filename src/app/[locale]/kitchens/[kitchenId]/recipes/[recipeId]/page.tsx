import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { deleteRecipe, togglePublic } from "@/actions/recipes";
import { requireRecipe } from "@/lib/permissions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { PhotoUpload } from "@/components/PhotoUpload";
import { RecipeView } from "@/components/RecipeView";

export default async function RecipePage({ params }: { params: Promise<{ kitchenId: string; recipeId: string }> }) {
  const { kitchenId, recipeId } = await params;
  const { recipe } = await requireRecipe(recipeId, kitchenId);
  const t = await getTranslations("recipe");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const publicPath = recipe.publicSlug ? `/${locale}/r/${recipe.publicSlug}` : null;

  return (
    <>
      <p>
        <Link href={`/kitchens/${recipe.kitchenId}`}>← {recipe.kitchen.name}</Link>
      </p>
      <div className="actions no-print">
        <Link className="btn" href={`/kitchens/${recipe.kitchenId}/recipes/${recipe.id}/edit`}>
          ✏️ {tc("edit")}
        </Link>
        <PhotoUpload recipeId={recipe.id} />
        <a className="btn" href={`/api/recipes/${recipe.id}/export?locale=${locale}`} download>
          ⬇ {t("export")}
        </a>
        <form action={togglePublic.bind(null, recipe.id)}>
          <button>{recipe.publicSlug ? t("unshare") : `🔗 ${t("share")}`}</button>
        </form>
      </div>
      {publicPath && (
        <div className="card no-print" style={{ marginBottom: "1rem" }}>
          <strong>{t("publicLink")}</strong>
          <p style={{ margin: ".25rem 0", wordBreak: "break-all" }}>
            <a href={publicPath}>{publicPath}</a>
          </p>
          <span className="muted">{t("sharedNote")}</span>
        </div>
      )}
      <RecipeView recipe={recipe} canManage />
      {recipe.sourceUrl && (
        <p className="muted">
          {t("source")}{" "}
          <a href={recipe.sourceUrl} rel="noopener noreferrer nofollow">
            {recipe.sourceUrl}
          </a>
        </p>
      )}
      <form action={deleteRecipe.bind(null, recipe.id)} className="actions no-print">
        <ConfirmButton className="btn danger">{tc("delete")}</ConfirmButton>
      </form>
    </>
  );
}
