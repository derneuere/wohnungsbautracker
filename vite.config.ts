import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

// Vite hasht /assets/** selbst und liefert dafür schon `immutable` aus. Was
// unter public/ liegt, trägt dagegen nur ETag und Last-Modified: der Browser
// fragt bei jedem Aufruf nach. Für die 321 KB Bezirksgeometrie, die jede Seite
// clientseitig nachlädt, ist das ein vermeidbarer Roundtrip pro Besuch.
//
// Die Dateinamen sind hier nicht gehasht — deshalb bewusst endliche Zeiten
// statt `immutable`: eine ausgetauschte Datei ist spätestens nach Ablauf
// überall sichtbar, und `stale-while-revalidate` hält sie in der Zwischenzeit
// schnell.
const staticCache = (sekunden: number) =>
  `public, max-age=${sekunden}, stale-while-revalidate=${sekunden * 7}`

const config = defineConfig({
  plugins: [
    devtools(),
    nitro({
      rollupConfig: { external: [/^@sentry\//] },
      routeRules: {
        // Die Startseite ist für alle Besucher identisch — sie liest weder
        // Cookie noch Session. Nitro rendert sie deshalb höchstens einmal pro
        // Minute und beantwortet alles dazwischen aus dem Cache. Preis dafür:
        // eine Änderung im Adminbereich erscheint bis zu 60 s später.
        // Startseite und Projektseiten sind für alle Besucher identisch — sie
        // lesen weder Cookie noch Session. Die Daten ändern sich nur, wenn im
        // Adminbereich etwas bearbeitet wird, und genau dann leert
        // `server/cache.ts` den Cache. Deshalb darf das TTL lang sein: es ist
        // die Obergrenze, falls das Leeren einmal nicht durchkommt, nicht die
        // normale Verzögerung.
        // Die 300 s sind ein Kompromiss, kein Wunschwert: `cache` schreibt
        // `public, max-age=N, s-maxage=N` — dieselbe Zahl geht also an den
        // Browser. Eine `headers`-Regel daneben wird von der Cache-Regel
        // überschrieben (getestet), Server- und Browser-TTL sind hier nicht
        // trennbar. Länger als ein paar Minuten hieße: eine Korrektur ist
        // serverseitig sofort da (siehe unten), aber wer die Seite gerade offen
        // hatte, sieht sie trotzdem nicht. Für Lastspitzen bringen 300 s
        // praktisch dasselbe wie eine Stunde.
        '/': { cache: { maxAge: 300, swr: true } },
        '/projekt/**': { cache: { maxAge: 300, swr: true } },
        // `/og/<slug>.png` braucht hier nichts: der Handler setzt seinen Header
        // selbst und `server/og-image.ts` hält die gerenderten Karten in einer
        // Map, deren Schlüssel `updatedAt` enthält — der Cache verfällt bei
        // einer Redaktionsänderung also von allein.
        '/berlin-bezirke.geojson': { headers: { 'cache-control': staticCache(86_400) } },
        '/fonts/**': { headers: { 'cache-control': staticCache(2_592_000) } },
        // Favicons, App-Icons und die Standard-Vorschaukarte: statisch, aber
        // ohne Hash im Dateinamen — deshalb ein Tag statt `immutable`.
        '/favicon.ico': { headers: { 'cache-control': staticCache(86_400) } },
        '/favicon.svg': { headers: { 'cache-control': staticCache(86_400) } },
        '/apple-touch-icon.png': { headers: { 'cache-control': staticCache(86_400) } },
        '/icon-192.png': { headers: { 'cache-control': staticCache(86_400) } },
        '/icon-512.png': { headers: { 'cache-control': staticCache(86_400) } },
        '/manifest.json': { headers: { 'cache-control': staticCache(86_400) } },
        '/og/default.png': { headers: { 'cache-control': staticCache(86_400) } },
      },
    }),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
