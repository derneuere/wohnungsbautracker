// Ein einziger Ort für den DB-Pfad.
// Lokal: ./sqlite.db (die versionierte Datei im Repo).
// In Produktion: DB_PATH=/app/data/sqlite.db – das liegt auf einem persistenten
// Coolify-Volume, damit Eingaben einen Redeploy überleben.
export const dbPath = process.env.DB_PATH ?? './sqlite.db'
export const dbUrl = `file:${dbPath}`
