import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { getProjects } from '../../server/projects'
import { getBvvParties } from '../../server/bvv'
import { getStats } from '../../server/stats'
import { PARTY_COLORS } from '../../lib/parties'
import {
  belege,
  countableUnits,
  fmt,
  idFromSlug,
  parseEstimateMeta,
  parseResponsibilityMeta,
  projectSlug,
  splitParties,
  visibleBlockers,
  weitereQuellen,
  zerlegeMitFussnoten,
} from '../../lib/design-data'
import BerlinSvgMap from '../../components/BerlinSvgMap'
import WbtLogo from '../../components/WbtLogo'
import { GREEN, STATUS_CHIP } from '../../lib/campaign'

const BLUE = '#0B2B6B'
const DEEP = '#02173A'
const YELLOW = '#FFED00'
const CYAN = '#1CB5E5'
const BLACK = '#111111'

const display = { fontFamily: "'Archivo Black', 'Arial Black', sans-serif" }

// STATUS_CHIP kommt aus lib/campaign — hier lag lange eine identische Kopie.

const BLOCKER_TYPE_LABEL: Record<string, string> = {
  partei: 'Partei',
  'bürgerinitiative': 'Bürgerinitiative',
  'behörde': 'Behörde',
  gericht: 'Gericht',
  umwelt: 'Umwelt',
  investor: 'Investor',
}

export const Route = createFileRoute('/projekt/$slug')({
  loader: async ({ params }) => {
    const id = idFromSlug(params.slug)
    const [projects, bvvParties, stats] = await Promise.all([
      getProjects(),
      getBvvParties(),
      getStats(),
    ])
    const project = projects.find((p) => p.id === id)
    if (!project) throw notFound()
    return {
      project,
      bvv: bvvParties.find((b) => b.bezirk === project.bezirk) ?? null,
      bezirkStats: stats.filter((s) => s.bezirk === project.bezirk),
    }
  },
  head: ({ loaderData }) => {
    const p = loaderData?.project
    const title = p ? `${p.title} — Wohnungsbau-Tracker Berlin` : 'Projekt — Wohnungsbau-Tracker Berlin'
    const desc = p
      ? `${(STATUS_CHIP[p.status]?.label || p.status).toLowerCase()} in ${p.bezirk}${p.unitCount ? `, ${fmt(p.unitCount)} geplante Wohnungen` : ''}: ${(p.description || p.title).slice(0, 150)}`
      : 'Projektdetails im Wohnungsbau-Tracker Berlin.'
    return {
      meta: [
        { title },
        { name: 'description', content: desc },
        { property: 'og:title', content: title },
        { property: 'og:description', content: desc },
        { property: 'og:type', content: 'article' },
      ],
      links: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700;800&display=swap',
        },
      ],
    }
  },
  notFoundComponent: ProjectNotFound,
  component: ProjectDetailPage,
})

function ProjectNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: DEEP, fontFamily: "'Archivo', sans-serif" }}>
      <div className="h-2 w-44" style={{ backgroundColor: CYAN }} />
      <h1 className="mt-6" style={{ ...display, color: YELLOW, fontSize: 'clamp(2rem, 6vw, 4rem)' }}>
        Projekt nicht gefunden.
      </h1>
      <p className="mt-4 max-w-md text-sm font-semibold text-white/60">
        Entweder gibt es dieses Vorhaben nicht — oder es wurde (Überraschung) doch noch gebaut.
      </p>
      <Link
        to="/"
        hash="projekte"
        className="mt-8 rounded-full px-6 py-3 text-sm font-extrabold uppercase tracking-[0.15em] no-underline"
        style={{ backgroundColor: YELLOW, color: BLUE }}
      >
        Alle Projekte
      </Link>
    </div>
  )
}

function ProjectDetailPage() {
  const { project: p, bvv, bezirkStats } = Route.useLoaderData()

  const chip = STATUS_CHIP[p.status] || STATUS_CHIP.abgelehnt
  const parties = splitParties(p)
  const blockers = visibleBlockers(p)
  const we = countableUnits(p)

  // Belegapparat: die nummerierten Belege, auf die der Text verweist, plus die
  // Quellen, die keinen eigenen Beleg darstellen. Beides steht jetzt in einer
  // Liste — vorher lagen Quellen und Belege in zwei Abschnitten nebeneinander
  // und zeigten teilweise auf dieselben Links.
  const meta = parseResponsibilityMeta(p)
  const funde = belege(p)
  const quellen = weitereQuellen(p)

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Archivo', 'Helvetica Neue', sans-serif" }}>

      {/* Nav */}
      <nav className="sticky top-0 z-[2000] border-b border-black/5 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center no-underline" title="Zur Startseite">
            <WbtLogo height={32} />
          </Link>
          <Link
            to="/"
            hash="projekte"
            className="rounded-full px-5 py-2 text-[13px] font-extrabold uppercase tracking-[0.1em] text-white no-underline transition-transform hover:scale-105"
            style={{ backgroundColor: CYAN }}
          >
            Alle Projekte
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-5 py-16 sm:px-8" style={{ backgroundColor: DEEP }}>
        <div className="mx-auto max-w-5xl">
          <div className="h-2 w-44" style={{ backgroundColor: CYAN }} />
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="px-3 py-1.5 text-xs font-black tracking-[0.15em]" style={{ backgroundColor: chip.bg, color: chip.fg }}>
              {chip.label}
            </span>
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/50">
              {p.bezirk}{p.date ? ` · Vorgang vom ${p.date}` : ''}
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl" style={{ ...display, color: YELLOW, fontSize: 'clamp(1.8rem, 5vw, 3.4rem)', lineHeight: 1.05 }}>
            {p.title}
          </h1>
          {p.unitCount ? (
            <div className="mt-8">
              <div className="tabular-nums text-white" style={{ ...display, fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 1 }}>
                {fmt(p.unitCount)}
              </div>
              <div className="mt-2 text-xs font-extrabold uppercase tracking-[0.3em] text-white/50">
                geplante Wohnungen, die nicht entstehen
              </div>
            </div>
          ) : p.unitCountEstimate ? (
            <div className="mt-8">
              <div className="flex flex-wrap items-baseline gap-4">
                <div className="tabular-nums text-white/90" style={{ ...display, fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 1 }}>
                  ~{fmt(p.unitCountEstimate)}
                </div>
                <span className="px-2.5 py-1 text-[11px] font-black tracking-[0.15em]" style={{ backgroundColor: CYAN, color: '#fff' }}>
                  RECHERCHIERTE SCHÄTZUNG
                </span>
              </div>
              <div className="mt-2 text-xs font-extrabold uppercase tracking-[0.3em] text-white/50">
                geplante Wohnungen laut Quellenlage — keine amtlich bestätigte Zahl
              </div>
            </div>
          ) : parseEstimateMeta(p)?.basis === 'keine_wohnnutzung' ? (
            <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.3em] text-white/40">
              nach Quellenlage keine nennenswerte Wohnnutzung geplant
            </p>
          ) : parseEstimateMeta(p)?.basis === 'nicht_bezifferbar' ? (
            <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.3em] text-white/40">
              pauschaler Vorgang — Wohneinheiten nicht seriös bezifferbar
            </p>
          ) : (
            <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.3em] text-white/40">
              Zahl der Wohneinheiten nicht aktenkundig
            </p>
          )}
        </div>
      </header>

      {/* Inhalt */}
      <main className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Linke Spalte */}
          <div className="space-y-12 lg:col-span-2">
            {p.status === 'erledigt' && p.resolution && (
              <section className="border-l-4 p-5" style={{ borderColor: GREEN, backgroundColor: '#F1F8F1' }}>
                <h2 style={{ ...display, color: GREEN, fontSize: '1.2rem' }}>Und dann ging es doch.</h2>
                <p className="mt-2 text-base font-medium leading-relaxed text-black/80">{p.resolution}</p>
              </section>
            )}

            {p.description && (
              <section>
                <h2 style={{ ...display, color: BLACK, fontSize: '1.5rem' }}>Worum es geht.</h2>
                {/* Die Projekttexte sind mehrabsätzig — Leerzeilen bleiben Absätze,
                    sonst liefe die ganze Chronologie als eine Textwand durch.
                    Die [n]-Marken werden zu hochgestellten Verweisen auf den
                    Belegapparat weiter unten. */}
                {p.description.split(/\n\s*\n/).map((absatz, i) => (
                  <p key={i} className="mt-4 text-base font-medium leading-relaxed text-black/80">
                    {zerlegeMitFussnoten(absatz.trim(), funde.length).map((teil, j) =>
                      'note' in teil ? (
                        <a
                          key={j}
                          href={`#beleg-${teil.note}`}
                          className="px-0.5 align-super text-[11px] font-black no-underline"
                          style={{ color: BLUE }}
                          title={
                            funde[teil.note - 1]
                              ? `${funde[teil.note - 1].akteur} — ${funde[teil.note - 1].aussage}`
                              : undefined
                          }
                        >
                          {teil.note}
                        </a>
                      ) : (
                        <span key={j}>{teil.text}</span>
                      ),
                    )}
                  </p>
                ))}
              </section>
            )}

            {blockers.length > 0 && (
              <section>
                <h2 style={{ ...display, color: BLACK, fontSize: '1.5rem' }}>Wer im Weg steht.</h2>
                <ul className="mt-5 space-y-3">
                  {blockers.map((b, i) => (
                    <li key={i} className="flex items-center gap-3 border-l-4 py-1 pl-4" style={{ borderColor: b.type === 'partei' ? PARTY_COLORS[b.name] || BLUE : CYAN }}>
                      <span className="text-base font-bold text-black">{b.name}</span>
                      <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] text-white" style={{ backgroundColor: BLUE }}>
                        {BLOCKER_TYPE_LABEL[b.type] || b.type}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h2 style={{ ...display, color: BLACK, fontSize: '1.5rem' }}>Belege.</h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-black/60">
                Die Ziffern im Text verweisen hierher. Jeder Beleg nennt Akteur, Datum und
                Art des Vorgangs — und wie belastbar er ist: ein Beschluss oder Verwaltungsakt
                wiegt schwerer als eine Pressemitteilung, diese schwerer als eine Anfrage.
              </p>

              {funde.length > 0 && (
                <ol className="mt-5 space-y-4">
                  {funde.map((f, i) => (
                    <li
                      key={i}
                      id={`beleg-${i + 1}`}
                      className="scroll-mt-24 border-t pt-3 text-sm"
                      style={{
                        borderColor: '#D8DCE8',
                        opacity: f.richtung === 'unterstuetzt' ? 0.75 : 1,
                      }}
                    >
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-black tabular-nums" style={{ color: BLUE }}>{i + 1}</span>
                        <span className="font-black text-black">{f.akteur}</span>
                        {f.datum && <span className="text-black/40">{f.datum}</span>}
                        {f.belegstaerke && (
                          <span
                            className="px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em]"
                            style={
                              f.belegstaerke === 'stark'
                                ? { backgroundColor: BLUE, color: '#fff' }
                                : f.belegstaerke === 'mittel'
                                  ? { backgroundColor: CYAN, color: '#fff' }
                                  : { backgroundColor: '#E4E6EE', color: '#5A6076' }
                            }
                            title={
                              f.belegstaerke === 'stark'
                                ? 'Beschluss oder Verwaltungsakt'
                                : f.belegstaerke === 'mittel'
                                  ? 'Pressemitteilung oder Zitat'
                                  : 'Anfrage oder Einzelmeinung'
                            }
                          >
                            {f.belegstaerke}
                          </span>
                        )}
                        {f.richtung === 'unterstuetzt' && (
                          <span
                            className="px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em]"
                            style={{ backgroundColor: GREEN, color: '#fff' }}
                            title="Dieser Akteur fordert, dass gebaut wird — kein Beleg für eine Blockade"
                          >
                            fordert Bau
                          </span>
                        )}
                        {f.art && (
                          <span className="text-[11px] uppercase tracking-[0.1em] text-black/35">{f.art}</span>
                        )}
                      </div>
                      <p className="mt-1 leading-relaxed text-black/70">{f.aussage}</p>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block font-bold text-black underline decoration-[#1CB5E5] hover:opacity-70"
                      >
                        {f.titel || 'Quelle'} ↗
                      </a>
                    </li>
                  ))}
                </ol>
              )}

              {quellen.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: BLUE }}>
                    Weitere Quellen
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {quellen.map((q, i) => (
                      <li key={i} className="text-sm">
                        <a
                          href={q.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-black underline decoration-[#1CB5E5] hover:opacity-70"
                        >
                          {q.title} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {funde.length === 0 && quellen.length === 0 && (
                <p className="mt-5 text-sm font-semibold text-black/40">
                  Für dieses Vorhaben sind noch keine Belege hinterlegt.
                </p>
              )}

              {funde.length > 0 && (
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.15em] text-black/40">
                  {funde.filter((f) => f.belegstaerke === 'stark').length} von {funde.length} Belegen sind
                  Beschlüsse oder Verwaltungsakte
                  {(() => {
                    const pro = funde.filter((f) => f.richtung === 'unterstuetzt').length
                    return pro ? ` · ${pro} Gegenposition${pro === 1 ? '' : 'en'} für den Bau` : ''
                  })()}
                  {meta?.stand ? ` · Stand ${meta.stand}` : ''}
                </p>
              )}

              {(() => {
                const meta = parseEstimateMeta(p)
                if (!meta || p.unitCount) return null
                return (
                  <div className="mt-8 border-l-4 p-5" style={{ borderColor: CYAN, backgroundColor: '#F2FAFD' }}>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: BLUE }}>
                      {meta.basis === 'keine_wohnnutzung'
                        ? 'Warum hier keine Wohnungen gezählt werden'
                        : meta.basis === 'nicht_bezifferbar'
                          ? 'Warum hier keine Zahl steht'
                          : 'Grundlage der Schätzung'}
                    </h3>
                    {meta.begruendung && (
                      <p className="mt-2 text-sm font-medium leading-relaxed text-black/70">{meta.begruendung}</p>
                    )}
                    {meta.spanne && meta.spanne[0] !== meta.spanne[1] && (
                      <p className="mt-2 text-sm font-bold text-black/70">
                        Belegte Spanne: {fmt(meta.spanne[0])} bis {fmt(meta.spanne[1])} Wohnungen
                      </p>
                    )}
                    <ul className="mt-3 space-y-2">
                      {meta.quellen.map((q, i) => (
                        <li key={i} className="text-sm">
                          <a href={q.url} target="_blank" rel="noopener noreferrer" className="font-bold text-black underline decoration-[#1CB5E5] hover:opacity-70">
                            Quelle {i + 1} ↗
                          </a>
                          {q.zitat && <span className="ml-2 italic text-black/50">„{q.zitat}"</span>}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.15em] text-black/40">
                      Verlässlichkeit: {meta.confidence}
                      {meta.verifiziert ? ' · unabhängig gegengeprüft' : ''}
                      {meta.stand ? ` · Stand ${meta.stand}` : ''}
                    </p>
                  </div>
                )
              })()}

            </section>
          </div>

          {/* Rechte Spalte */}
          <aside className="space-y-5">
            <div className="p-6" style={{ backgroundColor: BLUE }}>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.25em] text-white/50">Beteiligte Parteien</h3>
              <ul className="mt-4 space-y-2.5">
                {parties.map((party) => (
                  <li key={party} className="flex items-center gap-2.5 text-sm font-bold text-white">
                    <span className="h-3 w-3 rounded-full ring-2 ring-white/20" style={{ backgroundColor: PARTY_COLORS[party] || '#999' }} />
                    {party}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6" style={{ backgroundColor: DEEP }}>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.25em] text-white/50">Bezirks-Kontext</h3>
              <dl className="mt-4 space-y-4">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40">Bezirk</dt>
                  <dd className="mt-0.5 text-sm font-bold text-white">{p.bezirk}</dd>
                </div>
                {bvv && (
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40">BVV-Mehrheit</dt>
                    <dd className="mt-0.5 flex items-center gap-2 text-sm font-bold text-white">
                      <span className="h-3 w-3 rounded-full ring-2 ring-white/20" style={{ backgroundColor: PARTY_COLORS[bvv.rulingParty] || '#999' }} />
                      {bvv.rulingParty}
                      {bvv.coalitionParties && <span className="font-semibold text-white/50">+ {bvv.coalitionParties}</span>}
                    </dd>
                  </div>
                )}
                {bezirkStats.map((s) => (
                  <div key={s.id}>
                    <dt className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40">Im Bezirk {s.year}</dt>
                    <dd className="mt-0.5 text-sm font-bold text-white">
                      <span className="tabular-nums" style={display}>{fmt(s.approvedCount)}</span> genehmigt ·{' '}
                      <span className="tabular-nums" style={display}>{fmt(s.completedCount)}</span> fertig
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>

        {/* Karte */}
        <section className="mt-14">
          <h2 style={{ ...display, color: BLACK, fontSize: '1.5rem' }}>Wo es (nicht) entsteht.</h2>
          <div className="mt-5 p-4 sm:p-6" style={{ backgroundColor: BLUE }}>
            <BerlinSvgMap
              punkte={[
                {
                  id: p.id,
                  lat: p.lat,
                  lng: p.lng,
                  title: p.title,
                  sub: `${chip.label}${we ? ` · ${fmt(we)}${p.unitCount ? '' : ' (geschätzt)'} WE` : ''}`,
                },
              ]}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-5 py-14 text-center sm:px-8" style={{ backgroundColor: DEEP }}>
        <p className="text-sm font-semibold text-white/50">
          Ein Vorgang von vielen. Der ganze Überblick:
        </p>
        <Link
          to="/"
          hash="projekte"
          className="mt-5 inline-block rounded-full px-8 py-3 text-sm font-extrabold uppercase tracking-[0.15em] no-underline transition-transform hover:scale-105"
          style={{ backgroundColor: YELLOW, color: BLUE }}
        >
          Zurück zur Projektwand
        </Link>
        <p className="mt-8 text-xs font-semibold text-white/30">
          Permalink: /projekt/{projectSlug(p)}
        </p>
      </footer>
    </div>
  )
}
