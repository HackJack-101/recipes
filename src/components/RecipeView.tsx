import { getTranslations } from "next-intl/server";
import type { Recipe, RecipePhoto } from "@prisma/client";
import { ingredientsFromJson, stepsFromJson } from "@/lib/recipe-schema";
import { deletePhoto } from "@/actions/recipes";
import { ConfirmButton } from "./ConfirmButton";
import { Scaler } from "./Scaler";

export async function RecipeView({
  recipe,
  canManage = false,
}: {
  recipe: Recipe & { photos: RecipePhoto[]; tags: { name: string }[] };
  canManage?: boolean;
}) {
  const t = await getTranslations("recipe");
  const times = [
    recipe.prepMinutes != null && t("prep", { n: recipe.prepMinutes }),
    recipe.cookMinutes != null && t("cook", { n: recipe.cookMinutes }),
    recipe.servings != null && t("servingsFor", { count: recipe.servings }),
  ].filter(Boolean);

  return (
    <article>
      <h1>{recipe.title}</h1>
      {times.length > 0 && <p className="muted">{times.join(" · ")}</p>}
      {recipe.tags.length > 0 && (
        <p className="tags">
          {recipe.tags.map((tag) => (
            <span className="tag" key={tag.name}>
              #{tag.name}
            </span>
          ))}
        </p>
      )}
      {recipe.description && <p>{recipe.description}</p>}
      {recipe.photos.length > 0 && (
        <div className="photos">
          {recipe.photos.map((p) => (
            <div className="photo" key={p.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/photos/${p.id}`} alt={recipe.title} loading="lazy" />
              {canManage && (
                <form action={deletePhoto.bind(null, p.id)}>
                  <ConfirmButton className="danger">✕</ConfirmButton>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="recipe-body">
        <section className="recipe-side">
          <h2>{t("ingredients")}</h2>
          <Scaler ingredients={ingredientsFromJson(recipe.ingredients)} servings={recipe.servings} />
        </section>
        <section>
          <h2>{t("steps")}</h2>
          <ol className="steps">
            {stepsFromJson(recipe.steps).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
