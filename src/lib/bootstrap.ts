import bcrypt from "bcryptjs";
import { db } from "./db";

/** Creates the super admin at startup if none exists. Never overwrites an existing account. */
export async function ensureSuperAdmin() {
  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("[bootstrap] SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD not set: no super admin created.");
    return;
  }
  if ((await db.user.count({ where: { isSuperAdmin: true } })) > 0) return;

  await db.user.upsert({
    where: { email },
    update: { isSuperAdmin: true },
    create: {
      email,
      name: process.env.SUPERADMIN_NAME || "Admin",
      passwordHash: await bcrypt.hash(password, 12),
      isSuperAdmin: true,
    },
  });
  console.log(`[bootstrap] Super admin created: ${email}`);
}
