import { createServerFn } from '@tanstack/react-start'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { dbPath } from '../db/path'

const DB_PATH = resolve(dbPath)

export const exportDb = createServerFn({ method: 'GET' }).handler(async () => {
  const buffer = readFileSync(DB_PATH)
  return { data: buffer.toString('base64'), size: buffer.length }
})

export const importDb = createServerFn({ method: 'POST' }).handler(
  async ({ data }: { data: string }) => {
    const buffer = Buffer.from(data, 'base64')
    writeFileSync(DB_PATH, buffer)
    return { success: true, size: buffer.length }
  },
)
