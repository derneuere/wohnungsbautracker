import { sqliteTable, int, text, real, integer } from 'drizzle-orm/sqlite-core'

export const blockedProjects = sqliteTable('blocked_projects', {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text(),
  lat: real().notNull(),
  lng: real().notNull(),
  party: text().notNull(),
  bezirk: text().notNull(),
  status: text().notNull(), // 'blockiert' | 'verzögert' | 'abgelehnt'
  date: text(),
  unitCount: int('unit_count'),
  // Recherchierte Schätzung, strikt getrennt von bestätigten Zahlen (unit_count).
  // 0 = belegt keine Wohnnutzung; NULL = unbekannt/nicht bezifferbar.
  unitCountEstimate: int('unit_count_estimate'),
  // JSON: { basis: 'dokumentiert'|'abgeleitet'|'keine_wohnnutzung', spanne: [min,max], quellen: [{url, zitat}], confidence, begruendung, verifiziert, stand }
  unitCountEstimateMeta: text('unit_count_estimate_meta'),
  blockers: text(), // JSON array of {name, type} — type: "partei"|"bürgerinitiative"|"behörde"|"gericht"|"umwelt"|"investor"
  // Ausgeblendet statt gelöscht: Projekte, bei denen die Recherche keine politische
  // oder verwaltungsseitige Ursache belegen konnte. Daten und Belege bleiben erhalten.
  hidden: integer({ mode: 'boolean' }).default(false),
  // 'hauptursache' | 'mitursaechlich' | 'keine' — Ergebnis der Belegprüfung
  politicalResponsibility: text('political_responsibility'),
  // JSON: { bewertung, fazit, stand, dublette_von, funde: [{akteur, typ, ebene, datum, art, aussage, url, titel, belegstaerke}] }
  politicalResponsibilityMeta: text('political_responsibility_meta'),
  sourceUrl: text('source_url'),
  pressUrls: text('press_urls'), // JSON array of {title, url} objects
  imageUrl: text('image_url'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const bvvParties = sqliteTable('bvv_parties', {
  id: int().primaryKey({ autoIncrement: true }),
  bezirk: text().notNull().unique(),
  rulingParty: text('ruling_party').notNull(),
  coalitionParties: text('coalition_parties'), // comma-separated
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const constructionStats = sqliteTable('construction_stats', {
  id: int().primaryKey({ autoIncrement: true }),
  bezirk: text().notNull(),
  year: int().notNull(),
  approvedCount: int('approved_count').notNull(),
  completedCount: int('completed_count').notNull(),
})
