import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'
import { dbUrl } from './path'

const client = createClient({
  url: dbUrl,
})

export const db = drizzle(client, { schema })
