"use server";

import bcrypt from "bcryptjs";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";

export type FormState = { error?: string } | undefined;

// Dummy hash so the response time does not reveal whether the email exists.
const DUMMY_HASH = bcrypt.hashSync("dummy-password", 12);

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await db.user.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return { error: "invalid" };
  await createSession(user.id);
  redirect({ href: "/", locale: await getLocale() });
}

export async function logout() {
  await destroySession();
  redirect({ href: "/login", locale: await getLocale() });
}
