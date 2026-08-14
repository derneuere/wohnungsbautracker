/**
 * `/og/<slug>.png` — das Vorschaubild, das Social-Netzwerke zu einem geteilten
 * Projektlink laden. Server-Route ohne Component: der Handler liefert direkt PNG.
 */
import { createFileRoute } from '@tanstack/react-router'
import { readFileSync } from 'node:fs'
import { idFromSlug, type TrackerProject } from '../../lib/design-data'
import { SITE_HOST } from '../../lib/site'
import { ogAsset } from '../../server/og-fonts'
import { projektKartePng } from '../../server/og-image'
import { getProjects } from '../../server/projects'

/** Der Slug aus dem Pfad. Nicht über `params`: der Generator liest den
 *  Segmentnamen als „slug.png" und warnt darüber — der Pfad selbst ist hier die
 *  verlässlichere Quelle. */
function slugAusPfad(url: string): string {
  return decodeURIComponent(new URL(url).pathname)
    .replace(/^\/og\//, '')
    .replace(/\.png$/, '')
}

/** Die mitgelieferte Standardkarte. Sie beantwortet alles, was kein Projekt ist
 *  — unbekannte oder ausgeblendete Slugs kosten so keine Rechenzeit, und wenn
 *  die Rasterung ausfällt, steht statt einer kaputten Vorschau wenigstens das
 *  Kampagnenbild. */
let standard: Uint8Array | null = null
function standardKarte(): Uint8Array {
  if (!standard) standard = readFileSync(ogAsset('default.png'))
  return standard
}

function bildAntwort(png: Uint8Array, sekunden: number): Response {
  return new Response(png as unknown as BodyInit, {
    headers: {
      'content-type': 'image/png',
      'cache-control': `public, max-age=${sekunden}`,
    },
  })
}

export const Route = createFileRoute('/og/$slug.png')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const id = idFromSlug(slugAusPfad(request.url))
          const projekt = (await getProjects()).find((p) => p.id === id)
          if (!projekt) return bildAntwort(standardKarte(), 3600)
          // Crawler holen dasselbe Bild mehrfach; Redaktionsänderungen sind
          // spätestens nach einer Stunde in der Vorschau.
          return bildAntwort(
            await projektKartePng(projekt as TrackerProject & { updatedAt?: Date | null }, SITE_HOST),
            3600,
          )
        } catch (fehler) {
          console.error('[og] Rendern fehlgeschlagen:', fehler)
          return bildAntwort(standardKarte(), 300)
        }
      },
    },
  },
})
