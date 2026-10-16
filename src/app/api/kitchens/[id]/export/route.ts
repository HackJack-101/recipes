import { strToU8, zipSync } from "fflate";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { fileSlug, recipeToMarkdown } from "@/lib/export";

/** Bulk export: one Markdown file per recipe, bundled in a ZIP archive. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const kitchen = await db.kitchen.findFirst({
    where: user.isSuperAdmin ? { id } : { id, memberships: { some: { userId: user.id } } },
    include: { recipes: { orderBy: { title: "asc" }, include: { tags: true } } },
  });
  if (!kitchen) return new Response("Not found", { status: 404 });
  const locale = new URL(req.url).searchParams.get("locale") ?? "fr";

  const files: Record<string, Uint8Array> = {};
  for (const r of kitchen.recipes) {
    let name = `${fileSlug(r.title)}.md`;
    for (let n = 2; name in files; n++) name = `${fileSlug(r.title)}-${n}.md`;
    files[name] = strToU8(recipeToMarkdown(r, locale));
  }
  return new Response(Buffer.from(zipSync(files)), {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${fileSlug(kitchen.name)}.zip"`,
    },
  });
}
