import { Link, useRouterState } from '@tanstack/react-router'

const DESIGNS = [
  { to: '/designs/zeitung', label: 'Zeitung' },
  { to: '/designs/dashboard', label: 'Dashboard' },
  { to: '/designs/kiez', label: 'Kiez' },
  { to: '/designs/amt', label: 'Amt' },
  { to: '/designs/klassik', label: 'Klassik' },
]

export default function DesignSwitcher() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <nav className="fixed bottom-4 left-1/2 z-[5000] -translate-x-1/2">
      <div className="flex items-center gap-0.5 rounded-full border border-white/10 bg-black/85 px-1.5 py-1.5 shadow-2xl backdrop-blur">
        <Link
          to="/"
          className={`rounded-full px-2.5 py-1 text-xs font-medium no-underline transition-colors ${
            pathname === '/'
              ? 'bg-white text-black'
              : 'text-white/60 hover:bg-white/10 hover:text-white'
          }`}
          title="Hauptdesign (Kampagne)"
        >
          ⌂
        </Link>
        <Link
          to="/designs"
          className={`rounded-full px-2.5 py-1 text-xs font-medium no-underline transition-colors ${
            pathname === '/designs'
              ? 'bg-white text-black'
              : 'text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          Entwürfe
        </Link>
        {DESIGNS.map((d) => (
          <Link
            key={d.to}
            to={d.to}
            className={`rounded-full px-2.5 py-1 text-xs font-medium no-underline transition-colors ${
              pathname === d.to
                ? 'bg-white text-black'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {d.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
