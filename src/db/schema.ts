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
  blockers: text(), // JSON array of {name, type} — type: "partei"|"bürgerinitiative"|"behörde"|"gericht"|"umwelt"|"investor"
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
