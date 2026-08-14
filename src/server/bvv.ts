import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { bvvParties } from '../db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from './auth'
import { seitenCacheLeeren } from './cache'

export const getBvvParties = createServerFn({ method: 'GET' }).handler(async () => {
  return db.select().from(bvvParties).all()
})

export const updateBvvParty = createServerFn({ method: 'POST' }).handler(
  async ({ data }: { data: {
    id: number
    bezirk: string
    rulingParty: string
    coalitionParties?: string
  }}) => {
    await requireAdmin()
    const { id, ...rest } = data
    const result = await db
      .update(bvvParties)
      .set({ ...rest, updatedAt: new Date() })
      .where(eq(bvvParties.id, id))
      .returning()
    await seitenCacheLeeren()
    return result[0]
  },
)
