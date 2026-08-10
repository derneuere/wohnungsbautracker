import { createServerFn } from '@tanstack/react-start'
import { useSession } from '@tanstack/react-start/server'
import { timingSafeEqual } from 'node:crypto'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'wohnungsbau2024'

// Die Session wird als versiegeltes Cookie gespeichert; das Siegel braucht ein
// Geheimnis von mindestens 32 Zeichen. Ohne eigenes SESSION_SECRET wird es aus
// dem Adminpasswort abgeleitet — dann ist die Session nur so stark wie dieses.
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

function adminSession() {
  return useSession<AdminSession>({ name: 'wbt_admin', password: SESSION_SECRET })
}

// Vergleich in konstanter Zeit: ein `===` verrät über die Antwortzeit, wie
// viele Zeichen am Anfang stimmen, und macht das Passwort zeichenweise ratbar.
function passwortStimmt(eingabe: unknown): boolean {
  if (typeof eingabe !== 'string') return false
  const a = Buffer.from(eingabe)
  const b = Buffer.from(ADMIN_PASSWORD)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/**
 * Wache für alle schreibenden und alle nicht-öffentlichen Serverfunktionen.
 *
 * Vorher hing der gesamte Adminbereich an React-State: `checkPassword` gab nur
 * `{ valid }` zurück und der Client blendete daraufhin das Panel ein. Die
 * Serverfunktionen selbst waren offen — Projekte anlegen, ändern, löschen und
 * die komplette Datenbank exportieren wie überschreiben ging ohne jede
 * Anmeldung. Jede dieser Funktionen ruft jetzt zuerst hier herein.
 */
export async function requireAdmin(): Promise<void> {
  const session = await adminSession()
  if (!session.data.admin) throw new Error('Nicht angemeldet')
}

export const checkPassword = createServerFn({ method: 'POST' }).handler(
  async ({ data: password }: { data: string }) => {
    if (!passwortStimmt(password)) return { valid: false }
    const session = await adminSession()
    await session.update({ admin: true })
    return { valid: true }
  },
)

// Damit ein Reload die Anmeldung nicht verliert: das Cookie überlebt, der
// React-State nicht.
export const isAdmin = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await adminSession()
  return { admin: session.data.admin === true }
})

export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await adminSession()
  await session.clear()
  return { success: true }
})
