# ── Build stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY server/package.json ./server/
COPY tsconfig.base.json ./

# Install all deps (needed for prisma generate in build)
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared/ ./packages/shared/
COPY server/ ./server/

# Generate Prisma client and build
RUN cd server && pnpm prisma:generate && pnpm build

# ── Runtime stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
RUN addgroup -S favour && adduser -S favour -G favour

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY server/package.json ./server/

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules/.prisma ./server/node_modules/.prisma
COPY --from=builder /app/packages/shared/src ./packages/shared/src

USER favour
ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "server/dist/server.js"]
