import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { removeMember, renameKitchen, setRole } from "@/actions/kitchen";
import { db } from "@/lib/db";
import { requireKitchenOwner } from "@/lib/permissions";
import { AddMemberForm } from "@/components/AddMemberForm";
import { ConfirmButton } from "@/components/ConfirmButton";

export default async function MembersPage({ params }: { params: Promise<{ kitchenId: string }> }) {
  const { kitchenId } = await params;
  const { kitchen } = await requireKitchenOwner(kitchenId);
  const t = await getTranslations("members");
  const members = await db.membership.findMany({
    where: { kitchenId },
    include: { user: true },
    orderBy: [{ role: "asc" }, { user: { name: "asc" } }],
  });
  return (
    <>
      <p>
        <Link href={`/kitchens/${kitchenId}`}>← {kitchen.name}</Link>
      </p>
      <h1>{t("title")}</h1>

      <form action={renameKitchen.bind(null, kitchenId)} className="card row" style={{ marginBottom: "1rem" }}>
        <input
          name="name"
          defaultValue={kitchen.name}
          aria-label={t("kitchenName")}
          required
          style={{ flex: "1 1 12rem", width: "auto" }}
        />
        <button>{t("rename")}</button>
      </form>

      <div className="stack" style={{ marginBottom: "1rem" }}>
        {members.map((m) => (
          <div className="card row" key={m.userId}>
            <div style={{ marginRight: "auto" }}>
              <strong>{m.user.name}</strong> {m.role === "OWNER" && <span className="badge">{t("OWNER")}</span>}
              <div className="muted" style={{ wordBreak: "break-all" }}>
                {m.user.email}
              </div>
            </div>
            <form action={setRole.bind(null, kitchenId, m.userId, m.role === "OWNER" ? "MEMBER" : "OWNER")}>
              <button>{m.role === "OWNER" ? t("demote") : t("promote")}</button>
            </form>
            <form action={removeMember.bind(null, kitchenId, m.userId)}>
              <ConfirmButton className="danger">{t("remove")}</ConfirmButton>
            </form>
          </div>
        ))}
      </div>
      <AddMemberForm kitchenId={kitchenId} />
    </>
  );
}
