# ── Stage 1: deps ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
# ── Stage 2: final image ───────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
# Install openssl (required by Prisma)
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client from the schema
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "src/server.js"]