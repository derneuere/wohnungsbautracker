import { HeadContent, Outlet, Scripts, createRootRoute, Link, useRouterState } from '@tanstack/react-router'
import appCss from '../styles.css?url'
import WbtLogo from '../components/WbtLogo'
import { BLUE, YELLOW } from '../lib/campaign'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Wohnungsbau-Tracker Berlin' },
      { name: 'description', content: 'Welche Parteien blockieren Neubauprojekte in Berlin?' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'stylesheet',
        href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
      },
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
      </body>
    </html>
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
          <WbtLogo height={30} />
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
