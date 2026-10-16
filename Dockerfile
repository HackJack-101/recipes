FROM node:24-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
# Placed after the build so earlier layers stay cached.
# Displayed in the UI footer (src/components/Footer.tsx).
ARG GIT_SHA=dev
ARG GIT_REPO=
ENV GIT_SHA=$GIT_SHA GIT_REPO=$GIT_REPO NODE_ENV=production
EXPOSE 3000
# Apply migrations, then start. The super admin is created at boot (instrumentation.ts).
CMD ["sh", "-c", "npx prisma migrate deploy && npx next start -H 0.0.0.0 -p 3000"]
