import { Link, createFileRoute } from '@tanstack/react-router'
import DesignSwitcher from '../../components/DesignSwitcher'

export const Route = createFileRoute('/designs/')({
  head: () => ({
    meta: [{ title: 'Fünf Entwürfe — Wohnungsbau-Tracker Berlin' }],
  }),
  component: DesignsIndex,
})

const DESIGNS = [
  {
    to: '/designs/zeitung',
    nr: '01',
    name: 'Der Baustopp-Bote',
    tagline: 'Zeitung / Datenjournalismus',
    description:
      'Der Tracker als Broadsheet-Sonderausgabe: Fraktur-Titelkopf, Serifensatz, Initialen, ' +
      'Schwarz-Weiß-Balken und eine Graustufen-Karte. Die Projekte erscheinen als Meldungen ' +
      'aus den Bezirken — Stillstand als Chronik.',
    swatches: ['#FAF7F0', '#1a1a1a', '#8B0000'],
    preview: (
      <div className="flex h-full flex-col items-center justify-center bg-[#FAF7F0] px-4">
        <div className="text-3xl text-[#1a1a1a]" style={{ fontFamily: 'Georgia, serif', fontWeight: 900 }}>
          Der Baustopp-Bote
        </div>
        <div className="mt-1 h-px w-3/4 bg-[#1a1a1a]" />
        <div className="mt-1 text-[9px] uppercase tracking-[0.3em] text-[#777]">Chronik des Stillstands</div>
      </div>
    ),
  },
  {
    to: '/designs/dashboard',
    nr: '02',
    name: 'Lagezentrum',
    tagline: 'Dark-Mode-Datencockpit',
    description:
      'Ein Operations-Dashboard für den Wohnungsbau: KPI-Kacheln, Status-Donut, ' +
      'Partei-Ranking mit Leuchtbalken, Hemmnis-Statistik, dunkle Karte und eine dichte ' +
      'Vorgangstabelle mit Filtern. Monospace-Zahlen, Bezirks-Telemetrie.',
    swatches: ['#070B14', '#22D3EE', '#EF4444'],
    preview: (
      <div className="flex h-full flex-col justify-center gap-1.5 bg-[#070B14] px-6">
        <div className="text-[9px] uppercase tracking-[0.3em] text-[#64748B]">WE betroffen</div>
        <div className="text-2xl font-semibold text-[#22D3EE]" style={{ fontFamily: 'ui-monospace, monospace' }}>50.743</div>
        <div className="h-1.5 w-2/3 rounded-full bg-[#EF4444]" />
        <div className="h-1.5 w-1/2 rounded-full bg-[#F59E0B]" />
        <div className="h-1.5 w-1/4 rounded-full bg-[#64748B]" />
      </div>
    ),
  },
  {
    to: '/designs/kiez',
    nr: '03',
    name: 'Kiez-Check',
    tagline: 'Freundlich & bürgernah',
    description:
      'Warme Farben, runde Karten, klare Sprache: „Was passiert eigentlich in deinem Kiez?" ' +
      'Bezirks-Pills zum Antippen, Status-Filter mit Icons und Projektkarten, die auch ohne ' +
      'Verwaltungsdeutsch verständlich sind.',
    swatches: ['#FAF6EF', '#2F8F83', '#E2654A'],
    preview: (
      <div className="flex h-full flex-col items-start justify-center gap-2 bg-[#FAF6EF] px-6">
        <div className="rounded-2xl bg-[#2F8F83] px-4 py-2 text-sm font-extrabold text-white">Dein Kiez 👀</div>
        <div className="flex gap-1.5">
          <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-[#666057] shadow-sm">Pankow 9</span>
          <span className="rounded-full bg-[#33302B] px-2.5 py-1 text-[9px] font-bold text-white">Mitte 6</span>
          <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-[#666057] shadow-sm">Spandau 4</span>
        </div>
      </div>
    ),
  },
  {
    to: '/designs/amt',
    nr: '04',
    name: 'Amtliche Bekanntmachung',
    tagline: 'Bürokratie-Satire',
    description:
      'Der Stillstand in seiner natürlichen Form: ein Amtsblatt. Geschäftszeichen, ' +
      'Paragraphen, Registertabellen, Stempel („BLOCKIERT", „RUHT", „VERSAGT") und eine ' +
      'Rechtsbehelfsbelehrung, die auf die nächste BVV-Wahl verweist.',
    swatches: ['#FFFFFF', '#DD0000', '#FFCE00'],
    preview: (
      <div className="flex h-full items-center justify-center gap-4 bg-white px-6">
        <div className="flex h-16 w-2.5 flex-col">
          <div className="flex-1 bg-black" />
          <div className="flex-1 bg-[#DD0000]" />
          <div className="flex-1 bg-[#FFCE00]" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-black">Bekanntmachung Nr. 55/2026</div>
          <div className="text-[9px] text-[#666]">WBT II A 2 – 6082/55</div>
          <span className="mt-1.5 inline-block -rotate-6 border-2 border-[#B91C1C] px-1.5 py-0.5 text-[9px] font-black tracking-widest text-[#B91C1C]">
            BLOCKIERT
          </span>
        </div>
      </div>
    ),
  },
  {
    to: '/designs/klassik',
    nr: '05',
    name: 'Klassik',
    tagline: 'Das bisherige Hauptdesign',
    description:
      'Der Tracker, wie er ursprünglich aussah: weißer Grund, Berlin-Rot, Karte oben, ' +
      'Zahlenleiste und eine dichte Projektliste mit Filtern. Bleibt hier als ' +
      'Referenz erhalten, nachdem die Kampagne zum Hauptdesign wurde.',
    swatches: ['#FFFFFF', '#BE2837', '#111111'],
    preview: (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-white px-4">
        <div className="text-xl font-black tracking-tight text-[#111]">
          Wohnungsbau-Tracker <span className="text-[#BE2837]">Berlin</span>
        </div>
        <div className="flex gap-5 text-center">
          <div>
            <div className="text-lg font-black text-[#BE2837]">55</div>
            <div className="text-[8px] uppercase tracking-widest text-[#999]">Projekte</div>
          </div>
          <div>
            <div className="text-lg font-black text-[#BE2837]">50.743</div>
            <div className="text-[8px] uppercase tracking-widest text-[#999]">Wohnungen</div>
          </div>
        </div>
      </div>
    ),
  },
]

function DesignsIndex() {
  return (
    <div className="min-h-screen bg-[#111] pb-28 text-white">
      <div className="mx-auto max-w-4xl px-5 pt-16 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Redesign-Studie</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Fünf Entwürfe für den<br />Wohnungsbau-Tracker.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60">
          Gleiche Daten, fünf Haltungen: von der Zeitungschronik über das Datencockpit bis
          zum klassischen Original. Alle Entwürfe laufen live gegen die echte Datenbank —
          über die Leiste am unteren Rand lässt sich jederzeit umschalten.
        </p>
        <Link
          to="/"
          className="mt-5 inline-block rounded-full bg-[#FFED00] px-5 py-2 text-sm font-extrabold uppercase tracking-[0.1em] text-[#0B2B6B] no-underline"
        >
          ★ Die Kampagne ist jetzt das Hauptdesign →
        </Link>

        <div className="mt-12 space-y-6">
          {DESIGNS.map((d) => (
            <Link
              key={d.to}
              to={d.to}
              className="group block overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a] no-underline transition-all hover:border-white/30 hover:bg-[#202020]"
            >
              <div className="grid sm:grid-cols-5">
                <div className="h-36 sm:col-span-2 sm:h-auto">{d.preview}</div>
                <div className="p-6 sm:col-span-3">
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <span className="text-xs font-black tracking-[0.2em] text-white/30">{d.nr}</span>
                      <h2 className="mt-1 text-xl font-black text-white">{d.name}</h2>
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">{d.tagline}</p>
                    </div>
                    <div className="flex gap-1.5">
                      {d.swatches.map((c) => (
                        <span key={c} className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{d.description}</p>
                  <span className="mt-4 inline-block text-sm font-bold text-white/80 transition-transform group-hover:translate-x-1">
                    Ansehen →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-white/30">
          <Link to="/" className="text-white/50 underline hover:text-white">Zurück zur aktuellen Ansicht</Link>
        </p>
      </div>

      <DesignSwitcher />
    </div>
  )
}
