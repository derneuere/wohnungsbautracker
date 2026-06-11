import { createFileRoute } from '@tanstack/react-router'
import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { getProjects } from '../../server/projects'
import { getBvvParties } from '../../server/bvv'
import { getStats } from '../../server/stats'
import { PARTY_COLORS } from '../../lib/parties'
import {
  blockerTypeCounts,
  bezirkRanking,
  fmt,
  latestYearTotals,
  partyRanking,
  splitParties,
  statusBreakdown,
  totalUnits,
} from '../../lib/design-data'
import DesignSwitcher from '../../components/DesignSwitcher'

const MapView = lazy(() => import('../../components/Map'))

export const Route = createFileRoute('/designs/dashboard')({
  head: () => ({
    meta: [{ title: 'Lagezentrum Wohnungsbau — Entwurf 2' }],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700&display=swap',
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
  component: DashboardPage,
})

const STATUS_COLOR: Record<string, string> = {
  blockiert: '#EF4444',
  'verzögert': '#F59E0B',
  abgelehnt: '#64748B',
}

const BLOCKER_TYPE_LABEL: Record<string, string> = {
  partei: 'Partei',
  'bürgerinitiative': 'Bürgerinitiative',
  'behörde': 'Behörde',
  gericht: 'Gericht',
  umwelt: 'Umwelt',
  investor: 'Investor',
}

const mono = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }
const condensed = { fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif" }

function Clock() {
  const [time, setTime] = useState<string | null>(null)
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('de-DE'))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return <span style={mono}>{time ?? '--:--:--'}</span>
}

function Panel({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-[#1E293B] bg-[#0E1526] ${className}`}>
      {title && (
        <div className="border-b border-[#1E293B] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748B]">
          {title}
        </div>
      )}
      {children}
    </div>
  )
}

function DashboardPage() {
  const { projects, bvvParties, stats } = Route.useLoaderData()
  const [statusFilter, setStatusFilter] = useState<string>('')

  const units = totalUnits(projects)
  const byStatus = statusBreakdown(projects)
  const ranking = useMemo(() => partyRanking(projects), [projects])
  const bezirke = useMemo(() => bezirkRanking(projects), [projects])
  const blockerTypes = useMemo(() => blockerTypeCounts(projects), [projects])
  const { year: statsYear, approved, completed } = latestYearTotals(stats)

  const maxRankUnits = ranking[0]?.units || 1
  const maxBezirk = bezirke[0]?.projects || 1
  const maxBlockerType = blockerTypes[0]?.count || 1

  const bezirkPartyMap = useMemo(() => {
    const map: Record<string, string> = {}
    bvvParties.forEach((b) => { map[b.bezirk] = b.rulingParty })
    return map
  }, [bvvParties])

  const tableProjects = useMemo(() => {
    const list = statusFilter ? projects.filter((p) => p.status === statusFilter) : projects
    return [...list].sort((a, b) => (b.unitCount || 0) - (a.unitCount || 0))
  }, [projects, statusFilter])

  // conic-gradient segments for the status donut
  const donut = useMemo(() => {
    const total = projects.length || 1
    let acc = 0
    const stops = byStatus.map((s) => {
      const from = (acc / total) * 100
      acc += s.count
      const to = (acc / total) * 100
      return `${STATUS_COLOR[s.status] || '#64748B'} ${from}% ${to}%`
    })
    return `conic-gradient(${stops.join(', ')})`
  }, [byStatus, projects.length])

  return (
    <div className="min-h-screen bg-[#070B14] pb-24 text-[#E2E8F0]">
      {/* Top bar */}
      <header className="border-b border-[#1E293B] bg-[#0A101D] px-5 py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <h1 className="text-xl font-bold uppercase tracking-[0.25em] text-white" style={condensed}>
              Lagezentrum Wohnungsbau
            </h1>
          </div>
          <div className="flex items-center gap-5 text-[11px] uppercase tracking-[0.15em] text-[#64748B]">
            <span>Berlin · Bezirksebene</span>
            <span className="text-[#22D3EE]"><Clock /></span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 px-5 pt-4">
        {/* KPI row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            { label: 'Vorgänge erfasst', value: projects.length, color: '#22D3EE', sub: 'in 12 Bezirken' },
            { label: 'WE betroffen', value: units, color: '#EF4444', sub: 'blockiert / verzögert / abgelehnt' },
            { label: `WE genehmigt ${statsYear}`, value: approved, color: '#10B981', sub: 'Amt für Statistik' },
            { label: `WE fertig ${statsYear}`, value: completed, color: '#10B981', sub: 'Amt für Statistik' },
            { label: 'Genehmigungslücke', value: approved - completed, color: '#F59E0B', sub: 'genehmigt − fertig' },
          ].map((kpi) => (
            <div key={kpi.label} className="overflow-hidden rounded-lg border border-[#1E293B] bg-[#0E1526]">
              <div className="h-1" style={{ backgroundColor: kpi.color }} />
              <div className="px-4 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">{kpi.label}</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums" style={{ ...mono, color: kpi.color }}>
                  {fmt(kpi.value)}
                </div>
                <div className="mt-0.5 text-[10px] text-[#475569]">{kpi.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left 2/3 */}
          <div className="space-y-4 lg:col-span-2">
            <Panel title="Blockade-Ranking nach Partei · Wohneinheiten">
              <div className="space-y-3 p-4">
                {ranking.map((r) => (
                  <div key={r.party} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-right text-xs font-semibold text-[#94A3B8]">{r.party}</span>
                    <div className="h-5 flex-1 overflow-hidden rounded-sm bg-[#111B30]">
                      <div
                        className="flex h-5 items-center justify-end rounded-sm pr-2"
                        style={{
                          width: `${Math.max(3, (r.units / maxRankUnits) * 100)}%`,
                          backgroundColor: PARTY_COLORS[r.party] || '#475569',
                          boxShadow: `0 0 12px ${PARTY_COLORS[r.party] || '#475569'}55`,
                        }}
                      />
                    </div>
                    <span className="w-28 shrink-0 text-right text-xs tabular-nums text-[#94A3B8]" style={mono}>
                      {fmt(r.units)} WE · {r.projects}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Lagekarte · Vorgänge nach Standort">
              <div className="h-[320px] w-full overflow-hidden rounded-b-lg">
                <Suspense fallback={<div className="flex h-full items-center justify-center text-xs text-[#475569]" style={mono}>RENDERING MAP…</div>}>
                  <MapView projects={tableProjects} bezirkPartyMap={bezirkPartyMap} variant="dark" />
                </Suspense>
              </div>
            </Panel>
          </div>

          {/* Right 1/3 */}
          <div className="space-y-4">
            <Panel title="Status-Verteilung">
              <div className="flex items-center gap-5 p-4">
                <div className="relative h-28 w-28 shrink-0 rounded-full" style={{ background: donut }}>
                  <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-[#0E1526]">
                    <span className="text-lg font-semibold tabular-nums text-white" style={mono}>{projects.length}</span>
                    <span className="text-[9px] uppercase tracking-widest text-[#64748B]">Vorgänge</span>
                  </div>
                </div>
                <ul className="flex-1 space-y-2">
                  {byStatus.map((s) => (
                    <li key={s.status} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 capitalize text-[#94A3B8]">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLOR[s.status] }} />
                        {s.status}
                      </span>
                      <span className="tabular-nums text-[#E2E8F0]" style={mono}>{s.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>

            <Panel title="Hemmnis-Typen · Nennungen">
              <div className="space-y-2.5 p-4">
                {blockerTypes.map((b) => (
                  <div key={b.type}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#94A3B8]">{BLOCKER_TYPE_LABEL[b.type] || b.type}</span>
                      <span className="tabular-nums" style={mono}>{b.count}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-[#111B30]">
                      <div className="h-1.5 rounded-full bg-[#22D3EE]" style={{ width: `${(b.count / maxBlockerType) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Bezirke · Vorgänge / BVV-Mehrheit">
              <ul className="divide-y divide-[#16213A] px-4">
                {bezirke.map((b) => (
                  <li key={b.bezirk} className="flex items-center gap-3 py-2 text-xs">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: PARTY_COLORS[bezirkPartyMap[b.bezirk]] || '#475569' }}
                      title={bezirkPartyMap[b.bezirk]}
                    />
                    <span className="flex-1 truncate text-[#94A3B8]">{b.bezirk}</span>
                    <div className="h-1.5 w-16 rounded-full bg-[#111B30]">
                      <div className="h-1.5 rounded-full bg-[#475569]" style={{ width: `${(b.projects / maxBezirk) * 100}%` }} />
                    </div>
                    <span className="w-6 text-right tabular-nums" style={mono}>{b.projects}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>

        {/* Table */}
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B] px-4 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748B]">
              Vorgangsliste · {tableProjects.length} Einträge
            </span>
            <div className="flex gap-1.5">
              {['', 'blockiert', 'verzögert', 'abgelehnt'].map((s) => (
                <button
                  key={s || 'alle'}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                    statusFilter === s
                      ? 'border-[#22D3EE] bg-[#22D3EE]/10 text-[#22D3EE]'
                      : 'border-[#1E293B] text-[#64748B] hover:border-[#334155] hover:text-[#94A3B8]'
                  }`}
                  style={mono}
                >
                  {s || 'Alle'}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.18em] text-[#475569]">
                  <th className="px-4 py-2 font-semibold" style={mono}>ID</th>
                  <th className="px-4 py-2 font-semibold">Vorgang</th>
                  <th className="hidden px-4 py-2 font-semibold md:table-cell">Bezirk</th>
                  <th className="hidden px-4 py-2 font-semibold sm:table-cell">Parteien</th>
                  <th className="px-4 py-2 text-right font-semibold">WE</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                  <th className="hidden px-4 py-2 font-semibold lg:table-cell">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111B30]">
                {tableProjects.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-[#111B30]/60">
                    <td className="px-4 py-2.5 tabular-nums text-[#475569]" style={mono}>
                      #{String(p.id).padStart(3, '0')}
                    </td>
                    <td className="max-w-md px-4 py-2.5 font-medium text-[#E2E8F0]">{p.title}</td>
                    <td className="hidden whitespace-nowrap px-4 py-2.5 text-[#64748B] md:table-cell">{p.bezirk}</td>
                    <td className="hidden px-4 py-2.5 sm:table-cell">
                      <div className="flex gap-1">
                        {splitParties(p).map((party) => (
                          <span
                            key={party}
                            className="h-2.5 w-2.5 rounded-full ring-1 ring-[#1E293B]"
                            style={{ backgroundColor: PARTY_COLORS[party] || '#475569' }}
                            title={party}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums" style={mono}>
                      {p.unitCount ? fmt(p.unitCount) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className="flex items-center gap-1.5 text-[11px] capitalize" style={{ color: STATUS_COLOR[p.status] }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: STATUS_COLOR[p.status], boxShadow: `0 0 6px ${STATUS_COLOR[p.status]}` }} />
                        {p.status}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-2.5 tabular-nums text-[#64748B] lg:table-cell" style={mono}>
                      {p.date || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <footer className="flex items-center justify-between py-3 text-[10px] uppercase tracking-[0.18em] text-[#334155]" style={mono}>
          <span>WBT/OPS · Entwurf 2</span>
          <span>Quellen: BVV-Drucksachen · Pressespiegel · Amt für Statistik</span>
        </footer>
      </main>

      <DesignSwitcher />
    </div>
  )
}
