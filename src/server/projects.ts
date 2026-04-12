import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { blockedProjects } from '../db/schema'
import { eq } from 'drizzle-orm'

export const getProjects = createServerFn({ method: 'GET' }).handler(async () => {
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
    unitCount?: number
    blockers?: string
    sourceUrl?: string
    pressUrls?: string
    imageUrl?: string
  }}) => {
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
    unitCount?: number
    blockers?: string
    sourceUrl?: string
    pressUrls?: string
    imageUrl?: string
  }}) => {
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
    await db.delete(blockedProjects).where(eq(blockedProjects.id, id))
    return { success: true }
  },
)
