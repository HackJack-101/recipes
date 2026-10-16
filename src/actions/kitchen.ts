"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireKitchenOwner } from "@/lib/permissions";
import type { FormState } from "./auth";

const refresh = () => revalidatePath("/", "layout");

/** Un propriétaire non super admin ne peut pas laisser sa cuisine sans propriétaire. */
async function wouldOrphan(kitchenId: string, userId: string, isSuperAdmin: boolean) {
  if (isSuperAdmin) return false;
  const target = await db.membership.findUnique({ where: { userId_kitchenId: { userId, kitchenId } } });
  if (target?.role !== "OWNER") return false;
  return (await db.membership.count({ where: { kitchenId, role: "OWNER" } })) <= 1;
}

export async function renameKitchen(kitchenId: string, formData: FormData) {
  await requireKitchenOwner(kitchenId);
  const name = String(formData.get("name") ?? "").trim().slice(0, 100);
  if (!name) return;
  await db.kitchen.update({ where: { id: kitchenId }, data: { name } });
  refresh();
}

/** Ajoute un utilisateur existant, par e-mail (la liste des comptes n'est pas exposée aux propriétaires). */
export async function addMemberByEmail(kitchenId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireKitchenOwner(kitchenId);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return { error: "userNotFound" };
  await db.membership.upsert({
    where: { userId_kitchenId: { userId: user.id, kitchenId } },
    update: {},
    create: { userId: user.id, kitchenId, role: formData.get("role") === "OWNER" ? "OWNER" : "MEMBER" },
  });
  refresh();
}

export async function setRole(kitchenId: string, userId: string, role: "OWNER" | "MEMBER") {
  const { user } = await requireKitchenOwner(kitchenId);
  if (role === "MEMBER" && (await wouldOrphan(kitchenId, userId, user.isSuperAdmin))) return;
  await db.membership.updateMany({ where: { kitchenId, userId }, data: { role } });
  refresh();
}

export async function removeMember(kitchenId: string, userId: string) {
  const { user } = await requireKitchenOwner(kitchenId);
  if (await wouldOrphan(kitchenId, userId, user.isSuperAdmin)) return;
  await db.membership.deleteMany({ where: { userId, kitchenId } });
  refresh();
}
