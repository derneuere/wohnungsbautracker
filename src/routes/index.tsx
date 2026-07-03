import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { getProjects } from '../server/projects'
import { getStats } from '../server/stats'
import { PARTY_COLORS } from '../lib/parties'
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  type ProjectCategory,
  cityYearSeries,
  countableUnits,
  estimatedUnits,
  fmt,
  parseEstimateMeta,
  partyRanking,
  projectCategory,
  projectSlug,
  statusBreakdown,
  totalUnits,
  uniqueBlockerNames,
} from '../lib/design-data'
import BerlinSvgMap from '../components/BerlinSvgMap'
import WbtLogo from '../components/WbtLogo'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Wohnungsbau-Tracker Berlin — Wo blockiert wird, ist nichts möglich.' },
      { name: 'description', content: 'Welche Akteure blockieren den Wohnungsbau in Berlin? Alle blockierten, verzögerten und abgelehnten Neubauprojekte — mit Quellen.' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700;800&display=swap',
      },
    ],
  }),
  loader: async () => {
    const [projects, stats] = await Promise.all([getProjects(), getStats()])
    return { projects, stats }
  },
  component: KampagnePage,
})

const BLUE = '#0B2B6B'
const DEEP = '#02173A'
const YELLOW = '#FFED00'
const CYAN = '#1CB5E5'
const BLACK = '#111111'

const display = { fontFamily: "'Archivo Black', 'Arial Black', sans-serif" }

const STATUS_CHIP: Record<string, { bg: string; fg: string; label: string }> = {
  blockiert: { bg: BLACK, fg: YELLOW, label: 'BLOCKIERT' },
  'verzögert': { bg: CYAN, fg: '#fff', label: 'VERZÖGERT' },
  abgelehnt: { bg: '#fff', fg: BLUE, label: 'ABGELEHNT' },
}

function CountUp({ target }: { target: number }) {
  const [val, setVal] = useState(target)
  useEffect(() => {
    let raf = 0
    let start: number | null = null
    const duration = 2000
    const step = (t: number) => {
      if (start === null) start = t
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return <>{fmt(val)}</>
}

function KampagnePage() {
  const { projects, stats } = Route.useLoaderData()

  // Hauptzahl: belegte WE plus quellengeprüfte Schätzungen (dedupliziert)
  const gesamt = totalUnits(projects) + estimatedUnits(projects)
  const byStatus = statusBreakdown(projects, true)
  const ranking = useMemo(() => partyRanking(projects).slice(0, 6), [projects])
  const maxRank = ranking[0]?.units || 1
  const blockerNames = useMemo(() => uniqueBlockerNames(projects).slice(0, 18), [projects])
  const serie = useMemo(() => cityYearSeries(stats), [stats])

  const wall = useMemo(() => [...projects].sort((a, b) => (b.unitCount || 0) - (a.unitCount || 0)), [projects])

  // Kategorie-Filter für die Projektwand — zeigt live, welchen Einfluss das Aus-
  // blenden einzelner Blockade-Ursachen (z.B. Insolvenzen) auf die Bilanz hat.
  const [activeCats, setActiveCats] = useState<Set<ProjectCategory>>(() => new Set(CATEGORY_ORDER))
  const catStats = useMemo(() => {
    const map = new Map<ProjectCategory, { n: number; units: number }>()
    CATEGORY_ORDER.forEach((c) => map.set(c, { n: 0, units: 0 }))
    projects.forEach((p) => {
      const c = projectCategory(p)
      const e = map.get(c)!
      e.n += 1
      e.units += countableUnits(p)
    })
    return map
  }, [projects])
  const filteredWall = useMemo(
    () => wall.filter((p) => activeCats.has(projectCategory(p))),
    [wall, activeCats],
  )
  const filteredUnits = useMemo(
    () => filteredWall.reduce((s, p) => s + countableUnits(p), 0),
    [filteredWall],
  )
  const toggleCat = (c: ProjectCategory) =>
    setActiveCats((prev) => {
      const next = new Set(prev)
      if (next.has(c)) next.delete(c)
      else next.add(c)
      return next
    })
  const allActive = activeCats.size === CATEGORY_ORDER.length

  const slabColors = [
    { bg: BLACK, fg: YELLOW },
    { bg: CYAN, fg: '#fff' },
    { bg: YELLOW, fg: BLUE },
  ]

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Archivo', 'Helvetica Neue', sans-serif" }}>

      {/* Sticky nav */}
      <nav className="sticky top-0 z-[2000] border-b border-black/5 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="flex items-center no-underline" title="Wohnungsbau-Tracker Berlin">
            <WbtLogo />
          </a>
          <div className="flex items-center gap-6">
            <div className="hidden gap-6 text-[13px] font-bold uppercase tracking-[0.12em] text-black sm:flex">
              <a href="#zahlen" className="no-underline hover:text-[#1CB5E5]">Zahlen</a>
              <a href="#bremser" className="no-underline hover:text-[#1CB5E5]">Bremser</a>
              <a href="#karte" className="no-underline hover:text-[#1CB5E5]">Karte</a>
              <a href="#projekte" className="no-underline hover:text-[#1CB5E5]">Projekte</a>
            </div>
            <a
              href="#mitmachen"
              className="rounded-full px-5 py-2 text-[13px] font-extrabold uppercase tracking-[0.1em] text-white no-underline transition-transform hover:scale-105"
              style={{ backgroundColor: CYAN }}
            >
              Hinsehen
            </a>
          </div>
        </div>
      </nav>

      {/* Hero — poster gradient */}
      <header
        id="top"
        className="relative flex min-h-[88vh] flex-col justify-center overflow-hidden px-5 sm:px-8"
        style={{
          background: `linear-gradient(180deg, ${DEEP} 0%, #07336B 38%, #6E9CCD 62%, #E9E2C2 80%, ${YELLOW} 100%)`,
        }}
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="h-2 w-44 sm:w-64" style={{ backgroundColor: CYAN }} />
          <h1
            className="mt-6 max-w-4xl"
            style={{
              ...display,
              color: YELLOW,
              fontSize: 'clamp(2.6rem, 8.5vw, 6.5rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.01em',
            }}
          >
            Wo blockiert wird, ist nichts möglich.
          </h1>
          <p className="mt-8 max-w-xl text-lg font-bold leading-snug text-white sm:text-2xl">
            {fmt(gesamt)} Wohnungen stehen in Berlin still.
            <br />
            Dieser Tracker zeigt, wer auf der Bremse steht.
          </p>
        </div>
        <a
          href="#zahlen"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-3xl font-black no-underline"
          style={{ color: BLUE }}
          aria-label="Zu den Zahlen"
        >
          ↓
        </a>
      </header>

      {/* Zahlen */}
      <section id="zahlen" className="px-5 py-20 text-center sm:px-8" style={{ backgroundColor: BLUE }}>
        <p className="text-[13px] font-extrabold uppercase tracking-[0.35em] text-white">
          Wohneinheiten in der Warteschleife
        </p>
        <div
          className="mt-4 tabular-nums"
          style={{ ...display, color: YELLOW, fontSize: 'clamp(3.5rem, 14vw, 10rem)', lineHeight: 1 }}
        >
          <CountUp target={gesamt} />
        </div>
        <p className="mx-auto mt-4 max-w-md text-sm font-semibold text-white/60">
          aus {fmt(projects.length)} blockierten, verzögerten und abgelehnten Projekten
        </p>

        <div className="mx-auto mt-14 grid max-w-4xl gap-5 sm:grid-cols-3">
          {byStatus.map((s, i) => (
            <div key={s.status} className="px-6 py-8" style={{ backgroundColor: slabColors[i].bg, color: slabColors[i].fg }}>
              <div style={{ ...display, fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', lineHeight: 1 }}>{s.count}×</div>
              <div className="mt-2 text-sm font-extrabold uppercase tracking-[0.2em]">{s.status}</div>
              <div className="mt-1 text-xs font-bold opacity-70">{fmt(s.units)} Wohnungen</div>
            </div>
          ))}
        </div>

        {serie.length > 1 && (
          <div className="mx-auto mt-14 max-w-4xl">
            <p className="text-[13px] font-extrabold uppercase tracking-[0.35em] text-white">
              Genehmigt vs. gebaut seit {serie[0].year}
            </p>
            {(() => {
              const max = Math.max(...serie.flatMap((y) => [y.approved, y.completed])) || 1
              return (
                <div className="mt-8 flex items-end gap-1.5 sm:gap-3">
                  {serie.map((y) => (
                    <div
                      key={y.year}
                      className="group relative flex flex-1 cursor-default flex-col items-center gap-2 rounded-sm pt-2 transition-colors hover:bg-white/10"
                    >
                      {/* Tooltip */}
                      <div
                        className="pointer-events-none absolute left-1/2 top-0 z-10 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap border-2 px-3 py-2 text-left group-hover:block"
                        style={{ backgroundColor: DEEP, borderColor: YELLOW }}
                      >
                        <div className="text-xs font-black text-white">{y.year}</div>
                        <div className="text-[11px] font-bold tabular-nums" style={{ color: YELLOW }}>
                          {fmt(y.approved)} genehmigt
                        </div>
                        <div className="text-[11px] font-bold tabular-nums" style={{ color: CYAN }}>
                          {fmt(y.completed)} fertiggestellt
                        </div>
                      </div>

                      <div className="flex h-36 w-full items-end justify-center gap-0.5 sm:gap-1">
                        <div
                          className="w-1/2 max-w-[22px]"
                          style={{ height: `${(y.approved / max) * 100}%`, backgroundColor: YELLOW }}
                        />
                        <div
                          className="w-1/2 max-w-[22px]"
                          style={{ height: `${(y.completed / max) * 100}%`, backgroundColor: CYAN }}
                        />
                      </div>
                      <span className="text-[10px] font-extrabold tabular-nums text-white/50">
                        ’{String(y.year).slice(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )
            })()}
            <div className="mt-4 flex justify-center gap-6 text-[11px] font-extrabold uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2 text-white/60">
                <span className="h-2.5 w-2.5" style={{ backgroundColor: YELLOW }} /> Genehmigt
              </span>
              <span className="flex items-center gap-2 text-white/60">
                <span className="h-2.5 w-2.5" style={{ backgroundColor: CYAN }} /> Fertiggestellt
              </span>
            </div>
            <p className="mx-auto mt-3 max-w-md text-center text-[11px] font-semibold text-white/40">
              Wohnungen im Land Berlin je Jahr — Quelle: Amt für Statistik Berlin-Brandenburg.
            </p>
          </div>
        )}
      </section>

      {/* Ticker */}
      <div className="overflow-hidden py-4" style={{ backgroundColor: YELLOW }}>
        <div className="kampagne-marquee flex w-max items-center gap-10 whitespace-nowrap">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-6" aria-hidden={copy === 1}>
              <span className="text-xl uppercase" style={{ ...display, color: BLACK }}>+++</span>
              <span className="text-xl uppercase" style={{ ...display, color: BLACK }}>Die Verhinderer:</span>
              {blockerNames.map((name) => (
                <span key={`${copy}-${name}`} className="flex items-center gap-6">
                  <span className="text-xl uppercase" style={{ ...display, color: BLACK }}>+++</span>
                  <span className="text-xl uppercase" style={{ ...display, color: BLUE }}>{name}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bremser */}
      <section id="bremser" className="bg-white px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-2 w-44" style={{ backgroundColor: CYAN }} />
          <h2 className="mt-5" style={{ ...display, color: BLACK, fontSize: 'clamp(2.2rem, 6vw, 4.2rem)', lineHeight: 1 }}>
            Die Bremser-Bilanz.
          </h2>
          <p className="mt-4 max-w-xl text-base font-semibold text-black/70">
            Parteien, die laut Drucksachen an Blockaden, Verzögerungen und Ablehnungen
            beteiligt waren — gemessen an den betroffenen Wohneinheiten.
          </p>

          <div className="mt-12">
            {ranking.map((r, i) => (
              <div key={r.party} className="border-t-4 py-6" style={{ borderColor: BLACK }}>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <span className="w-10 shrink-0 text-black/30" style={{ ...display, fontSize: '1.6rem' }}>{i + 1}</span>
                  <span className="w-40 shrink-0 sm:w-48" style={{ ...display, color: BLACK, fontSize: 'clamp(1.6rem, 4vw, 2.6rem)' }}>
                    {r.party}
                  </span>
                  <div className="h-9 min-w-[2rem] flex-1">
                    <div
                      className="flex h-9 items-center"
                      style={{
                        width: `${Math.max(4, (r.units / maxRank) * 100)}%`,
                        backgroundColor: PARTY_COLORS[r.party] || '#999',
                      }}
                    />
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 tabular-nums" style={{ ...display, backgroundColor: BLUE, color: YELLOW, fontSize: '1.4rem' }}>
                      {fmt(r.units)} WE
                    </span>
                    <div className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-black/40">
                      in {r.projects} {r.projects === 1 ? 'Projekt' : 'Projekten'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t-4" style={{ borderColor: BLACK }} />
          </div>
          <p className="mt-4 text-xs font-semibold text-black/40">
            Mehrfachnennungen möglich — an einem Projekt sind oft mehrere Parteien beteiligt.
          </p>
        </div>
      </section>

      {/* Karte */}
      <section id="karte" className="px-5 py-20 sm:px-8" style={{ backgroundColor: BLUE }}>
        <div className="mx-auto max-w-6xl">
          <div className="h-2 w-44" style={{ backgroundColor: YELLOW }} />
          <h2 className="mt-5 text-white" style={{ ...display, fontSize: 'clamp(2.2rem, 6vw, 4.2rem)', lineHeight: 1 }}>
            Überall in der Stadt.
          </h2>
          <p className="mt-4 max-w-xl text-base font-semibold text-white/70">
            Alle {fmt(projects.length)} Vorhaben — jeder Punkt ein Projekt, Klick öffnet die Details.
          </p>
          <div className="mx-auto mt-10 max-w-4xl">
            <BerlinSvgMap
              punkte={projects.map((p) => {
                const chip = STATUS_CHIP[p.status] || STATUS_CHIP.abgelehnt
                const we = countableUnits(p)
                return {
                  id: p.id,
                  lat: p.lat,
                  lng: p.lng,
                  title: p.title,
                  sub: `${chip.label}${we ? ` · ${fmt(we)}${p.unitCount ? '' : ' (geschätzt)'} WE` : ''}`,
                  href: `/projekt/${projectSlug(p)}`,
                }
              })}
            />
          </div>
        </div>
      </section>

      {/* Projektwall */}
      <section id="projekte" className="px-5 py-20 sm:px-8" style={{ backgroundColor: DEEP }}>
        <div className="mx-auto max-w-6xl">
          <div className="h-2 w-44" style={{ backgroundColor: YELLOW }} />
          <h2 className="mt-5 text-white" style={{ ...display, fontSize: 'clamp(2.2rem, 6vw, 4.2rem)', lineHeight: 1 }}>
            {fmt(projects.length)} Projekte.<br />
            <span style={{ color: YELLOW }}>Null Baukräne.</span>
          </h2>

          {/* Kategorie-Filter */}
          <p className="mt-8 text-[11px] font-extrabold uppercase tracking-[0.3em] text-white/40">
            Nach Blockade-Ursache filtern
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {CATEGORY_ORDER.map((c) => {
              const meta = CATEGORY_META[c]
              const st = catStats.get(c)!
              const on = activeCats.has(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCat(c)}
                  aria-pressed={on}
                  className="flex items-center gap-2 rounded-full border-2 px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.08em] transition-all"
                  style={{
                    backgroundColor: on ? meta.color : 'transparent',
                    borderColor: on ? meta.color : 'rgba(255,255,255,0.18)',
                    color: on ? '#fff' : 'rgba(255,255,255,0.55)',
                  }}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: on ? '#fff' : meta.color }} />
                  {meta.kurz}
                  <span className="tabular-nums opacity-70">{st.n}</span>
                </button>
              )
            })}
          </div>
          <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-sm font-bold text-white">
              Zeigt <span className="tabular-nums" style={{ color: YELLOW }}>{fmt(filteredWall.length)}</span> von{' '}
              {fmt(projects.length)} Projekten
            </span>
            <span className="text-sm font-semibold text-white/60">
              · <span className="tabular-nums" style={{ color: CYAN }}>{fmt(filteredUnits)}</span> Wohnungen betroffen
            </span>
            {!allActive && (
              <button
                type="button"
                onClick={() => setActiveCats(new Set(CATEGORY_ORDER))}
                className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-white/50 underline underline-offset-2 hover:text-white"
              >
                Alle anzeigen
              </button>
            )}
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWall.map((p) => {
              const chip = STATUS_CHIP[p.status] || STATUS_CHIP.abgelehnt
              const cat = CATEGORY_META[projectCategory(p)]
              return (
                <Link
                  key={p.id}
                  to="/projekt/$slug"
                  params={{ slug: projectSlug(p) }}
                  className="group flex flex-col border-2 border-white/10 bg-[#07234F] p-6 no-underline transition-transform duration-150 hover:-rotate-1 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 text-[11px] font-black tracking-[0.15em]" style={{ backgroundColor: chip.bg, color: chip.fg }}>
                      {chip.label}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.15em] text-white/40">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} title={cat.label} />
                      {p.bezirk}
                    </span>
                  </div>
                  <h3 className="mt-4 leading-tight" style={{ ...display, color: YELLOW, fontSize: '1.1rem' }}>
                    {p.title}
                  </h3>
                  <div className="mt-auto flex items-end justify-between pt-6">
                    {p.unitCount ? (
                      <div>
                        <div className="tabular-nums text-white" style={{ ...display, fontSize: '2rem', lineHeight: 1 }}>
                          {fmt(p.unitCount)}
                        </div>
                        <div className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/40">Wohnungen</div>
                      </div>
                    ) : p.unitCountEstimate ? (
                      <div>
                        <div className="tabular-nums text-white/90" style={{ ...display, fontSize: '2rem', lineHeight: 1 }}>
                          ~{fmt(p.unitCountEstimate)}
                        </div>
                        <div className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.25em]" style={{ color: CYAN }}>
                          Wohnungen · geschätzt
                        </div>
                      </div>
                    ) : parseEstimateMeta(p)?.basis === 'keine_wohnnutzung' ? (
                      <div className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/30">Keine Wohnnutzung</div>
                    ) : (
                      <div className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/30">WE unbekannt</div>
                    )}
                    <span
                      className="text-2xl font-black transition-transform group-hover:translate-x-1"
                      style={{ color: CYAN }}
                      aria-hidden
                    >
                      →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>

          {filteredWall.length === 0 && (
            <p className="mt-10 text-center text-sm font-semibold text-white/50">
              Keine Projekte in dieser Auswahl — mindestens eine Kategorie aktivieren.
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer
        id="mitmachen"
        className="px-5 py-24 text-center sm:px-8"
        style={{ background: `linear-gradient(180deg, ${DEEP} 0%, ${BLUE} 60%, #07336B 100%)` }}
      >
        <div className="mx-auto h-2 w-44" style={{ backgroundColor: CYAN }} />
        <h2 className="mx-auto mt-6 max-w-3xl" style={{ ...display, color: YELLOW, fontSize: 'clamp(2rem, 6vw, 4rem)', lineHeight: 1.02 }}>
          Wo Transparenz ist, ist alles möglich.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-sm font-semibold leading-relaxed text-white/60">
          Dieses Projekt dokumentiert, welche Akteure den Berliner Wohnungsbau auf
          Bezirksebene bremsen — Drucksache für Drucksache. Alle Zahlen sind echt.
          Die Bildsprache ist eine Hommage an deutsche Wahlkampagnen; die Slogans sind geliehen.
        </p>

        {/* Transparenz & Methodik */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 text-left sm:grid-cols-3">
          <div className="border-t-2 pt-4" style={{ borderColor: CYAN }}>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70">Belegte Zahlen</h3>
            <p className="mt-2 text-xs font-semibold leading-relaxed text-white/50">
              Wohneinheiten stammen aus BVV-Drucksachen und dem Pressespiegel — jede Zahl
              ist auf der Projektseite mit Quelle verlinkt.
            </p>
          </div>
          <div className="border-t-2 pt-4" style={{ borderColor: CYAN }}>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70">Schätzungen</h3>
            <p className="mt-2 text-xs font-semibold leading-relaxed text-white/50">
              Rund {fmt(estimatedUnits(projects))} der gezählten Wohnungen sind recherchierte,
              unabhängig gegengeprüfte Schätzungen (auf Projektseiten als „~" markiert).
              Abgeleitete Werte rechnen mit 75&nbsp;m² Wohnfläche je Wohnung; doppelt erfasste
              Vorhaben zählen nur einmal.
            </p>
          </div>
          <div className="border-t-2 pt-4" style={{ borderColor: CYAN }}>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70">Amtliche Statistik</h3>
            <p className="mt-2 text-xs font-semibold leading-relaxed text-white/50">
              Genehmigungen und Fertigstellungen: Amt für Statistik Berlin-Brandenburg,
              Statistische Berichte F&nbsp;II&nbsp;1 und F&nbsp;II&nbsp;2 (Wohnungen
              insgesamt, Land Berlin).
            </p>
          </div>
        </div>

        <Link
          to="/designs"
          className="mt-12 inline-block rounded-full px-8 py-3 text-sm font-extrabold uppercase tracking-[0.15em] no-underline transition-transform hover:scale-105"
          style={{ backgroundColor: YELLOW, color: BLUE }}
        >
          Zu den Design-Entwürfen
        </Link>
      </footer>

      <style>{`
        @keyframes kampagne-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .kampagne-marquee { animation: kampagne-marquee 40s linear infinite; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  )
}
