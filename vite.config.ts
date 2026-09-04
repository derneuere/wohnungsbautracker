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

// Die CSP bildet ab, was die Seite wirklich lädt: keine externen Skripte, keine
// externen Bilder, Schriften aus public/fonts. Die vielen externen Adressen im
// Text sind ausschliesslich <a href> — Links unterliegen der CSP nicht.
//
// `'unsafe-inline'` bei script-src ist keine Nachlässigkeit, sondern die
// Bauweise: TanStack Start legt den Hydrations-Payload als inline <script> in
// die Seite, und der ändert sich pro Seite, ist also weder über Hashes noch
// über eine statische Route-Regel per Nonce abzudecken. Bei style-src dasselbe
// für die 393 inline style-Attribute. Der Gewinn liegt hier deshalb nicht beim
// Inline-XSS, sondern darin, dass fremde Herkünfte für Skripte, Verbindungen
// und Einbettungen ausgeschlossen sind — und der Rest der Seite hat mit
// `dangerouslySetInnerHTML` ohnehin keinen Einschleusweg.
const csp = [
  "default-src 'self'",
  // Einzige fremde Herkunft: die eigene GoatCounter-Instanz. script-src lädt
  // count.js, connect-src deckt den sendBeacon-Zähltreffer an /count ab.
  "script-src 'self' 'unsafe-inline' https://stats.wohnungsbautracker.de",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://stats.wohnungsbautracker.de",
  "font-src 'self'",
  "connect-src 'self' https://stats.wohnungsbautracker.de",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

const sicherheitsHeader = {
  'content-security-policy': csp,
  // Ein Jahr, mit Subdomains — die Domain bedient nur diesen Tracker. Bewusst
  // ohne `preload`: der Eintrag in die Browserliste ist praktisch nicht mehr
  // rückgängig zu machen.
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  // Kein Erraten von Inhaltstypen: eine hochgeladene Datei, die wie HTML
  // aussieht, wird dann auch nicht als HTML ausgeführt.
  'x-content-type-options': 'nosniff',
  // Beim Klick auf eine Quelle bekommt die Zielseite nur die Herkunft, nicht
  // den vollständigen Pfad — welches Projekt jemand gelesen hat, geht die
  // verlinkte Zeitung nichts an.
  'referrer-policy': 'strict-origin-when-cross-origin',
  // frame-ancestors deckt das für moderne Browser schon ab; das hier ist die
  // Fassung für ältere.
  'x-frame-options': 'DENY',
  'permissions-policy': 'geolocation=(), microphone=(), camera=(), interest-cohort=()',
}

const config = defineConfig({
  plugins: [
    devtools(),
    nitro({
      rollupConfig: { external: [/^@sentry\//] },
      routeRules: {
        // Für jede Antwort. `/**` ist die unspezifischste Regel; die
        // Cache-Header der Einzelpfade unten treten daneben, nicht dagegen.
        '/**': { headers: sicherheitsHeader },
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
        // Die Sitemap lesen Crawler in Schüben, oft mehrere kurz nacheinander.
        // Sie ändert sich nur mit einer Redaktionsänderung, und die leert
        // diesen Cache ohnehin — deshalb darf die Obergrenze hier eine Stunde
        // sein. Der Browser-TTL spielt für eine XML-Datei keine Rolle.
        '/sitemap.xml': { cache: { maxAge: 3600, swr: true } },
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
