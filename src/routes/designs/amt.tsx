import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { getProjects } from '../../server/projects'
import { getStats } from '../../server/stats'
import {
  blockerTypeCounts,
  fmt,
  latestYearTotals,
  parseBlockers,
  splitParties,
  statusBreakdown,
  totalUnits,
} from '../../lib/design-data'
import DesignSwitcher from '../../components/DesignSwitcher'

export const Route = createFileRoute('/designs/amt')({
  head: () => ({
    meta: [{ title: 'Amtliche Bekanntmachung — Entwurf 4' }],
  }),
  loader: async () => {
    const [projects, stats] = await Promise.all([
      getProjects(),
      getStats(),
    ])
    return { projects, stats }
  },
  component: AmtPage,
})

const STAMP: Record<string, { text: string; color: string }> = {
  blockiert: { text: 'BLOCKIERT', color: '#B91C1C' },
  'verzögert': { text: 'RUHT', color: '#B45309' },
  abgelehnt: { text: 'VERSAGT', color: '#52525B' },
}

const TYPE_AMTLICH: Record<string, string> = {
  partei: 'Politische Partei (Bezirksebene)',
  'bürgerinitiative': 'Bürgerinitiative bzw. Anwohnerschaft',
  'behörde': 'Behörde bzw. Fachamt',
  gericht: 'Gericht',
  umwelt: 'Belange des Natur- und Umweltschutzes',
  investor: 'Vorhabenträger bzw. Investor',
}

function Stamp({ status }: { status: string }) {
  const s = STAMP[status] || STAMP.abgelehnt
  return (
    <span
      className="inline-block -rotate-6 border-[2.5px] px-1.5 py-0.5 text-[10px] font-black tracking-[0.15em]"
      style={{ borderColor: s.color, color: s.color }}
    >
      {s.text}
    </span>
  )
}

function AmtPage() {
  const { projects, stats } = Route.useLoaderData()

  const byStatus = statusBreakdown(projects)
  const units = totalUnits(projects)
  const blockerTypes = useMemo(() => blockerTypeCounts(projects), [projects])
  const { year: statsYear, approved, completed } = latestYearTotals(stats)

  const sorted = useMemo(() => [...projects].sort((a, b) => a.bezirk.localeCompare(b.bezirk) || a.id - b.id), [projects])

  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#EDEDED] pb-28 text-black" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div className="mx-auto max-w-4xl bg-white px-6 py-10 shadow-md sm:px-14 sm:py-14">

        {/* Kopfbereich */}
        <header className="flex items-start justify-between gap-6 border-b-2 border-black pb-6">
          <div className="flex items-stretch gap-4">
            {/* Flaggenbalken */}
            <div className="flex w-3 flex-col self-stretch">
              <div className="flex-1 bg-black" />
              <div className="flex-1 bg-[#DD0000]" />
              <div className="flex-1 bg-[#FFCE00]" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Wohnungsbau-Tracker Berlin</p>
              <p className="text-sm leading-tight">— Geschäftsstelle für die Erfassung ruhender Bauvorhaben —</p>
              <p className="mt-2 text-xs text-[#444]">Amtsblatt-Ansicht (Entwurf 4)</p>
            </div>
          </div>
          <div className="text-right text-xs leading-relaxed text-[#444]">
            <p>Geschäftszeichen: <span className="font-bold text-black">WBT II A 2 – 6082/55</span></p>
            <p>Berlin, den {today}</p>
            <p>Bekanntmachung Nr. 55/2026</p>
          </div>
        </header>

        {/* Titel */}
        <h1 className="mt-10 text-center text-xl font-bold leading-snug sm:text-2xl">
          Bekanntmachung über ruhende, gehemmte und versagte<br className="hidden sm:block" />
          {' '}Wohnungsbauvorhaben im Land Berlin
        </h1>
        <p className="mt-2 text-center text-sm italic text-[#444]">
          — Zusammenfassende Darstellung nach Auswertung der BVV-Drucksachen sowie des Pressespiegels —
        </p>

        {/* §1 */}
        <section className="mt-10 text-[13.5px] leading-relaxed">
          <h2 className="text-center font-bold">§ 1<br />Gegenstand der Bekanntmachung</h2>
          <p className="mt-3">
            (1) Diese Bekanntmachung dient der Herstellung von Transparenz über
            Wohnungsbauvorhaben im Land Berlin, deren Verwirklichung derzeit nicht, nicht
            vollständig oder nicht in angemessener Zeit erfolgt.
          </p>
          <p className="mt-2">
            (2) Erfasst sind zum Stichtag insgesamt <b>{fmt(projects.length)} Vorhaben</b> mit
            zusammen <b>{fmt(units)} Wohneinheiten (WE)</b>. Die Vorhaben verteilen sich auf
            sämtliche zwölf Bezirke.
          </p>
          <p className="mt-2">
            (3) Die Bezeichnung der hemmenden Beteiligten erfolgt wertfrei und nach
            Aktenlage.¹ Eine Gewähr für die Vollzähligkeit der Hemmnisse wird nicht
            übernommen; erfahrungsgemäß finden sich weitere.
          </p>
        </section>

        {/* §2 Statistik */}
        <section className="mt-10 text-[13.5px]">
          <h2 className="text-center font-bold">§ 2<br />Zusammenfassende Statistik</h2>
          <table className="mt-4 w-full border-collapse border border-black text-[13px]">
            <thead>
              <tr className="bg-[#F0F0F0]">
                <th className="border border-black px-3 py-1.5 text-left font-bold">Merkmal</th>
                <th className="border border-black px-3 py-1.5 text-right font-bold">Vorhaben</th>
                <th className="border border-black px-3 py-1.5 text-right font-bold">Wohneinheiten</th>
              </tr>
            </thead>
            <tbody>
              {byStatus.map((s) => (
                <tr key={s.status}>
                  <td className="border border-black px-3 py-1.5 capitalize">{s.status}</td>
                  <td className="border border-black px-3 py-1.5 text-right tabular-nums">{fmt(s.count)}</td>
                  <td className="border border-black px-3 py-1.5 text-right tabular-nums">{fmt(s.units)}</td>
                </tr>
              ))}
              <tr className="bg-[#F0F0F0] font-bold">
                <td className="border border-black px-3 py-1.5">insgesamt</td>
                <td className="border border-black px-3 py-1.5 text-right tabular-nums">{fmt(projects.length)}</td>
                <td className="border border-black px-3 py-1.5 text-right tabular-nums">{fmt(units)}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3">
            Nachrichtlich: Im Berichtsjahr {statsYear} wurden im Land Berlin {fmt(approved)} WE
            genehmigt und {fmt(completed)} WE fertiggestellt. Die Differenz von{' '}
            {fmt(approved - completed)} WE wird im Fachjargon als „Bauüberhang" geführt, im
            Volksmund anders.
          </p>
        </section>

        {/* §3 Hemmende Beteiligte */}
        <section className="mt-10 text-[13.5px]">
          <h2 className="text-center font-bold">§ 3<br />Hemmende Beteiligte nach Art</h2>
          <table className="mt-4 w-full border-collapse border border-black text-[13px]">
            <thead>
              <tr className="bg-[#F0F0F0]">
                <th className="border border-black px-3 py-1.5 text-left font-bold">Art des Beteiligten</th>
                <th className="border border-black px-3 py-1.5 text-right font-bold">Nennungen</th>
              </tr>
            </thead>
            <tbody>
              {blockerTypes.map((b) => (
                <tr key={b.type}>
                  <td className="border border-black px-3 py-1.5">{TYPE_AMTLICH[b.type] || b.type}</td>
                  <td className="border border-black px-3 py-1.5 text-right tabular-nums">{fmt(b.count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* §4 Register */}
        <section className="mt-10 text-[13.5px]">
          <h2 className="text-center font-bold">§ 4<br />Register der Vorhaben</h2>
          <p className="mt-2 text-center text-xs italic text-[#444]">— geordnet nach Bezirken, sodann nach laufender Nummer —</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse border border-black text-[12.5px]">
              <thead>
                <tr className="bg-[#F0F0F0]">
                  <th className="border border-black px-2 py-1.5 text-left font-bold">Lfd. Nr.</th>
                  <th className="border border-black px-2 py-1.5 text-left font-bold">Vorhaben</th>
                  <th className="border border-black px-2 py-1.5 text-left font-bold">Bezirk</th>
                  <th className="border border-black px-2 py-1.5 text-right font-bold">WE</th>
                  <th className="border border-black px-2 py-1.5 text-center font-bold">Status</th>
                  <th className="border border-black px-2 py-1.5 text-left font-bold">Hemmnisse lt. Akte</th>
                  <th className="border border-black px-2 py-1.5 text-left font-bold">Quelle</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p, i) => {
                  const blockers = parseBlockers(p)
                  return (
                    <tr key={p.id} className={i % 2 === 1 ? 'bg-[#FAFAFA]' : ''}>
                      <td className="border border-black px-2 py-1.5 align-top tabular-nums">{String(i + 1).padStart(2, '0')}</td>
                      <td className="border border-black px-2 py-1.5 align-top">
                        <span className="font-bold">{p.title}</span>
                        {p.date && <span className="text-[#666]"> (Vorgang vom {p.date})</span>}
                        <br />
                        <span className="text-[#444]">Beteiligte Parteien: {splitParties(p).join(', ') || '—'}</span>
                      </td>
                      <td className="border border-black px-2 py-1.5 align-top">{p.bezirk}</td>
                      <td className="border border-black px-2 py-1.5 text-right align-top tabular-nums">
                        {p.unitCount ? fmt(p.unitCount) : '—²'}
                      </td>
                      <td className="border border-black px-2 py-1.5 text-center align-top">
                        <Stamp status={p.status} />
                      </td>
                      <td className="border border-black px-2 py-1.5 align-top text-[#333]">
                        {blockers.length > 0 ? blockers.map((b) => b.name).join('; ') : 'nicht aktenkundig'}
                      </td>
                      <td className="border border-black px-2 py-1.5 align-top">
                        {p.sourceUrl ? (
                          <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#00468C] underline">
                            Drucksache
                          </a>
                        ) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Schlussformel */}
        <section className="mt-12 text-[13.5px] leading-relaxed">
          <p>
            Diese Bekanntmachung ergeht von Amts wegen. Sie wird fortgeschrieben, sobald
            weitere Vorhaben zum Erliegen kommen, womit zu rechnen ist.
          </p>
          <div className="mt-8">
            <p>Im Auftrag</p>
            <p className="mt-5 font-bold italic" style={{ fontFamily: 'Georgia, serif' }}>gez. Der Tracker</p>
            <p className="text-xs text-[#666]">(Dieses Dokument wurde maschinell erstellt und ist ohne Unterschrift gültig.)</p>
          </div>

          <div className="mt-10 border-2 border-black p-4">
            <p className="font-bold">Rechtsbehelfsbelehrung:</p>
            <p className="mt-1">
              Gegen den Stillstand ist der Verwaltungsrechtsweg nicht eröffnet. Es verbleibt
              der Hinweis auf die Wahlen zu den Bezirksverordnetenversammlungen.
            </p>
          </div>

          <div className="mt-8 border-t border-black pt-3 text-xs text-[#666]">
            <p>¹ Quellen: Drucksachen der Bezirksverordnetenversammlungen; Pressespiegel; Amt für Statistik Berlin-Brandenburg.</p>
            <p>² Eine Angabe der Wohneinheiten war der Aktenlage nicht zu entnehmen. Das Fehlen der Zahl ist Teil des Befundes.</p>
          </div>
        </section>
      </div>

      <DesignSwitcher />
    </div>
  )
}
