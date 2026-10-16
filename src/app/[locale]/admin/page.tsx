import { getTranslations } from "next-intl/server";
import { addMember, createKitchen } from "@/actions/admin";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/permissions";
import { CreateUserForm } from "@/components/CreateUserForm";

export default async function AdminPage() {
  await requireSuperAdmin();
  const t = await getTranslations("admin");
  const [users, kitchens] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "asc" } }),
    db.kitchen.findMany({ orderBy: { name: "asc" }, include: { memberships: { include: { user: true } } } }),
  ]);
  return (
    <>
      <h1>{t("title")}</h1>

      <h2>{t("kitchens")}</h2>
      <div className="stack">
        {kitchens.map((k) => {
          const memberIds = new Set(k.memberships.map((m) => m.userId));
          const candidates = users.filter((u) => !memberIds.has(u.id));
          return (
            <div className="card stack" key={k.id}>
              <h3 style={{ margin: 0 }}>{k.name}</h3>
              <div className="members" aria-label={t("members")}>
                {k.memberships.map((m) => (
                  <span key={m.userId} className="chip" style={{ paddingRight: ".75rem" }}>
                    {m.user.name}{m.role === "OWNER" && <> <span className="badge">{t("owner")}</span></>}
                  </span>
                ))}
              </div>
              <Link href={`/kitchens/${k.id}/members`}>{t("manage")} →</Link>
              {candidates.length > 0 && (
                <form action={addMember.bind(null, k.id)} className="row">
                  <select name="userId" aria-label={t("addMember")} style={{ flex: "1 1 12rem", width: "auto" }} defaultValue="">
                    <option value="" disabled>{t("addMember")}</option>
                    {candidates.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                  <select name="role" aria-label={t("members")} defaultValue="MEMBER" style={{ width: "auto" }}>
                    <option value="MEMBER">{t("roleMember")}</option>
                    <option value="OWNER">{t("roleOwner")}</option>
                  </select>
                  <button>{t("add")}</button>
                </form>
              )}
            </div>
          );
        })}
        <form action={createKitchen} className="card row">
          <input name="name" placeholder={t("kitchenName")} aria-label={t("kitchenName")} required style={{ flex: "1 1 12rem", width: "auto" }} />
          <button className="primary">{t("newKitchen")}</button>
        </form>
      </div>

      <h2>{t("users")}</h2>
      <div className="card" style={{ overflowX: "auto", marginBottom: "1rem" }}>
        <table className="table">
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}{u.isSuperAdmin && <> <span className="badge">{t("superAdmin")}</span></>}</td>
                <td className="muted">{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CreateUserForm />
    </>
  );
}
