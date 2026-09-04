/**
 * `/llms.txt` — die Seite in Markdown für KI-Crawler (llmstxt.org): was der
 * Tracker ist, wie die Daten entstehen, und jedes Projekt als eine Zeile mit
 * Link. Gecacht wie die Sitemap; siehe dort.
 */
import { createFileRoute } from '@tanstack/react-router'
import { llmsTxt } from '../lib/seo'
import { getProjects } from '../server/projects'

const BESCHREIBUNG =
  'Welche Akteure blockieren den Wohnungsbau in Berlin? Alle blockierten, verzögerten und abgelehnten Neubauprojekte, mit Quellen.'

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: async () => {
        const projekte = await getProjects()
        return new Response(llmsTxt(projekte, BESCHREIBUNG), {
          headers: {
            'content-type': 'text/markdown; charset=utf-8',
            'cache-control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
