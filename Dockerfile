FROM node:24-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
# Placés après le build pour ne pas invalider le cache des couches précédentes.
# Affichés dans le pied de page de l'interface (src/components/Footer.tsx).
ARG GIT_SHA=dev
ARG GIT_REPO=
ENV GIT_SHA=$GIT_SHA GIT_REPO=$GIT_REPO NODE_ENV=production
EXPOSE 3000
# Applique les migrations puis démarre. Le super admin est créé au boot (instrumentation.ts).
CMD ["sh", "-c", "npx prisma migrate deploy && npx next start -H 0.0.0.0 -p 3000"]
