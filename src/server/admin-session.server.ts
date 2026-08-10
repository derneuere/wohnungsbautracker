// Serverseitige Hälfte der Adminanmeldung.
//
// Eigene Datei, weil `@tanstack/react-start/server` im Client-Bundle verboten
// ist: `/admin` importiert `auth.ts`, und ein statischer Import von hier würde
// über diesen Pfad in den Browser-Graphen wandern — der Build bricht dann mit
// „import-protection: Import denied in client environment" ab. Dieses Modul
// wird deshalb ausschliesslich aus `createServerOnlyFn`-Rümpfen heraus
// dynamisch importiert, die der Bundler clientseitig entfernt.

import { useSession } from '@tanstack/react-start/server'
import { timingSafeEqual } from 'node:crypto'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'wohnungsbau2024'

// Das Sessionsiegel braucht mindestens 32 Zeichen. Ohne eigenes SESSION_SECRET
// wird es aus dem Adminpasswort abgeleitet — dann ist die Session nur so stark
// wie dieses.
const SESSION_SECRET = (
  process.env.SESSION_SECRET || `wbt-session::${ADMIN_PASSWORD}`
).padEnd(32, '.')

if (process.env.NODE_ENV === 'production') {
  if (!process.env.ADMIN_PASSWORD)
    console.warn('[auth] ADMIN_PASSWORD ist nicht gesetzt — es gilt das öffentlich bekannte Standardpasswort.')
  if (!process.env.SESSION_SECRET)
    console.warn('[auth] SESSION_SECRET ist nicht gesetzt — das Sessionsiegel wird aus ADMIN_PASSWORD abgeleitet.')
}

type AdminSession = { admin?: boolean }

function session() {
  return useSession<AdminSession>({ name: 'wbt_admin', password: SESSION_SECRET })
}

// Vergleich in konstanter Zeit: ein `===` verrät über die Antwortzeit, wie
// viele Zeichen am Anfang stimmen, und macht das Passwort zeichenweise ratbar.
export function passwortStimmt(eingabe: unknown): boolean {
  if (typeof eingabe !== 'string') return false
  const a = Buffer.from(eingabe)
  const b = Buffer.from(ADMIN_PASSWORD)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function anmelden(): Promise<void> {
  const s = await session()
  await s.update({ admin: true })
}

export async function abmelden(): Promise<void> {
  const s = await session()
  await s.clear()
}

export async function istAngemeldet(): Promise<boolean> {
  const s = await session()
  return s.data.admin === true
}

export async function verlangeAdmin(): Promise<void> {
  if (!(await istAngemeldet())) throw new Error('Nicht angemeldet')
}
