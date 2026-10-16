"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/permissions";
import type { FormState } from "./auth";

const userSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(200),
});

export async function createUser(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireSuperAdmin();
  const parsed = userSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "invalid" };
  const { name, email, password } = parsed.data;
  if (await db.user.findUnique({ where: { email } })) return { error: "emailTaken" };
  await db.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 12) } });
  revalidatePath("/", "layout");
}

export async function createKitchen(formData: FormData) {
  await requireSuperAdmin();
  const name = String(formData.get("name") ?? "").trim().slice(0, 100);
  if (!name) return;
  await db.kitchen.create({ data: { name } });
  revalidatePath("/", "layout");
}

export async function addMember(kitchenId: string, formData: FormData) {
  await requireSuperAdmin();
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;
  await db.membership.upsert({
    where: { userId_kitchenId: { userId, kitchenId } },
    update: {},
    create: { userId, kitchenId, role: formData.get("role") === "OWNER" ? "OWNER" : "MEMBER" },
  });
  revalidatePath("/", "layout");
}
