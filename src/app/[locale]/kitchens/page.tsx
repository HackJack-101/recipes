import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/permissions";

export default async function KitchensPage() {
  const user = await requireUser();
  const t = await getTranslations("kitchens");
  const kitchens = await db.kitchen.findMany({
    where: user.isSuperAdmin ? {} : { memberships: { some: { userId: user.id } } },
    include: { _count: { select: { recipes: true } } },
    orderBy: { name: "asc" },
  });
  return (
    <>
      <h1>{t("title")}</h1>
      {kitchens.length === 0 && <p className="muted">{t("empty")}</p>}
      <div className="grid">
        {kitchens.map((k) => (
          <Link key={k.id} href={`/kitchens/${k.id}`} className="card">
            <h3>{k.name}</h3>
            <span className="muted">{t("recipeCount", { count: k._count.recipes })}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
