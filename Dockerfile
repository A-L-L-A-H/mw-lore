FROM oven/bun:1-alpine AS base
WORKDIR /app

COPY package.json tsconfig.json ./
RUN bun install --frozen-lockfile || bun install

COPY src ./src
COPY tests ./tests

ENV NODE_ENV=production
ENV MW_LORE_PORT=4450

EXPOSE 4450

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4450/health || exit 1

CMD ["bun", "run", "src/server.ts"]
