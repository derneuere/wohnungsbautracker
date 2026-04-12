import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { constructionStats } from '../db/schema'
import { eq } from 'drizzle-orm'

export const getStats = createServerFn({ method: 'GET' }).handler(async () => {
  return db.select().from(constructionStats).all()
})

export const upsertStat = createServerFn({ method: 'POST' }).handler(
  async ({ data }: { data: {
    id?: number
    bezirk: string
    year: number
    approvedCount: number
    completedCount: number
  }}) => {
    if (data.id) {
      const { id, ...rest } = data
      const result = await db
        .update(constructionStats)
        .set(rest)
        .where(eq(constructionStats.id, id))
        .returning()
      return result[0]
    }
    const result = await db.insert(constructionStats).values(data).returning()
    return result[0]
  },
)
