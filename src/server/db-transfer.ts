import { createServerFn } from '@tanstack/react-start'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { dbPath } from '../db/path'
import { requireAdmin } from './auth'

const DB_PATH = resolve(dbPath)

// Beide Funktionen reichen die komplette Datenbank durch — Export liest sie
// vollständig aus, Import überschreibt sie ohne Rückfrage. Ohne `requireAdmin`
// konnte das jede beliebige Person mit einem einzigen HTTP-Request.

export const exportDb = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  const buffer = readFileSync(DB_PATH)
  return { data: buffer.toString('base64'), size: buffer.length }
})

export const importDb = createServerFn({ method: 'POST' }).handler(
  async ({ data }: { data: string }) => {
    await requireAdmin()
    const buffer = Buffer.from(data, 'base64')
    // Eine kaputte Datei würde die Live-DB unbrauchbar machen; der
    // SQLite-Header ist die billigste Prüfung, die das abfängt.
    if (buffer.subarray(0, 6).toString() !== 'SQLite')
      throw new Error('Keine SQLite-Datei')
    writeFileSync(DB_PATH, buffer)
    return { success: true, size: buffer.length }
  },
)
