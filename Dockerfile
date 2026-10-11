# syntax=docker/dockerfile:1
# Resolvo: imagen única (API + web). Construye el front y la API y deja solo lo necesario para producción.

ARG NODE_IMAGE=node:24.13.1-alpine
ARG PNPM_VERSION=10.33.0

FROM ${NODE_IMAGE} AS base
ARG PNPM_VERSION
RUN apk add --no-cache openssl && npm install -g pnpm@${PNPM_VERSION} && npm cache clean --force
ENV CI=true

# ---------- Web (Quasar) ----------
FROM base AS web
WORKDIR /web
COPY tickets-front/pnpm-lock.yaml tickets-front/pnpm-workspace.yaml tickets-front/.npmrc ./
RUN --mount=type=cache,id=pnpm-web,target=/root/.local/share/pnpm/store pnpm fetch
COPY tickets-front/ ./
RUN --mount=type=cache,id=pnpm-web,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile --offline
RUN rm -f .env && pnpm build

# ---------- API: compilación ----------
FROM base AS api-build
WORKDIR /api
COPY tickets-back/package.json tickets-back/pnpm-lock.yaml tickets-back/pnpm-workspace.yaml ./
COPY tickets-back/prisma/schema.prisma ./prisma/schema.prisma
RUN --mount=type=cache,id=pnpm-api,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile
COPY tickets-back/ ./
RUN pnpm prisma generate && pnpm build

# ---------- API: dependencias de producción ----------
# Se quitan los motores WASM de otras bases (solo para entornos edge) y los source maps
FROM base AS api-deps
WORKDIR /api
COPY tickets-back/package.json tickets-back/pnpm-lock.yaml tickets-back/pnpm-workspace.yaml ./
COPY tickets-back/prisma/schema.prisma ./prisma/schema.prisma
RUN --mount=type=cache,id=pnpm-api,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile --prod \
  && pnpm prisma generate \
  && find node_modules/.pnpm -path '*@prisma/client/runtime/*' \( -name 'query_engine_bg.*' -o -name 'query_compiler_bg.*' \) -delete \
  && find node_modules/.pnpm -type f -name '*.map' -delete

# ---------- Imagen final ----------
FROM ${NODE_IMAGE} AS runtime
RUN apk add --no-cache openssl tini
ENV NODE_ENV=production \
    APP_MODE=prod \
    PORT=3010 \
    WEB_DIR=/app/web
WORKDIR /app
COPY --from=api-deps /api/node_modules ./node_modules
COPY --from=api-build /api/dist ./dist
COPY tickets-back/prisma/schema.prisma ./prisma/schema.prisma
COPY tickets-back/prisma/migrations ./prisma/migrations
COPY tickets-back/package.json ./package.json
COPY --from=web /web/dist/spa ./web
COPY docker/entrypoint.sh /usr/local/bin/resolvo-entrypoint
RUN chmod +x /usr/local/bin/resolvo-entrypoint

USER node
EXPOSE 3010
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3010/api/health >/dev/null || exit 1
ENTRYPOINT ["/sbin/tini", "--", "resolvo-entrypoint"]
CMD ["node", "dist/main"]
