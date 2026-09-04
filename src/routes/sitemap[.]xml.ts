/**
 * `/sitemap.xml` — die Liste aller öffentlichen Seiten für Suchmaschinen.
 * Server-Route ohne Component, wie `/og/<slug>.png`: der Handler liefert XML.
 *
 * Gecacht über die `cache`-Route-Regel in vite.config.ts, damit ein Crawler-
 * Schwarm nicht bei jedem Abruf die Datenbank liest. Eine Redaktionsänderung
 * leert den Cache über `server/cache.ts` mit — die Sitemap liegt in derselben
 * Cache-Gruppe wie Startseite und Projektseiten.
 */
import { createFileRoute } from '@tanstack/react-router'
import { sitemapEintraege, sitemapXml } from '../lib/seo'
import { getProjects } from '../server/projects'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const projekte = await getProjects()
        return new Response(sitemapXml(sitemapEintraege(projekte)), {
          headers: {
            'content-type': 'application/xml; charset=utf-8',
            'cache-control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
