import { HeadContent, Outlet, Scripts, createRootRoute, Link, useRouterState } from '@tanstack/react-router'
import appCss from '../styles.css?url'

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

  return (
    <header className="sticky top-0 z-[1000] border-b border-[#E5E5E5] bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-[#111] no-underline">
          <span className="text-lg font-bold tracking-tight">
            Wohnungsbau-Tracker <span className="text-[#BE2837]">Berlin</span>
          </span>
        </Link>
        <nav className="flex gap-1">
          <Link
            to="/admin"
            className={`rounded px-3 py-1.5 text-sm font-medium no-underline transition-colors ${
              pathname === '/admin'
                ? 'bg-[#BE2837] text-white'
                : 'text-[#999] hover:bg-gray-100 hover:text-[#111]'
            }`}
          >
            Projekte
          </Link>
          <Link
            to="/admin/bvv"
            className={`rounded px-3 py-1.5 text-sm font-medium no-underline transition-colors ${
              pathname === '/admin/bvv'
                ? 'bg-[#BE2837] text-white'
                : 'text-[#999] hover:bg-gray-100 hover:text-[#111]'
            }`}
          >
            BVV-Parteien
          </Link>
          <Link
            to="/admin/stats"
            className={`rounded px-3 py-1.5 text-sm font-medium no-underline transition-colors ${
              pathname === '/admin/stats'
                ? 'bg-[#BE2837] text-white'
                : 'text-[#999] hover:bg-gray-100 hover:text-[#111]'
            }`}
          >
            Statistiken
          </Link>
        </nav>
      </div>
    </header>
  )
}
