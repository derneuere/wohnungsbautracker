import { createFileRoute } from '@tanstack/react-router'
import { Suspense, lazy, useMemo, useState } from 'react'
import { Ban, Clock3, XCircle, Home, HousePlus, FileCheck2, MapPin, ExternalLink } from 'lucide-react'
import { getProjects } from '../../server/projects'
import { getBvvParties } from '../../server/bvv'
import { getStats } from '../../server/stats'
import { BEZIRKE } from '../../lib/parties'
import { fmt, latestYearTotals, parseBlockers, totalUnits } from '../../lib/design-data'
import DesignSwitcher from '../../components/DesignSwitcher'

const MapView = lazy(() => import('../../components/Map'))

export const Route = createFileRoute('/designs/kiez')({
  head: () => ({
    meta: [{ title: 'Kiez-Check — Entwurf 3' }],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap',
      },
    ],
  }),
  loader: async () => {
    const [projects, bvvParties, stats] = await Promise.all([
      getProjects(),
      getBvvParties(),
      getStats(),
    ])
    return { projects, bvvParties, stats }
  },
  component: KiezPage,
})

const STATUS_META: Record<string, { label: string; color: string; soft: string; Icon: typeof Ban }> = {
  blockiert: { label: 'Blockiert', color: '#D9534F', soft: '#FBEAE9', Icon: Ban },
  'verzögert': { label: 'Verzögert', color: '#E8A33D', soft: '#FCF3E3', Icon: Clock3 },
  abgelehnt: { label: 'Abgelehnt', color: '#8B8378', soft: '#F0EDE7', Icon: XCircle },
}

function KiezPage() {
  const { projects, bvvParties, stats } = Route.useLoaderData()
  const [bezirk, setBezirk] = useState('')
  const [status, setStatus] = useState('')

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        if (bezirk && p.bezirk !== bezirk) return false
        if (status && p.status !== status) return false
        return true
      }),
    [projects, bezirk, status],
  )

  const bezirkCounts = useMemo(() => {
    const map: Record<string, number> = {}
    projects.forEach((p) => { map[p.bezirk] = (map[p.bezirk] || 0) + 1 })
    return map
  }, [projects])

  const bezirkPartyMap = useMemo(() => {
    const map: Record<string, string> = {}
    bvvParties.forEach((b) => { map[b.bezirk] = b.rulingParty })
    return map
  }, [bvvParties])

  const { year: statsYear, completed } = latestYearTotals(stats)
  const units = totalUnits(filtered)
  const blockedCount = filtered.filter((p) => p.status === 'blockiert').length

  return (
    <div className="min-h-screen bg-[#FAF6EF] pb-28 text-[#33302B]" style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8">

        {/* Hero */}
        <header className="rounded-[2rem] bg-[#2F8F83] px-7 py-10 text-white shadow-[0_12px_40px_rgba(47,143,131,0.25)] sm:px-12 sm:py-14">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#BDE6E0]">Kiez-Check · Berlin</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
            Was passiert eigentlich in deinem Kiez?
          </h1>
          <p className="mt-4 max-w-xl text-base font-semibold text-[#DDF2EF] sm:text-lg">
            {fmt(projects.length)} Wohnprojekte stecken gerade in Berlin fest — zusammen{' '}
            {fmt(totalUnits(projects))} Wohnungen. Schau nach, welche bei dir um die Ecke liegen
            und woran es hakt.
          </p>
        </header>

        {/* Bezirk pills */}
        <section className="mt-8">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.15em] text-[#8B8378]">Dein Bezirk</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setBezirk('')}
              className={`rounded-full px-4 py-2 text-sm font-extrabold transition-all ${
                bezirk === ''
                  ? 'bg-[#33302B] text-white shadow-md'
                  : 'bg-white text-[#666057] shadow-sm hover:shadow-md'
              }`}
            >
              Ganz Berlin
            </button>
            {BEZIRKE.map((b) => (
              <button
                key={b}
                onClick={() => setBezirk(bezirk === b ? '' : b)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                  bezirk === b
                    ? 'bg-[#33302B] text-white shadow-md'
                    : 'bg-white text-[#666057] shadow-sm hover:shadow-md'
                }`}
              >
                {b}
                <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[11px] font-black ${bezirk === b ? 'bg-white/20' : 'bg-[#F0EDE7]'}`}>
                  {bezirkCounts[b] || 0}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Stat cards */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              Icon: Home,
              value: fmt(units),
              label: bezirk ? `Wohnungen hängen in ${bezirk} fest` : 'Wohnungen hängen gerade fest',
              bg: '#E2654A',
            },
            {
              Icon: Ban,
              value: fmt(blockedCount),
              label: 'Projekte sind komplett blockiert',
              bg: '#D9534F',
            },
            {
              Icon: FileCheck2,
              value: fmt(completed),
              label: `Wohnungen wurden ${statsYear} trotzdem fertig`,
              bg: '#2F8F83',
            },
          ].map((card) => (
            <div key={card.label} className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[0_6px_24px_rgba(51,48,43,0.07)]">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: card.bg }}>
                <card.Icon size={26} strokeWidth={2.4} />
              </div>
              <div>
                <div className="text-2xl font-black tabular-nums">{card.value}</div>
                <div className="text-sm font-semibold leading-snug text-[#8B8378]">{card.label}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Map */}
        <section className="mt-8 overflow-hidden rounded-[2rem] bg-white p-2 shadow-[0_6px_24px_rgba(51,48,43,0.07)]">
          <div className="h-[360px] w-full overflow-hidden rounded-[1.6rem]">
            <Suspense fallback={<div className="flex h-full items-center justify-center text-sm font-bold text-[#C7C1B6]">Karte lädt…</div>}>
              <MapView projects={filtered} bezirkPartyMap={bezirkPartyMap} />
            </Suspense>
          </div>
        </section>

        {/* Status filter */}
        <section className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black sm:text-2xl">
            {bezirk ? `Projekte in ${bezirk}` : 'Alle festgefahrenen Projekte'}
            <span className="ml-2 text-[#C7C1B6]">({filtered.length})</span>
          </h2>
          <div className="flex gap-2">
            {Object.entries(STATUS_META).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setStatus(status === key ? '' : key)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold transition-all ${
                  status === key ? 'text-white shadow-md' : 'bg-white shadow-sm hover:shadow-md'
                }`}
                style={status === key ? { backgroundColor: meta.color } : { color: meta.color }}
              >
                <meta.Icon size={15} strokeWidth={2.6} />
                {meta.label}
              </button>
            ))}
          </div>
        </section>

        {/* Project cards */}
        <section className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const meta = STATUS_META[p.status] || STATUS_META.abgelehnt
            const blockers = parseBlockers(p)
            return (
              <article key={p.id} className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_6px_24px_rgba(51,48,43,0.07)] transition-transform hover:-translate-y-1">
                <div className="h-2.5" style={{ backgroundColor: meta.color }} />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold"
                      style={{ backgroundColor: meta.soft, color: meta.color }}
                    >
                      <meta.Icon size={13} strokeWidth={2.8} />
                      {meta.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-[#8B8378]">
                      <MapPin size={13} />
                      {p.bezirk}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-extrabold leading-snug">{p.title}</h3>
                  {p.description && (
                    <p className="mt-2 line-clamp-3 text-sm font-medium leading-relaxed text-[#8B8378]">
                      {p.description}
                    </p>
                  )}
                  {blockers.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {blockers.slice(0, 3).map((b, i) => (
                        <span key={i} className="rounded-full bg-[#F0EDE7] px-2.5 py-1 text-[11px] font-bold text-[#666057]">
                          {b.name}
                        </span>
                      ))}
                      {blockers.length > 3 && (
                        <span className="rounded-full bg-[#F0EDE7] px-2.5 py-1 text-[11px] font-bold text-[#A8A195]">
                          +{blockers.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-auto flex items-end justify-between pt-4">
                    {p.unitCount ? (
                      <div className="flex items-center gap-2">
                        <HousePlus size={20} strokeWidth={2.4} className="text-[#E2654A]" />
                        <div>
                          <div className="text-xl font-black leading-none tabular-nums">{fmt(p.unitCount)}</div>
                          <div className="text-[11px] font-bold text-[#A8A195]">geplante Wohnungen</div>
                        </div>
                      </div>
                    ) : <span />}
                    {p.sourceUrl && (
                      <a
                        href={p.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-extrabold text-[#2F8F83] no-underline hover:underline"
                      >
                        Drucksache <ExternalLink size={12} strokeWidth={2.8} />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        {filtered.length === 0 && (
          <p className="rounded-3xl bg-white py-16 text-center text-base font-bold text-[#A8A195] shadow-sm">
            In diesem Kiez ist mit diesen Filtern (zum Glück?) nichts festgefahren. 🎉
          </p>
        )}

        {/* About */}
        <footer className="mt-12 rounded-[2rem] bg-[#33302B] px-7 py-9 text-[#D9D4CA] sm:px-12">
          <h2 className="text-lg font-black text-white">Warum dieser Tracker?</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed">
            Wohnungen entstehen nicht von allein — und verschwinden auch nicht von allein aus
            der Planung. Der Kiez-Check sammelt blockierte, verzögerte und abgelehnte
            Neubauprojekte in Berlin und zeigt, welche Akteure vor Ort bremsen. Damit du beim
            nächsten Kiez-Gespräch nicht nur ein Gefühl, sondern Zahlen hast.
          </p>
        </footer>
      </div>

      <DesignSwitcher />
    </div>
  )
}
