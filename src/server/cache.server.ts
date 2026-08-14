// Serverseitige Hälfte des Cache-Leerens.
//
// Eigene Datei aus demselben Grund wie `admin-session.server.ts`: `projects.ts`
// hängt über die Startseite im Client-Graphen, und ein statischer Import von
// `nitro/storage` würde von dort in den Browser wandern. Dieses Modul wird
// deshalb nur aus einem `createServerOnlyFn`-Rumpf heraus dynamisch geladen.

import { useStorage } from 'nitro/storage'

// Die `cache`-Route-Regel legt ihre Einträge unter der Gruppe
// `nitro/route-rules` ab (nitro/dist/runtime/internal/route-rules.mjs), und
// ocache stellt allen Cache-Schlüsseln die Basis `cache` voran. Real sehen sie
// so aus:
//
//   cache:nitro:route-rules:**:index.<hash>.json
//   cache:nitro:route-rules:projekt:**:**:projekt1.<hash>.json
//
// Ein Prefix-Clear trifft damit Startseite und alle Projektseiten auf einmal.
// Gezielt einzelne Seiten zu invalidieren wäre möglich, hieße aber, ocaches
// Schlüsselbildung nachzubauen (gekürzter Pfad plus ohash) — bei 49 Seiten, die
// in Millisekunden neu rendern, ein schlechter Tausch gegen eine Kopplung an
// Interna, die jedes Nitro-Update brechen kann.
const BASIS = 'cache'
const GRUPPE = 'nitro/route-rules'

/** Leert den Seiten-Cache. Gibt zurück, wie viele Einträge entfernt wurden. */
export async function leereSeitenCache(): Promise<number> {
  const storage = useStorage(BASIS)
  const schluessel = await storage.getKeys(GRUPPE)
  await Promise.all(schluessel.map((k) => storage.removeItem(k)))
  return schluessel.length
}
