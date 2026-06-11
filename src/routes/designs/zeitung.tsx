import { createFileRoute } from '@tanstack/react-router'
import { Suspense, lazy, useMemo } from 'react'
import { getProjects } from '../../server/projects'
import { getBvvParties } from '../../server/bvv'
import { getStats } from '../../server/stats'
import {
  fmt,
  latestYearTotals,
  parseBlockers,
  partyRanking,
  statusBreakdown,
  totalUnits,
} from '../../lib/design-data'
import DesignSwitcher from '../../components/DesignSwitcher'

const MapView = lazy(() => import('../../components/Map'))

export const Route = createFileRoute('/designs/zeitung')({
  head: () => ({
    meta: [{ title: 'Der Baustopp-Bote — Entwurf 1' }],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap',
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
  component: ZeitungPage,
})

const STATUS_MARK: Record<string, string> = {
  blockiert: '■ Blockiert',
  'verzögert': '▲ Verzögert',
  abgelehnt: '✕ Abgelehnt',
}

function ZeitungPage() {
  const { projects, bvvParties, stats } = Route.useLoaderData()

  const units = totalUnits(projects)
  const byStatus = statusBreakdown(projects)
  const ranking = useMemo(() => partyRanking(projects).slice(0, 7), [projects])
  const maxUnits = ranking[0]?.units || 1
  const { year: statsYear, approved, completed } = latestYearTotals(stats)

  const bezirkPartyMap = useMemo(() => {
    const map: Record<string, string> = {}
    bvvParties.forEach((b) => { map[b.bezirk] = b.rulingParty })
    return map
  }, [bvvParties])

  const sorted = useMemo(
    () => [...projects].sort((a, b) => (b.unitCount || 0) - (a.unitCount || 0)),
    [projects],
  )

  const today = new Date().toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#FAF7F0] pb-24 text-[#1a1a1a]" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">

        {/* Top rule with dateline */}
        <div className="flex items-baseline justify-between border-b border-[#1a1a1a] pt-6 pb-1 text-[11px] uppercase tracking-[0.18em]">
          <span>Nr. 55 / Sonderausgabe</span>
          <span className="hidden sm:inline">{today}</span>
          <span>Berlin · 2,50 €</span>
        </div>

        {/* Masthead */}
        <header className="border-b-4 border-double border-[#1a1a1a] py-6 text-center">
          <h1 className="text-5xl leading-none sm:text-7xl" style={{ fontFamily: "'UnifrakturMaguntia', serif" }}>
            Der Baustopp-Bote
          </h1>
          <p className="mt-3 text-[12px] uppercase tracking-[0.3em] text-[#555]">
            Unabhängige Chronik des Berliner Wohnungsstillstands
          </p>
        </header>

        {/* Lead + Zahlen box */}
        <main className="grid gap-10 border-b border-[#1a1a1a] py-10 lg:grid-cols-3">
          <article className="lg:col-span-2">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8B0000]">
              Sonderbericht zum Wohnungsbau
            </p>
            <h2 className="text-3xl font-black leading-tight sm:text-5xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {fmt(units)} Wohnungen warten auf den ersten Spatenstich
            </h2>
            <p className="mt-3 text-base italic text-[#555]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              In allen zwölf Bezirken ruhen Bauvorhaben — eine Bestandsaufnahme der Blockaden, Verzögerungen und Absagen.
            </p>
            <div className="zeitung-body mt-6 text-[15px] leading-[1.7] sm:columns-2 sm:gap-8">
              <p className="zeitung-dropcap">
                Berlin baut nicht — Berlin verhandelt. {fmt(projects.length)} Neubauprojekte
                hat diese Redaktion in den Drucksachen der Bezirksverordnetenversammlungen
                und im Pressespiegel der Stadt aufgespürt, die derzeit nicht vorankommen.
                {' '}{byStatus.map((s) => `${s.count} davon gelten als ${s.status}`).join(', ')}.
                Zusammengerechnet stehen damit {fmt(units)} Wohneinheiten auf dem Papier,
                aber nicht auf der Baustelle.
              </p>
              <p className="mt-4">
                Die Gründe sind so vielfältig wie die Stadt selbst: Parteien, die in der
                BVV die Hand heben oder eben nicht; Bürgerinitiativen, die um jeden
                Kleingarten kämpfen; Behörden, die prüfen, und Gerichte, die entscheiden.
                Wer am häufigsten bremst, zeigt unser Ranking rechts unten — gemessen an
                den betroffenen Wohneinheiten.
              </p>
              <p className="mt-4">
                Zum Vergleich: Im Jahr {statsYear} wurden in Berlin {fmt(approved)} Wohnungen
                genehmigt, aber nur {fmt(completed)} fertiggestellt. Die Lücke von{' '}
                {fmt(approved - completed)} Einheiten ist kein statistischer Zufall,
                sondern das Ergebnis vieler kleiner Entscheidungen — die diese Zeitung
                fortan dokumentiert.
              </p>
            </div>
          </article>

          {/* Die Zahlen */}
          <aside className="border-t-4 border-[#1a1a1a] lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0 pt-6">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.2em]">Die Zahlen des Tages</h3>
            <dl className="mt-4 divide-y divide-[#d8d2c4]">
              {[
                { label: 'Erfasste Projekte', value: fmt(projects.length) },
                ...byStatus.map((s) => ({
                  label: `davon ${s.status}`,
                  value: fmt(s.count),
                })),
                { label: 'Betroffene Wohneinheiten', value: fmt(units) },
                { label: `Genehmigt ${statsYear}`, value: fmt(approved) },
                { label: `Fertiggestellt ${statsYear}`, value: fmt(completed) },
              ].map((row) => (
                <div key={row.label} className="flex items-baseline justify-between py-2.5">
                  <dt className="text-[13px] text-[#555]">{row.label}</dt>
                  <dd className="text-xl font-black tabular-nums" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            <h3 className="mt-8 text-[13px] font-bold uppercase tracking-[0.2em]">Das Bremser-Ranking</h3>
            <p className="mt-1 text-[12px] italic text-[#777]">Beteiligte Parteien, nach betroffenen Wohneinheiten</p>
            <div className="mt-3 space-y-2.5">
              {ranking.map((r) => (
                <div key={r.party}>
                  <div className="flex items-baseline justify-between text-[13px]">
                    <span className="font-semibold">{r.party}</span>
                    <span className="tabular-nums text-[#555]">{fmt(r.units)} WE · {r.projects} Proj.</span>
                  </div>
                  <div className="mt-1 h-2 w-full bg-[#e8e2d4]">
                    <div className="h-2 bg-[#1a1a1a]" style={{ width: `${Math.max(2, (r.units / maxUnits) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </main>

        {/* Grayscale map */}
        <section className="border-b border-[#1a1a1a] py-8">
          <h3 className="mb-1 text-center text-[13px] font-bold uppercase tracking-[0.2em]">Die Karte des Stillstands</h3>
          <p className="mb-4 text-center text-[12px] italic text-[#777]">
            Jeder Punkt ein ruhendes Vorhaben — eingefärbt nach erstgenannter Partei
          </p>
          <div className="h-[340px] w-full border border-[#1a1a1a]" style={{ filter: 'grayscale(1) contrast(1.05)' }}>
            <Suspense fallback={<div className="flex h-full items-center justify-center text-sm italic text-[#999]">Karte wird gesetzt…</div>}>
              <MapView projects={projects} bezirkPartyMap={bezirkPartyMap} />
            </Suspense>
          </div>
        </section>

        {/* Meldungen */}
        <section className="py-10">
          <h3 className="mb-6 border-b-2 border-[#1a1a1a] pb-2 text-2xl font-black" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Meldungen aus den Bezirken
          </h3>
          <div className="gap-8 sm:columns-2 lg:columns-3">
            {sorted.map((p) => {
              const blockers = parseBlockers(p)
              return (
                <article key={p.id} className="mb-7 break-inside-avoid border-b border-[#d8d2c4] pb-6">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#8B0000]">
                    {p.bezirk}{p.date ? ` · ${p.date}` : ''}
                  </p>
                  <h4 className="mt-1 text-lg font-bold leading-snug" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {p.title}
                  </h4>
                  <p className="mt-1 text-[12px] font-semibold uppercase tracking-wider text-[#555]">
                    {STATUS_MARK[p.status] || p.status}
                    {p.unitCount ? ` · ${fmt(p.unitCount)} WE` : ''}
                  </p>
                  {p.description && (
                    <p className="mt-2 text-[14px] leading-relaxed text-[#333]">{p.description}</p>
                  )}
                  {blockers.length > 0 && (
                    <p className="mt-2 text-[13px] italic text-[#666]">
                      Im Wege stehen: {blockers.map((b) => b.name).join(', ')}.
                    </p>
                  )}
                  {p.sourceUrl && (
                    <a
                      href={p.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-[13px] font-semibold text-[#8B0000] no-underline hover:underline"
                    >
                      → Zur Drucksache
                    </a>
                  )}
                </article>
              )
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t-4 border-double border-[#1a1a1a] py-6 text-center text-[12px] text-[#777]">
          <p className="italic">
            Der Baustopp-Bote erscheint, solange nicht gebaut wird — also auf unbestimmte Zeit.
          </p>
          <p className="mt-1 uppercase tracking-[0.2em]">
            Quellen: BVV-Drucksachen · Pressespiegel · Amt für Statistik
          </p>
        </footer>
      </div>

      <style>{`
        .zeitung-dropcap::first-letter {
          font-family: 'UnifrakturMaguntia', serif;
          font-size: 3.4em;
          float: left;
          line-height: 0.85;
          padding-right: 0.08em;
        }
        .zeitung-body p { break-inside: avoid-column; }
      `}</style>

      <DesignSwitcher />
    </div>
  )
}
