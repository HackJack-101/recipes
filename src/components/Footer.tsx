import { getTranslations } from "next-intl/server";

/** Version of the running Docker image (commit SHA injected at build time). */
export async function Footer() {
  const t = await getTranslations("common");
  const sha = process.env.GIT_SHA || "dev";
  const repo = process.env.GIT_REPO;
  const label = sha === "dev" ? "dev" : sha.slice(0, 7);
  return (
    <footer className="container footer no-print">
      <span className="muted">
        {t("version")} :{" "}
        {repo && sha !== "dev" ? (
          <a href={`https://github.com/${repo}/commit/${sha}`} title={sha} rel="noopener noreferrer">
            <code>{label}</code>
          </a>
        ) : (
          <code title={sha}>{label}</code>
        )}
      </span>
    </footer>
  );
}
