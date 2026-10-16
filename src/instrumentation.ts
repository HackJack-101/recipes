export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureSuperAdmin } = await import("./lib/bootstrap");
    await ensureSuperAdmin().catch((e) => console.error("[bootstrap] échec", e));
  }
}
