import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { readPhotoFile } from "@/lib/storage";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photo = await db.recipePhoto.findUnique({ where: { id }, include: { recipe: true } });
  if (!photo) return new Response("Not found", { status: 404 });

  // Photo visible si la recette est publique, ou si l'utilisateur a accès à la cuisine.
  let allowed = photo.recipe.publicSlug !== null;
  if (!allowed) {
    const user = await getCurrentUser();
    if (user) {
      allowed =
        user.isSuperAdmin ||
        (await db.membership.count({ where: { userId: user.id, kitchenId: photo.recipe.kitchenId } })) > 0;
    }
  }
  if (!allowed) return new Response("Not found", { status: 404 });

  try {
    const data = await readPhotoFile(photo.filename);
    return new Response(new Uint8Array(data), {
      headers: {
        "content-type": photo.mimeType,
        "cache-control": photo.recipe.publicSlug ? "public, max-age=3600" : "private, max-age=3600",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
