# Recipes

A self-hosted web app (Next.js + TypeScript + PostgreSQL) to store and share cooking recipes,
available in **French and English**. The UI is responsive: phone, tablet and desktop.

## Quick start

```bash
cp .env.example .env     # then edit: SESSION_SECRET, SUPERADMIN_*, ANTHROPIC_API_KEY
docker compose up -d --build
```

Open http://localhost:3000. On first start the super admin is created from
`SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` (an existing account is never overwritten).

### Published Docker image

The GitHub Action (`.github/workflows/docker.yml`) type-checks, lints and tests the project, then builds a multi-arch
image (amd64 + arm64) and publishes it to `ghcr.io/hackjack-101/recipes`
(tags `latest`, `sha-<commit>`, `vX.Y.Z`). To run it without building:

```bash
docker compose pull && docker compose up -d
```

The commit SHA of the running image is displayed in the footer of the UI.
Local build with the SHA: `GIT_SHA=$(git rev-parse HEAD) GIT_REPO=hackjack-101/recipes docker compose up -d --build`.

> The first time the image is published, GitHub creates the package as private: set it to public in the
> package settings if you want to pull it without authentication.

## Features

- **Users and kitchens**: the super admin creates users and kitchens. A user can belong to several
  kitchens; every recipe belongs to exactly one kitchen.
- **Roles**: super admin (everything), kitchen _owner_ (manages members, renames the kitchen) and _member_.
- **Recipes**: manual entry, or import from a **URL**, **raw HTML** or **plain text**. A Claude agent
  (`src/lib/importer.ts`, model set by `ANTHROPIC_MODEL`) extracts a structured recipe, suggests tags and
  reuses the kitchen's existing ones. The result opens in the editor for review.
- **Guest count**: the author sets the number of guests, or none ("no gauge"). Readers can rescale the
  quantities; without a gauge they get a free multiplier.
- **Tags and search**: per-kitchen tags, tag filter and text search.
- **Photos**: several per recipe, stored in the `uploads` volume.
- **Public sharing**: read-only link at `/<locale>/r/<slug>`, revocable at any time.
- **Export**: one recipe as `.md`, or a whole kitchen as a `.zip` (one Markdown file per recipe).

## Configuration

| Variable                                                     | Purpose                                                     |
| ------------------------------------------------------------ | ----------------------------------------------------------- |
| `POSTGRES_PASSWORD`                                          | Database password (Docker Compose)                          |
| `SESSION_SECRET`                                             | Session signing secret, 32+ characters                      |
| `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, `SUPERADMIN_NAME` | Super admin created at startup                              |
| `ANTHROPIC_API_KEY`                                          | Enables the AI import                                       |
| `ANTHROPIC_MODEL`                                            | Model used by the import agent (default `claude-haiku-5-5`) |
| `COOKIE_SECURE`                                              | Set to `true` when served over HTTPS                        |
| `PORT`                                                       | Host port (default `3000`)                                  |

Some websites block automated requests (HTTP 403). For those, open the page in your browser and use the
**HTML source** or **plain text** import instead.

## Development

```bash
docker compose -f compose.yaml -f compose.dev.yaml up -d db   # publishes Postgres on 127.0.0.1:5432
npm install        # DATABASE_URL in .env must point to localhost:5432
npx prisma migrate dev
npm run dev
```

Checks (also run in CI): `npm run typecheck`, `npm run lint`, `npm run format:check` (`npm run format` to fix), `npm test`.

Schema: `prisma/schema.prisma`. Translations: `messages/{fr,en}.json`.
