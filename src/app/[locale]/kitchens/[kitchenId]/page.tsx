import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { isKitchenOwner, requireKitchen } from "@/lib/permissions";

export default async function KitchenPage({
  params,
  searchParams,
}: {
  params: Promise<{ kitchenId: string }>;
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { kitchenId } = await params;
  const { q = "", tag = "" } = await searchParams;
  const { user, kitchen } = await requireKitchen(kitchenId);
  const t = await getTranslations("kitchen");
  const locale = await getLocale();
  const query = q.trim().slice(0, 100);

  const [recipes, tags, total, owner] = await Promise.all([
    db.recipe.findMany({
      where: {
        kitchenId,
        ...(tag ? { tags: { some: { name: tag } } } : {}),
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { tags: { some: { name: { contains: query.toLowerCase() } } } },
              ],
            }
          : {}),
      },
      include: {
        tags: { orderBy: { name: "asc" } },
        photos: { orderBy: { createdAt: "asc" }, take: 1, select: { id: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    db.tag.findMany({ where: { kitchenId }, orderBy: { name: "asc" } }),
    db.recipe.count({ where: { kitchenId } }),
    isKitchenOwner(user, kitchenId),
  ]);
  const href = (next: { q?: string; tag?: string }) => {
    const sp = new URLSearchParams();
    if (next.q) sp.set("q", next.q);
    if (next.tag) sp.set("tag", next.tag);
    return `/kitchens/${kitchenId}${sp.size ? `?${sp}` : ""}`;
  };

  return (
    <>
      <h1>{kitchen.name}</h1>
      <div className="actions">
        <Link className="btn primary" href={`/kitchens/${kitchenId}/recipes/new`}>
          ＋ {t("newRecipe")}
        </Link>
        <Link className="btn" href={`/kitchens/${kitchenId}/recipes/import`}>
          ✨ {t("import")}
        </Link>
        {total > 0 && (
          <a className="btn" href={`/api/kitchens/${kitchenId}/export?locale=${locale}`} download>
            ⬇ {t("exportAll")}
          </a>
        )}
        {owner && (
          <Link className="btn" href={`/kitchens/${kitchenId}/members`}>
            👥 {t("manage")}
          </Link>
        )}
      </div>

      {total > 0 && (
        <form className="search" action={`/${locale}/kitchens/${kitchenId}`}>
          <input type="search" name="q" defaultValue={query} placeholder={t("search")} aria-label={t("search")} />
          {tag && <input type="hidden" name="tag" value={tag} />}
          <button>{t("searchButton")}</button>
        </form>
      )}
      {tags.length > 0 && (
        <p className="tags tag-filter">
          <Link href={href({ q: query })} className={`tag${tag ? "" : " active"}`}>
            {t("allTags")}
          </Link>
          {tags.map((x) => (
            <Link key={x.id} href={href({ q: query, tag: x.name })} className={`tag${tag === x.name ? " active" : ""}`}>
              #{x.name}
            </Link>
          ))}
        </p>
      )}

      {total === 0 && <p className="muted">{t("noRecipes")}</p>}
      {total > 0 && recipes.length === 0 && (
        <p className="muted">
          {t("noMatch")} <Link href={href({})}>{t("clear")}</Link>
        </p>
      )}
      <div className="grid">
        {recipes.map((r) => {
          const minutes = (r.prepMinutes ?? 0) + (r.cookMinutes ?? 0);
          return (
            <Link key={r.id} href={`/kitchens/${kitchenId}/recipes/${r.id}`} className="card recipe-card">
              {r.photos[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="cover" src={`/api/photos/${r.photos[0].id}`} alt="" loading="lazy" />
              )}
              <h3>{r.title}</h3>
              <p className="meta muted">
                {minutes > 0 && <span>⏱ {t("totalTime", { n: minutes })}</span>}
                {r.publicSlug && <span className="badge">{t("shared")}</span>}
              </p>
              {r.tags.length > 0 && <p className="muted">{r.tags.map((x) => `#${x.name}`).join(" ")}</p>}
            </Link>
          );
        })}
      </div>
    </>
  );
}
