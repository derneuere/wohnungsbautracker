FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
# Schema absichern; Daten kommen aus der versionierten sqlite.db (kein seed mehr,
# sonst würden Platzhalter-Zeilen dupliziert / Unique-Constraints verletzt).
RUN bunx drizzle-kit push
RUN bun run build

# ---
FROM oven/bun:1-slim
WORKDIR /app

COPY --from=build /app/.output .output
# Nur noch Erstbefüllung: die Live-DB liegt auf dem persistenten Volume unter
# $DB_PATH und wird beim Deploy NICHT überschrieben.
COPY --from=build /app/sqlite.db /app/seed-sqlite.db
# Ergänzt fehlende Spalten auf der Volume-DB — `drizzle-kit push` im Build
# erreicht diese Datei nicht.
COPY --from=build /app/migrate.ts /app/migrate.ts

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DB_PATH=/app/data/sqlite.db
EXPOSE 3000

CMD ["sh", "-c", "mkdir -p \"$(dirname \"$DB_PATH\")\"; if [ -f \"$DB_PATH\" ]; then echo \"[start] Bestehende DB unter $DB_PATH – bleibt unangetastet.\"; else echo \"[start] Keine DB unter $DB_PATH – initialisiere aus Image-Stand.\"; cp /app/seed-sqlite.db \"$DB_PATH\"; fi; bun /app/migrate.ts; exec bun .output/server/index.mjs"]
