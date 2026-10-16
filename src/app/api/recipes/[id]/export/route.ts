import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { fileSlug, recipeToMarkdown } from "@/lib/export";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const recipe = await db.recipe.findFirst({
    include: { tags: true },
    where: { id, ...(user.isSuperAdmin ? {} : { kitchen: { memberships: { some: { userId: user.id } } } }) },
  });
  if (!recipe) return new Response("Not found", { status: 404 });
  const locale = new URL(req.url).searchParams.get("locale") ?? "fr";
  return new Response(recipeToMarkdown(recipe, locale), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${fileSlug(recipe.title)}.md"`,
    },
  });
}
