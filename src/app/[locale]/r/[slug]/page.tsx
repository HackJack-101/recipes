import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { RecipeView } from "@/components/RecipeView";

export const dynamic = "force-dynamic";

const find = (slug: string) =>
  db.recipe.findUnique({
    where: { publicSlug: slug },
    include: { photos: { orderBy: { createdAt: "asc" } }, tags: { orderBy: { name: "asc" } } },
  });

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const recipe = await find((await params).slug);
  return { title: recipe?.title, robots: { index: false } };
}

/** Public page: no authentication, read-only. */
export default async function PublicRecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const recipe = await find((await params).slug);
  if (!recipe) notFound();
  const t = await getTranslations("recipe");
  return (
    <>
      <p className="muted">{t("sharedFrom")}</p>
      <RecipeView recipe={recipe!} />
    </>
  );
}
