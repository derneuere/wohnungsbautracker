import { HeadContent, Outlet, Scripts, createRootRoute, Link, useRouter, useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'
import appCss from '../styles.css?url'
import FdpLogo from '../components/FdpLogo'
import { BLUE, YELLOW } from '../lib/campaign'
import { absolut } from '../lib/site'

const BESCHREIBUNG = 'Welche Parteien blockieren Neubauprojekte in Berlin?'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Wohnungsbau-Tracker Berlin' },
      { name: 'description', content: BESCHREIBUNG },
      { name: 'theme-color', content: BLUE },
      // Grundausstattung der Teilen-Vorschau. Jede Route darf einzelne Angaben
      // überschreiben — TanStack behält pro name/property den Eintrag der
      // tiefsten Route, deshalb stehen hier nur die Voreinstellungen.
      { property: 'og:site_name', content: 'Wohnungsbau-Tracker Berlin' },
      { property: 'og:locale', content: 'de_DE' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Wohnungsbau-Tracker Berlin' },
      { property: 'og:description', content: BESCHREIBUNG },
      { property: 'og:image', content: absolut('/og/default.png') },
      { property: 'og:image:type', content: 'image/png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'Wohnungsbau-Tracker Berlin — Wo blockiert wird, ist nichts möglich.' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: absolut('/og/default.png') },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      // SVG zuerst für alles Moderne, .ico als Rückfallebene für ältere
      // Browser und Feedreader.
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/manifest.json' },
    ],
  }),
  component: RootLayout,
})

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isAdmin = pathname.startsWith('/admin')

  return (
    <html lang="de">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-white text-[#111]">
        {isAdmin && <AdminHeader />}
        <Outlet />
        <Scripts />
        <GoatCounter />
      </body>
    </html>
  )
}

// Selbstgehostete, cookiefreie Statistik (stats.wohnungsbautracker.de).
// count.js zählt nur den initialen Seitenaufruf; Client-Navigationen der SPA
// müssen deshalb per Router-Subscription nachgemeldet werden. Admin-Seiten
// werden nicht gezählt, localhost ignoriert count.js von selbst.
function GoatCounter() {
  const router = useRouter()

  useEffect(() => {
    return router.subscribe('onResolved', ({ fromLocation, toLocation }) => {
      if (!fromLocation || fromLocation.href === toLocation.href) return
      if (toLocation.pathname.startsWith('/admin')) return
      ;(window as any).goatcounter?.count?.({ path: toLocation.pathname + toLocation.searchStr })
    })
  }, [router])

  const pathname = useRouterState({ select: (s) => s.location.pathname })
  if (pathname.startsWith('/admin')) return null

  return (
    <script
      data-goatcounter="https://stats.wohnungsbautracker.de/count"
      async
      src="https://stats.wohnungsbautracker.de/count.js"
    />
  )
}

function AdminHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const links = [
    { to: '/admin', label: 'Projekte' },
    { to: '/admin/bvv', label: 'BVV-Parteien' },
    { to: '/admin/stats', label: 'Statistiken' },
  ]

  return (
    <header className="sticky top-0 z-[1000] border-b border-black/5 bg-white" style={{ fontFamily: "'Archivo', 'Helvetica Neue', sans-serif" }}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-3 no-underline" title="Zur Startseite">
          <FdpLogo height={30} />
          <span className="px-2 py-1 text-[10px] font-black tracking-[0.2em]" style={{ backgroundColor: YELLOW, color: BLUE }}>
            ADMIN
          </span>
        </Link>
        <nav className="flex gap-1.5">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-full px-4 py-1.5 text-[12px] font-extrabold uppercase tracking-[0.1em] no-underline transition-colors ${
                pathname === l.to ? 'text-white' : 'text-black/50 hover:text-black'
              }`}
              style={pathname === l.to ? { backgroundColor: BLUE } : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
