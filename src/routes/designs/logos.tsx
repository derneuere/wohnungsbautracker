import { Link, createFileRoute } from '@tanstack/react-router'
import DesignSwitcher from '../../components/DesignSwitcher'

export const Route = createFileRoute('/designs/logos')({
  head: () => ({
    meta: [{ title: 'Logo-Studie — WBT Kampagne' }],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700;800&display=swap',
      },
    ],
  }),
  component: LogosPage,
})

const BLUE = '#0B2B6B'
const YELLOW = '#FFED00'
const CYAN = '#1CB5E5'

const display = { fontFamily: "'Archivo Black', 'Arial Black', sans-serif" }

type LogoProps = { height?: number }

/* 1 — Reine Wortmarke mit gelbem Punkt (am nächsten am FDP-Original) */
function LogoPunkt({ height = 40 }: LogoProps) {
  const vb = { w: 122, h: 40 }
  return (
    <svg height={height} width={height * (vb.w / vb.h)} viewBox={`0 0 ${vb.w} ${vb.h}`} role="img" aria-label="WBT">
      <text x="0" y="33" fontSize="38" textLength="98" lengthAdjust="spacingAndGlyphs" fill={BLUE} style={display}>
        WBT
      </text>
      <rect x="106" y="23" width="10" height="10" fill={YELLOW} />
    </svg>
  )
}

/* 2 — Wortmarke über zweifarbigem Akzentbalken (Cyan/Gelb aus dem Hero) */
function LogoBalken({ height = 40 }: LogoProps) {
  const vb = { w: 100, h: 46 }
  return (
    <svg height={height} width={height * (vb.w / vb.h)} viewBox={`0 0 ${vb.w} ${vb.h}`} role="img" aria-label="WBT">
      <text x="0" y="30" fontSize="34" textLength="88" lengthAdjust="spacingAndGlyphs" fill={BLUE} style={display}>
        WBT
      </text>
      <rect x="1" y="37" width="60" height="7" fill={CYAN} />
      <rect x="61" y="37" width="27" height="7" fill={YELLOW} />
    </svg>
  )
}

/* 3 — Der Kran: hebt endlich ein (gelbes) Wohnhaus (kreativ) */
function LogoKran({ height = 40 }: LogoProps) {
  const vb = { w: 174, h: 44 }
  return (
    <svg height={height} width={height * (vb.w / vb.h)} viewBox={`0 0 ${vb.w} ${vb.h}`} role="img" aria-label="WBT">
      {/* Gegengewicht, Ausleger, Mast */}
      <rect x="0" y="9" width="9" height="7" fill={BLUE} />
      <rect x="0" y="4" width="66" height="5" fill={BLUE} />
      <rect x="14" y="4" width="5" height="40" fill={BLUE} />
      {/* Seil + hängender Wohnblock */}
      <rect x="56" y="9" width="2" height="13" fill={BLUE} />
      <rect x="49" y="22" width="16" height="14" fill={YELLOW} stroke={BLUE} strokeWidth="2.5" />
      <rect x="53" y="26" width="3" height="3" fill={BLUE} />
      <rect x="59" y="26" width="3" height="3" fill={BLUE} />
      <rect x="53" y="31" width="3" height="3" fill={BLUE} />
      <rect x="59" y="31" width="3" height="3" fill={BLUE} />
      <text x="80" y="35" fontSize="32" textLength="84" lengthAdjust="spacingAndGlyphs" fill={BLUE} style={display}>
        WBT
      </text>
    </svg>
  )
}

/* 4 — Die Absperrung: Baustellen-Schraffur als Bildmarke (kreativ) */
function LogoAbsperrung({ height = 40 }: LogoProps) {
  const vb = { w: 158, h: 44 }
  return (
    <svg height={height} width={height * (vb.w / vb.h)} viewBox={`0 0 ${vb.w} ${vb.h}`} role="img" aria-label="WBT">
      <defs>
        <clipPath id="wbt-clip-absperrung">
          <rect x="0" y="2" width="44" height="40" rx="4" />
        </clipPath>
      </defs>
      <rect x="0" y="2" width="44" height="40" rx="4" fill={BLUE} />
      <g clipPath="url(#wbt-clip-absperrung)">
        <path d="M-14 50 L22 -8" stroke={YELLOW} strokeWidth="10" />
        <path d="M8 50 L44 -8" stroke={YELLOW} strokeWidth="10" />
        <path d="M30 50 L66 -8" stroke={YELLOW} strokeWidth="10" />
      </g>
      <text x="56" y="35" fontSize="32" textLength="84" lengthAdjust="spacingAndGlyphs" fill={BLUE} style={display}>
        WBT
      </text>
    </svg>
  )
}

/* 5 — Lichter an: Wohnblock, in dem erst drei Fenster leuchten (kreativ) */
function LogoLichter({ height = 40 }: LogoProps) {
  const vb = { w: 152, h: 44 }
  const cols = [7, 17, 27]
  const rows = [6, 15, 24, 33]
  const lit = new Set(['0-1', '1-3', '2-0'])
  return (
    <svg height={height} width={height * (vb.w / vb.h)} viewBox={`0 0 ${vb.w} ${vb.h}`} role="img" aria-label="WBT">
      <rect x="0" y="0" width="40" height="44" rx="3" fill={BLUE} />
      {cols.map((cx, ci) =>
        rows.map((ry, ri) => (
          <rect
            key={`${ci}-${ri}`}
            x={cx}
            y={ry}
            width="6"
            height="6"
            fill={lit.has(`${ci}-${ri}`) ? YELLOW : '#23448C'}
          />
        )),
      )}
      <text x="52" y="35" fontSize="32" textLength="84" lengthAdjust="spacingAndGlyphs" fill={BLUE} style={display}>
        WBT
      </text>
    </svg>
  )
}

const VARIANTS = [
  {
    nr: 1,
    name: 'Der Punkt',
    bold: false,
    desc: 'Reine Wortmarke in Dunkelblau mit gelbem Quadratpunkt — am nächsten am FDP-Original: nur Buchstaben, ein einziger Farbakzent.',
    Logo: LogoPunkt,
  },
  {
    nr: 2,
    name: 'Der Balken',
    bold: false,
    desc: 'Wortmarke über dem zweifarbigen Akzentbalken aus dem Hero (Cyan/Gelb). Schlicht, aber mit Wiedererkennung zur Kampagne.',
    Logo: LogoBalken,
  },
  {
    nr: 3,
    name: 'Der Kran',
    bold: true,
    desc: 'Ein Baukran, der endlich ein gelbes Wohnhaus heben soll — das Symbol für das, was in Berlin fehlt. Erzählt die Geschichte des Trackers in einem Piktogramm.',
    Logo: LogoKran,
  },
  {
    nr: 4,
    name: 'Die Absperrung',
    bold: true,
    desc: 'Baustellen-Schraffur als Bildmarke: das universelle Zeichen für „Hier geht nichts weiter". Aggressiv einfach, sofort lesbar.',
    Logo: LogoAbsperrung,
  },
  {
    nr: 5,
    name: 'Lichter an',
    bold: true,
    desc: 'Ein Wohnblock, in dem erst drei Fenster leuchten — die übrigen warten auf Bewohner. Das stillste, aber vielleicht poetischste Zeichen.',
    Logo: LogoLichter,
  },
]

function HeaderMock({ Logo }: { Logo: (p: LogoProps) => React.ReactNode }) {
  return (
    <div className="flex h-16 items-center justify-between border border-black/10 bg-white px-5">
      <Logo height={32} />
      <div className="flex items-center gap-6">
        <div className="hidden gap-6 text-[13px] font-bold uppercase tracking-[0.12em] text-black sm:flex">
          <span>Zahlen</span>
          <span>Bremser</span>
          <span>Karte</span>
          <span>Projekte</span>
        </div>
        <span
          className="rounded-full px-5 py-2 text-[13px] font-extrabold uppercase tracking-[0.1em] text-white"
          style={{ backgroundColor: CYAN }}
        >
          Hinsehen
        </span>
      </div>
    </div>
  )
}

function LogosPage() {
  return (
    <div className="min-h-screen bg-[#F4F4F2] pb-28" style={{ fontFamily: "'Archivo', 'Helvetica Neue', sans-serif" }}>
      <div className="mx-auto max-w-4xl px-5 pt-16 sm:px-8">
        <div className="h-2 w-44" style={{ backgroundColor: CYAN }} />
        <h1 className="mt-5" style={{ ...display, color: BLUE, fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.02 }}>
          Fünf Logos für die Kampagne.
        </h1>
        <p className="mt-4 max-w-xl text-base font-semibold text-black/70">
          Alle in Dunkelblau gehalten, wie das Vorbild. Variante 1 und 2 sind bewusst
          schlicht — nur Wortmarke. Variante 3 bis 5 sind die mutigen. Jeweils einmal groß
          und einmal im echten Header-Kontext.
        </p>

        <div className="mt-12 space-y-10">
          {VARIANTS.map((v) => (
            <section key={v.nr} className="overflow-hidden border-2 bg-white" style={{ borderColor: BLUE }}>
              <div className="flex flex-wrap items-center justify-between gap-2 px-6 pt-5">
                <h2 className="text-lg" style={{ ...display, color: BLUE }}>
                  {v.nr} — {v.name}
                </h2>
                <span
                  className="px-2.5 py-1 text-[11px] font-black tracking-[0.15em]"
                  style={v.bold ? { backgroundColor: '#111', color: YELLOW } : { backgroundColor: CYAN, color: '#fff' }}
                >
                  {v.bold ? 'MUTIG' : 'SCHLICHT'}
                </span>
              </div>
              <p className="px-6 pt-2 text-sm font-medium leading-relaxed text-black/60">{v.desc}</p>

              <div className="mt-5 flex items-center justify-center border-y border-black/10 bg-white px-6 py-10">
                <v.Logo height={84} />
              </div>

              <div className="p-4">
                <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-black/40">
                  Im Header-Kontext
                </p>
                <HeaderMock Logo={v.Logo} />
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 text-center text-sm font-semibold text-black/50">
          Variante 5 („Lichter an") ist als Logo im Einsatz — auf der{' '}
          <Link to="/" className="underline" style={{ color: BLUE }}>
            Startseite
          </Link>{' '}
          und den Projektseiten.
        </p>
      </div>

      <DesignSwitcher />
    </div>
  )
}
