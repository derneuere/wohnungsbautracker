import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'

// Die Session selbst liegt in `admin-session.server.ts` und wird von hier nur
// dynamisch aus `createServerOnlyFn`-Rümpfen geladen. Diese Datei hängt über
// `/admin` im Client-Graphen; ein statischer Import von
// `@tanstack/react-start/server` würde den Build brechen.
const sitzung = createServerOnlyFn(() => import('./admin-session.server'))

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
  const s = await sitzung()
  await s.verlangeAdmin()
}

export const checkPassword = createServerFn({ method: 'POST' }).handler(
  async ({ data: password }: { data: string }) => {
    const s = await sitzung()
    if (!s.passwortStimmt(password)) return { valid: false }
    await s.anmelden()
    return { valid: true }
  },
)

// Damit ein Reload die Anmeldung nicht verliert: das Cookie überlebt, der
// React-State nicht.
export const isAdmin = createServerFn({ method: 'GET' }).handler(async () => {
  const s = await sitzung()
  return { admin: await s.istAngemeldet() }
})

export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  const s = await sitzung()
  await s.abmelden()
  return { success: true }
})
