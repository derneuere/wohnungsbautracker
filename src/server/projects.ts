import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { blockedProjects } from '../db/schema'
import { eq, or, isNull } from 'drizzle-orm'
import { requireAdmin } from './auth'
import { LIST_COLUMNS } from '../lib/design-data'
import { seitenCacheLeeren } from './cache'

// Der Sichtbarkeitsfilter: ohne die Projekte, bei denen die Recherche keine
// politische oder verwaltungsseitige Ursache belegen konnte. Weil hier jede
// Ansicht und jede Auswertung hängt, wirkt der Filter überall zugleich.
const sichtbar = or(eq(blockedProjects.hidden, false), isNull(blockedProjects.hidden))

// Genau die Spalten aus TrackerListProject. Alles andere — vor allem die
// Belege in political_responsibility_meta — bleibt hier draußen; siehe die
// Begründung am Typ in lib/design-data.ts.
const listenSpalten = {
  id: blockedProjects.id,
  title: blockedProjects.title,
  lat: blockedProjects.lat,
  lng: blockedProjects.lng,
  bezirk: blockedProjects.bezirk,
  status: blockedProjects.status,
  unitCount: blockedProjects.unitCount,
  unitCountEstimate: blockedProjects.unitCountEstimate,
  unitCountEstimateMeta: blockedProjects.unitCountEstimateMeta,
  blockers: blockedProjects.blockers,
} satisfies Record<(typeof LIST_COLUMNS)[number], unknown>

// Die öffentliche Liste für Startseite, Karte und Kennzahlen.
export const getProjectList = createServerFn({ method: 'GET' }).handler(async () => {
  return db.select(listenSpalten).from(blockedProjects).where(sichtbar).all()
})

// Vollständige Datensätze — für die Projektseite, die Beschreibung und Belege
// tatsächlich rendert.
export const getProjects = createServerFn({ method: 'GET' }).handler(async () => {
  return db.select().from(blockedProjects).where(sichtbar).all()
})

// Ungefiltert — nur für die Verwaltung, damit ausgeblendete Projekte dort
// sichtbar und wieder einblendbar bleiben.
export const getAllProjects = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return db.select().from(blockedProjects).all()
})

export const createProject = createServerFn({ method: 'POST' }).handler(
  async ({ data }: { data: {
    title: string
    description?: string
    lat: number
    lng: number
    /** @deprecated Tote Spalte — Parteien werden aus blockers abgeleitet. */
    party?: string
    bezirk: string
    status: string
    date?: string
    unitCount?: number | null
    unitCountEstimate?: number | null
    blockers?: string
    sourceUrl?: string
    pressUrls?: string
    imageUrl?: string
    hidden?: boolean
    politicalResponsibility?: string | null
    politicalResponsibilityMeta?: string | null
    resolution?: string | null
  }}) => {
    await requireAdmin()
    const result = await db
      .insert(blockedProjects)
      .values({
        ...data,
        party: data.party ?? '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
    await seitenCacheLeeren()
    return result[0]
  },
)

export const updateProject = createServerFn({ method: 'POST' }).handler(
  async ({ data }: { data: {
    id: number
    title: string
    description?: string
    lat: number
    lng: number
    /** @deprecated Tote Spalte — Parteien werden aus blockers abgeleitet. */
    party?: string
    bezirk: string
    status: string
    date?: string
    unitCount?: number | null
    unitCountEstimate?: number | null
    blockers?: string
    sourceUrl?: string
    pressUrls?: string
    imageUrl?: string
    hidden?: boolean
    politicalResponsibility?: string | null
    politicalResponsibilityMeta?: string | null
    resolution?: string | null
  }}) => {
    await requireAdmin()
    const { id, ...rest } = data
    const result = await db
      .update(blockedProjects)
      .set({ ...rest, updatedAt: new Date() })
      .where(eq(blockedProjects.id, id))
      .returning()
    await seitenCacheLeeren()
    return result[0]
  },
)

export const deleteProject = createServerFn({ method: 'POST' }).handler(
  async ({ data: id }: { data: number }) => {
    await requireAdmin()
    await db.delete(blockedProjects).where(eq(blockedProjects.id, id))
    await seitenCacheLeeren()
    return { success: true }
  },
)
