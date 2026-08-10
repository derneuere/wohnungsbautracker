import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { blockedProjects } from '../db/schema'
import { eq, or, isNull } from 'drizzle-orm'
import { requireAdmin } from './auth'

// Die öffentliche Liste: ohne die Projekte, bei denen die Recherche keine
// politische oder verwaltungsseitige Ursache belegen konnte. Weil hier jede
// Ansicht und jede Auswertung hängt, wirkt der Filter überall zugleich.
export const getProjects = createServerFn({ method: 'GET' }).handler(async () => {
  return db
    .select()
    .from(blockedProjects)
    .where(or(eq(blockedProjects.hidden, false), isNull(blockedProjects.hidden)))
    .all()
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
    party: string
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
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
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
    party: string
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
    return result[0]
  },
)

export const deleteProject = createServerFn({ method: 'POST' }).handler(
  async ({ data: id }: { data: number }) => {
    await requireAdmin()
    await db.delete(blockedProjects).where(eq(blockedProjects.id, id))
    return { success: true }
  },
)
