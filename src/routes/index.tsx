import { createFileRoute } from '@tanstack/react-router'
import { getProjects } from '../server/projects'
import { getBvvParties } from '../server/bvv'
import { getStats } from '../server/stats'
import { Suspense, lazy, useMemo, useState } from 'react'
import { PARTY_COLORS, BEZIRKE, PARTIES } from '../lib/parties'

const MapView = lazy(() => import('../components/Map'))

export const Route = createFileRoute('/')({
  loader: async () => {
    const [projects, bvvParties, stats] = await Promise.all([
      getProjects(),
      getBvvParties(),
      getStats(),
    ])
    return { projects, bvvParties, stats }
  },
  component: HomePage,
})

function HomePage() {
  const { projects, bvvParties, stats } = Route.useLoaderData()
  const [selectedBezirk, setSelectedBezirk] = useState('')
  const [selectedParty, setSelectedParty] = useState('')

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (selectedBezirk && p.bezirk !== selectedBezirk) return false
      if (selectedParty && p.party !== selectedParty) return false
      return true
    })
  }, [projects, selectedBezirk, selectedParty])

  const bezirkPartyMap = useMemo(() => {
    const map: Record<string, string> = {}
    bvvParties.forEach((b) => { map[b.bezirk] = b.rulingParty })
    return map
  }, [bvvParties])

  const totalApproved = stats.reduce((sum, s) => sum + s.approvedCount, 0)
  const totalCompleted = stats.reduce((sum, s) => sum + s.completedCount, 0)

  const partyCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredProjects.forEach((p) => { counts[p.party] = (counts[p.party] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [filteredProjects])

  return (
    <div className="min-h-screen bg-white">
      {/* Title bar */}
      <section className="px-6 py-4 sm:px-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-black tracking-tight text-[#111] sm:text-3xl">
            Wohnungsbau-Tracker <span className="text-[#BE2837]">Berlin</span>
          </h1>
        </div>
      </section>

      {/* Map */}
      <section>
        <div className="h-[450px]">
          <Suspense fallback={<div className="flex h-full items-center justify-center text-xs text-[#ccc]">Laden...</div>}>
            <MapView projects={filteredProjects} bezirkPartyMap={bezirkPartyMap} />
          </Suspense>
        </div>
      </section>

      {/* Numbers grid */}
      <section className="border-y border-[#111] px-6 sm:px-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 sm:grid-cols-4">
          {[
            { val: filteredProjects.length, label: 'Projekte', red: true },
            { val: filteredProjects.reduce((sum, p) => sum + (p.unitCount || 0), 0), label: 'Wohnungen', red: true, format: true },
            { val: totalApproved, label: 'Genehmigt', format: true },
            { val: totalCompleted, label: 'Fertig', format: true },
          ].map((item, i) => (
            <div
              key={i}
              className={`border-[#111] py-8 text-center ${i < 3 ? 'border-r' : ''} ${i === 1 ? 'sm:border-r' : ''}`}
            >
              <div className={`text-4xl font-black tabular-nums sm:text-5xl ${item.red ? 'text-[#BE2837]' : 'text-[#111]'}`}>
                {item.format ? item.val.toLocaleString('de-DE') : item.val}
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.15em] text-[#999]">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Party legend */}
      <section className="px-6 py-4 sm:px-12">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-4">
          {partyCounts.map(([party, count]) => (
            <span key={party} className="flex items-center gap-1.5 text-xs text-[#666]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PARTY_COLORS[party] || '#ccc' }} />
              {party} {count}
            </span>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-5xl px-6 pt-12 sm:px-12">
        <div className="mb-6 flex items-center gap-4 border-b border-[#E5E5E5] pb-4">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#999]">Filter</span>
          <select
            value={selectedBezirk}
            onChange={(e) => setSelectedBezirk(e.target.value)}
            className="border-0 border-b border-[#ccc] bg-transparent px-0 py-1 text-sm text-[#333] focus:border-[#111] focus:outline-none"
          >
            <option value="">Alle Bezirke</option>
            {BEZIRKE.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            value={selectedParty}
            onChange={(e) => setSelectedParty(e.target.value)}
            className="border-0 border-b border-[#ccc] bg-transparent px-0 py-1 text-sm text-[#333] focus:border-[#111] focus:outline-none"
          >
            <option value="">Alle Parteien</option>
            {PARTIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {(selectedBezirk || selectedParty) && (
            <button
              onClick={() => { setSelectedBezirk(''); setSelectedParty('') }}
              className="border-0 bg-transparent text-xs text-[#999] underline hover:text-[#333]"
            >
              Reset
            </button>
          )}
        </div>
      </section>

      {/* Project list */}
      <section className="mx-auto max-w-5xl px-6 pb-12 sm:px-12">
        <div className="divide-y divide-[#E5E5E5]">
          {filteredProjects.map((p) => (
            <article key={p.id} className="grid gap-4 py-5 sm:grid-cols-12">
              <div className="flex items-start gap-3 sm:col-span-8">
                <div className="mt-1.5 flex flex-shrink-0 gap-0.5">
                  {p.party.split(',').map((party: string, i: number) => (
                    <span key={i} className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: PARTY_COLORS[party.trim()] || '#ccc' }} />
                  ))}
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-snug text-[#111]">
                    {p.title}
                    {p.unitCount && <span className="ml-2 text-xs font-medium text-[#BE2837]">{p.unitCount.toLocaleString('de-DE')} WE</span>}
                  </h3>
                  {p.description && (
                    <p className="mt-1 text-sm leading-relaxed text-[#888]">{p.description}</p>
                  )}
                  {p.blockers && (() => {
                    try {
                      const blockers = typeof p.blockers === 'string' ? JSON.parse(p.blockers) : p.blockers
                      if (!Array.isArray(blockers)) return null
                      const typeColors: Record<string, string> = {
                        partei: 'bg-[#BE2837]/10 text-[#BE2837]',
                        'bürgerinitiative': 'bg-[#F59E0B]/10 text-[#92600a]',
                        'behörde': 'bg-[#3B82F6]/10 text-[#1e40af]',
                        gericht: 'bg-[#8B5CF6]/10 text-[#5b21b6]',
                        umwelt: 'bg-[#10B981]/10 text-[#065f46]',
                        investor: 'bg-[#111]/10 text-[#333]',
                      }
                      return (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {blockers.map((b: any, i: number) => (
                            <span key={i} className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${typeColors[b.type] || 'bg-gray-100 text-gray-600'}`}>
                              {b.name}
                            </span>
                          ))}
                        </div>
                      )
                    } catch { return null }
                  })()}
                </div>
              </div>
              <div className="flex items-start gap-4 text-xs text-[#999] sm:col-span-4 sm:justify-end sm:text-right">
                <div>
                  <div className="font-medium text-[#333]">{p.party.split(',').join(', ')}</div>
                  <div>{p.bezirk}</div>
                  {p.date && <div>{p.date}</div>}
                </div>
                <span className={`mt-0.5 rounded px-2 py-0.5 text-xs font-medium ${
                  p.status === 'blockiert' ? 'bg-[#BE2837] text-white' :
                  p.status === 'verzögert' ? 'bg-[#F59E0B] text-black' :
                  'bg-[#E5E5E5] text-[#666]'
                }`}>
                  {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </span>
                {(p.sourceUrl || p.pressUrls) && (
                  <div className="mt-0.5 flex flex-col items-end gap-0.5">
                    {p.sourceUrl && (
                      <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#BE2837] no-underline hover:underline">
                        Drucksache
                      </a>
                    )}
                    {(() => {
                      try {
                        const urls = typeof p.pressUrls === 'string' ? JSON.parse(p.pressUrls) : p.pressUrls
                        if (!Array.isArray(urls)) return null
                        return urls.map((link: any, i: number) => (
                          <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="text-[#666] no-underline hover:underline hover:text-[#333]">
                            {link.title}
                          </a>
                        ))
                      } catch { return null }
                    })()}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
        {filteredProjects.length === 0 && (
          <p className="py-16 text-center text-sm text-[#ccc]">Keine Projekte.</p>
        )}
      </section>

      {/* About */}
      <section className="border-t border-[#111] px-6 sm:px-12">
        <div className="mx-auto max-w-5xl py-12">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="text-lg font-black text-[#111]">Sichtbarkeit schaffen</h2>
            </div>
            <div>
              <p className="text-sm leading-relaxed text-[#666]">
                Dieses Projekt sammelt und visualisiert blockierte, verzögerte und abgelehnte Neubauprojekte in Berlin.
                Ziel ist es, Transparenz darüber zu schaffen, welche politischen Akteure auf Bezirksebene den Wohnungsbau
                bremsen — und wo dringend benötigter Wohnraum nicht entsteht.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
