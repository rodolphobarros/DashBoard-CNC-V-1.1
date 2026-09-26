# ============================================================
# Dashboard CNC V1.1
# Dockerfile multi-stage
# Development + Production
# ============================================================


# ------------------------------------------------------------
# Dependências base
# ------------------------------------------------------------
FROM node:24-bookworm-slim AS dependencies

WORKDIR /src/app

COPY --chown=node:node package*.json ./

RUN npm ci


# ------------------------------------------------------------
# Desenvolvimento
# ------------------------------------------------------------
FROM dependencies AS development

ENV NODE_ENV=development

COPY --chown=node:node . .

USER node

EXPOSE 3000

CMD ["npm", "run", "dev"]


# ------------------------------------------------------------
# Produção
# ------------------------------------------------------------
FROM node:24-bookworm-slim AS production

ENV NODE_ENV=production

WORKDIR /src/app

COPY --chown=node:node package*.json ./

RUN npm ci --omit=dev \
    && npm cache clean --force

COPY --chown=node:node public ./public
COPY --chown=node:node src ./src

RUN mkdir -p /src/app/logs \
    && chown node:node /src/app/logs

USER node

EXPOSE 3000

CMD ["npm", "start"]