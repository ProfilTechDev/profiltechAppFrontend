# syntax=docker/dockerfile:1.7

# ==============================================================================
# Stage 1: deps — install all dependencies (cached on lockfile)
# ==============================================================================
FROM node:22-alpine AS deps

WORKDIR /app

# Copy only manifest + lockfile first so this layer caches as long as deps
# don't change. `nuxt prepare` runs in postinstall and needs the project
# present, so we skip scripts here and run prepare in the build stage where
# the full source is available.
COPY package.json package-lock.json ./

RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
    npm ci --ignore-scripts

# ==============================================================================
# Stage 2: build — Nuxt build (Nitro server output goes into .output/)
# ==============================================================================
FROM node:22-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Now that the full project is in place, run Nuxt's prepare step and build.
RUN npm run postinstall \
    && npm run build

# ==============================================================================
# Stage 3: runtime — minimal Node + self-contained Nitro bundle
# ==============================================================================
FROM node:22-alpine AS runtime

WORKDIR /app

# The Nuxt build emits a self-contained server in .output/ with its own
# pruned node_modules — no need to copy anything else.
COPY --from=build --chown=node:node /app/.output ./

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

EXPOSE 3000

# TCP probe via Node — succeeds as long as something is listening on the port.
# We deliberately avoid HTTP-level checks because Nuxt's `/` may redirect (302)
# via the global Sanctum middleware, which BusyBox wget treats as an error.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "require('net').createConnection(3000,'127.0.0.1').on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))"

USER node

CMD ["node", "server/index.mjs"]
