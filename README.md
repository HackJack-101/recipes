# Recettes

Application web (Next.js + TypeScript) pour héberger des recettes de cuisine, en français et en anglais.
Interface responsive : téléphone, tablette, ordinateur.

## Démarrage

```bash
cp .env.example .env     # puis éditer : SESSION_SECRET, SUPERADMIN_*, ANTHROPIC_API_KEY
docker compose up -d --build
```

Ouvrir http://localhost:3000. Au premier démarrage, le super admin est créé depuis
`SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` (jamais écrasé ensuite).

### Image Docker publiée

La GitHub Action (`.github/workflows/docker.yml`) construit l'image (amd64 + arm64) et la publie sur
`ghcr.io/hackjack-101/recipes` (tags `latest`, `sha-<commit>`, `vX.Y.Z`). Pour l'utiliser sans compiler :

```bash
docker compose pull && docker compose up -d
```

Le SHA du commit de l'image en cours d'exécution est affiché en pied de page de l'interface.
En local : `GIT_SHA=$(git rev-parse HEAD) GIT_REPO=hackjack-101/recipes docker compose up -d --build`.

## Fonctionnement

- **Super admin** : crée les utilisateurs et les cuisines, rattache les utilisateurs aux cuisines (page Administration).
- **Utilisateur** : peut appartenir à plusieurs cuisines ; chaque recette appartient à une cuisine.
- **Recettes** : saisie manuelle, ou import par URL / code source HTML / texte libre. Un agent Claude
  (`src/lib/importer.ts`, modèle réglable via `ANTHROPIC_MODEL`) extrait une recette structurée ; elle s'ouvre ensuite en édition pour relecture.
- **Convives** : chaque recette a un nombre de convives défini par son auteur, ou aucun (« pas de jauge »).
  Le lecteur peut recalculer les quantités ; sans jauge, il dispose d'un multiplicateur libre.
- **Photos** : plusieurs par recette, stockées dans le volume `uploads`.
- **Partage public** : lien `/<langue>/r/<slug>` en lecture seule, révocable.
- **Export** : une recette en `.md`, ou toute une cuisine en `.zip` (un fichier Markdown par recette).
- **Propriétaires de cuisine** : gèrent les membres de leur cuisine (ajout par e-mail, rôles) et la renomment.
- **Tags et recherche** : tags par cuisine (proposés par l'agent à l'import), filtre par tag et recherche texte.

## Développement

```bash
docker compose up -d db
npm install && npx prisma migrate dev && npm run dev
```

Schéma : `prisma/schema.prisma`. Traductions : `messages/{fr,en}.json`.
En production derrière HTTPS, mettre `COOKIE_SECURE=true`.
