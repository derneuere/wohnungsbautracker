// Serverseitige Hälfte der Adminanmeldung.
//
// Eigene Datei, weil `@tanstack/react-start/server` im Client-Bundle verboten
// ist: `/admin` importiert `auth.ts`, und ein statischer Import von hier würde
// über diesen Pfad in den Browser-Graphen wandern — der Build bricht dann mit
// „import-protection: Import denied in client environment" ab. Dieses Modul
// wird deshalb ausschliesslich aus `createServerOnlyFn`-Rümpfen heraus
// dynamisch importiert, die der Bundler clientseitig entfernt.

import { getRequestIP, useSession } from '@tanstack/react-start/server'
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

// --- Bremse gegen Durchprobieren ---------------------------------------------
//
// `timingSafeEqual` verhindert, dass sich das Passwort zeichenweise erraten
// lässt — gegen stumpfes Durchprobieren hilft es nicht. Ohne Bremse ist ein
// Passwort nur so stark wie die Zahl der Versuche pro Sekunde, und wer hier
// durchkommt, kann über `importDb` den gesamten Datenbestand überschreiben.
//
// Bewusst im Prozessspeicher: ein Neustart setzt die Zähler zurück, aber
// Neustarts kann ein Angreifer nicht auslösen. Eine Tabelle in der SQLite-DB
// wäre Schreiblast für jeden Fehlversuch — genau das, was der Angreifer will.

const FENSTER_MS = 15 * 60_000
/** Fehlversuche je IP im Fenster. Für eine Redaktion großzügig, für ein
 *  Wörterbuch aussichtslos. */
const GRENZE_IP = 10
/** Rückfalllinie über alle IPs: X-Forwarded-For kommt zwar von Traefik, lässt
 *  sich aber grundsätzlich fälschen. Wer die IP durchrotiert, läuft in diese
 *  Grenze. Sie liegt hoch genug, dass echte Nutzung sie nie erreicht. */
const GRENZE_GESAMT = 100

const fehlversuche = new Map<string, number[]>()
let gesamtVersuche: number[] = []

function imFenster(zeiten: number[], jetzt: number): number[] {
  return zeiten.filter((t) => t > jetzt - FENSTER_MS)
}

function kennung(): string {
  return getRequestIP({ xForwardedFor: true }) ?? 'unbekannt'
}

export type Bremse = { gesperrt: boolean; wartezeit: number }

/** Prüft, ob noch ein Versuch frei ist — ohne selbst einen zu verbrauchen. */
export function pruefeBremse(): Bremse {
  const jetzt = Date.now()
  gesamtVersuche = imFenster(gesamtVersuche, jetzt)

  // Abgelaufene Einträge wegräumen, sonst wächst die Map mit jeder IP, die je
  // danebengegriffen hat.
  for (const [ip, zeiten] of fehlversuche) {
    const rest = imFenster(zeiten, jetzt)
    if (rest.length === 0) fehlversuche.delete(ip)
    else fehlversuche.set(ip, rest)
  }

  const eigene = fehlversuche.get(kennung()) ?? []
  const relevant =
    gesamtVersuche.length >= GRENZE_GESAMT
      ? gesamtVersuche
      : eigene.length >= GRENZE_IP
        ? eigene
        : null
  if (!relevant) return { gesperrt: false, wartezeit: 0 }

  // Frei wird es, sobald der älteste Versuch aus dem Fenster fällt.
  const aeltester = Math.min(...relevant)
  return { gesperrt: true, wartezeit: Math.ceil((aeltester + FENSTER_MS - jetzt) / 1000) }
}

export function merkeFehlversuch(): void {
  const jetzt = Date.now()
  const ip = kennung()
  fehlversuche.set(ip, [...imFenster(fehlversuche.get(ip) ?? [], jetzt), jetzt])
  gesamtVersuche = [...imFenster(gesamtVersuche, jetzt), jetzt]
}

/** Nach erfolgreicher Anmeldung: die eigene IP ist wieder unbelastet. */
export function loescheFehlversuche(): void {
  fehlversuche.delete(kennung())
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
