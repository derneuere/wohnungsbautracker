import { createServerOnlyFn } from '@tanstack/react-start'

const modul = createServerOnlyFn(() => import('./cache.server'))

/**
 * Nach jeder Änderung an den öffentlich angezeigten Daten aufrufen.
 *
 * Startseite und Projektseiten werden über die `cache`-Route-Regeln in
 * vite.config.ts serverseitig zwischengespeichert. Ohne diesen Aufruf hinge
 * eine Korrektur bis zum Ablauf des TTL in der Luft — mit ihm ist sie beim
 * nächsten Aufruf da, und das TTL ist nur noch die Rückfallgrenze.
 *
 * Bewusst fehlerfreundlich: ein nicht geleerter Cache darf keine Bearbeitung
 * scheitern lassen. Die Änderung ist zu diesem Zeitpunkt bereits in der
 * Datenbank; sie erscheint dann eben verzögert.
 */
export async function seitenCacheLeeren(): Promise<void> {
  try {
    const m = await modul()
    await m.leereSeitenCache()
  } catch (fehler) {
    console.warn('[cache] Seiten-Cache konnte nicht geleert werden:', fehler)
  }
}
