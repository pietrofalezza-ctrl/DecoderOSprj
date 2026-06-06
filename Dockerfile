# De-coder self-host image — TanStack Start built for a Node target.
# Requires a reachable Supabase instance (cloud or self-hosted via supabase-cli).
FROM oven/bun:1.3 AS build
WORKDIR /app
COPY package.json bun.lock* bunfig.toml ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1.3 AS runtime
WORKDIR /app
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json
ENV PORT=8080
EXPOSE 8080
# Required env at runtime:
#   SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY,
#   DECODER_ENCRYPTION_KEY, LOVABLE_API_KEY (optional, for cloud AI fallback)
CMD ["bun", "run", ".output/server/index.mjs"]
