/**
 * Teilen-Vorschaubilder (Open Graph, 1200x630).
 *
 * Wer eine Projektseite in WhatsApp, Mastodon oder X postet, soll die Aussage
 * schon in der Vorschau sehen: Status, Bezirk, Titel und vor allem die Zahl der
 * Wohnungen, die nicht entstehen. Die Karte wird deshalb pro Projekt gerendert —
 * als SVG im Kampagnendesign, das resvg (WASM) zu PNG rastert. Social-Crawler
 * akzeptieren kein SVG, deshalb der Umweg.
 */
import { initWasm, Resvg } from '@resvg/resvg-wasm'
import { readFileSync } from 'node:fs'
import { BLUE, CYAN, DEEP, STATUS_CHIP, YELLOW } from '../lib/campaign'
import { fmt, parseEstimateMeta, type TrackerProject } from '../lib/design-data'
import { FAMILY, FONT_FILES, ogAsset, passendeGroesse, textBreite } from './og-fonts'

export const OG_BREITE = 1200
export const OG_HOEHE = 630

const RAND = 64
const INHALT = OG_BREITE - RAND * 2

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

type TextOpt = {
  x: number
  y: number
  groesse: number
  familie?: 'regular' | 'black'
  farbe: string
  laufweite?: number
  anker?: 'start' | 'middle' | 'end'
}

function svgText(text: string, o: TextOpt): string {
  const familie = FAMILY[o.familie ?? 'regular']
  return (
    `<text x="${o.x}" y="${o.y}" font-family="${familie}" font-size="${o.groesse}" fill="${o.farbe}"` +
    (o.laufweite ? ` letter-spacing="${o.laufweite}"` : '') +
    (o.anker && o.anker !== 'start' ? ` text-anchor="${o.anker}"` : '') +
    `>${esc(text)}</text>`
  )
}

/** Der Statusreiter — dieselbe Farbgebung wie auf der Website. */
function chip(label: string, bg: string, fg: string, x: number, y: number): { svg: string; breite: number } {
  const groesse = 22
  const laufweite = 2.4
  const breite = textBreite(label, groesse, 'black', laufweite) + 34
  return {
    breite,
    svg:
      `<rect x="${x}" y="${y}" width="${breite}" height="46" fill="${bg}"/>` +
      svgText(label, { x: x + 17, y: y + 32, groesse, familie: 'black', farbe: fg, laufweite }),
  }
}

/** Das Fenstermuster aus dem Logo als Ecksignet — „Lichter an“, oben rechts. */
function fensterRaster(): string {
  const feld = 20
  const luecke = 10
  const x0 = OG_BREITE - RAND - (feld * 3 + luecke * 2)
  const y0 = 58
  const an = new Set(['2-0', '0-2'])
  let svg = ''
  for (let c = 0; c < 3; c++) {
    for (let r = 0; r < 3; r++) {
      const fill = an.has(`${c}-${r}`) ? YELLOW : BLUE
      svg += `<rect x="${x0 + c * (feld + luecke)}" y="${y0 + r * (feld + luecke)}" width="${feld}" height="${feld}" fill="${fill}"/>`
    }
  }
  return svg
}

/** Fußzeile: Logomarke, Wortmarke, Domain. Auf jeder Karte gleich. */
function fusszeile(host: string): string {
  const y = 548
  const marke = [`<rect x="${RAND}" y="${y}" width="44" height="44" rx="6" fill="${BLUE}"/>`]
  const an = new Set(['2-0', '0-2'])
  for (let c = 0; c < 3; c++) {
    for (let r = 0; r < 3; r++) {
      const fill = an.has(`${c}-${r}`) ? YELLOW : DEEP
      marke.push(`<rect x="${RAND + 6 + c * 12}" y="${y + 6 + r * 12}" width="8" height="8" fill="${fill}"/>`)
    }
  }
  return (
    `<rect x="${RAND}" y="516" width="${INHALT}" height="2" fill="#ffffff" opacity="0.12"/>` +
    marke.join('') +
    svgText('WOHNUNGSBAU-TRACKER BERLIN', {
      x: RAND + 62,
      y: y + 30,
      groesse: 22,
      familie: 'black',
      farbe: '#ffffff',
      laufweite: 2,
    }) +
    svgText(host, {
      x: OG_BREITE - RAND,
      y: y + 30,
      groesse: 20,
      farbe: '#ffffff',
      anker: 'end',
      laufweite: 1,
    })
  )
}

function rahmen(inhalt: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_BREITE}" height="${OG_HOEHE}" viewBox="0 0 ${OG_BREITE} ${OG_HOEHE}">` +
    `<rect width="${OG_BREITE}" height="${OG_HOEHE}" fill="${DEEP}"/>` +
    `<rect x="${RAND}" y="58" width="180" height="10" fill="${CYAN}"/>` +
    fensterRaster() +
    inhalt +
    '</svg>'
  )
}

/** Die Kennzahl unten links: belegte WE, sonst Schätzung, sonst der Grund. */
function kennzahl(p: TrackerProject): string {
  const we = p.unitCount || p.unitCountEstimate || 0
  const geschaetzt = !p.unitCount && !!p.unitCountEstimate

  if (we > 0) {
    const label =
      p.status === 'erledigt'
        ? 'Wohnungen — nach jahrelanger Blockade doch entstanden'
        : geschaetzt
          ? 'geplante Wohnungen laut Quellenlage — recherchierte Schätzung'
          : 'geplante Wohnungen, die nicht entstehen'
    return (
      svgText(`${geschaetzt ? '~' : ''}${fmt(we)}`, {
        x: RAND,
        y: 462,
        groesse: 96,
        familie: 'black',
        farbe: '#ffffff',
      }) +
      svgText(label.toUpperCase(), {
        x: RAND,
        y: 496,
        groesse: 19,
        farbe: '#ffffff',
        laufweite: 3,
      })
    )
  }

  const basis = parseEstimateMeta(p)?.basis
  const text =
    basis === 'keine_wohnnutzung'
      ? 'Nach Quellenlage keine nennenswerte Wohnnutzung geplant.'
      : basis === 'nicht_bezifferbar'
        ? 'Pauschaler Vorgang — Wohneinheiten nicht seriös bezifferbar.'
        : 'Zahl der Wohneinheiten nicht aktenkundig.'
  const { groesse, zeilen } = passendeGroesse(text, INHALT, [34, 30, 26], 2, 'black')
  const start = 496 - (zeilen.length - 1) * groesse * 1.25
  return zeilen
    .map((z, i) =>
      svgText(z, { x: RAND, y: start + i * groesse * 1.25, groesse, familie: 'black', farbe: '#ffffffcc' }),
    )
    .join('')
}

/** Vorschaukarte eines Projekts. */
export function projektKarteSvg(p: TrackerProject, host: string): string {
  const status = STATUS_CHIP[p.status] || STATUS_CHIP.abgelehnt
  const reiter = chip(status.label, status.bg, status.fg, RAND, 92)
  const ort = p.bezirk.toUpperCase() + (p.date ? ` · ${p.date}` : '')

  // Drei Zeilen sind das Maximum: darunter beginnt die Kennzahl, und die soll
  // auch bei den längsten Vorhabentiteln nicht ins Gedränge geraten.
  const { groesse, zeilen } = passendeGroesse(p.title, INHALT, [74, 62, 52, 44], 3, 'black')
  const titel = zeilen
    .map((z, i) =>
      svgText(z, { x: RAND, y: 200 + i * groesse * 1.08, groesse, familie: 'black', farbe: YELLOW }),
    )
    .join('')

  return rahmen(
    reiter.svg +
      svgText(ort, {
        x: RAND + reiter.breite + 20,
        y: 124,
        groesse: 20,
        farbe: '#ffffff',
        laufweite: 3,
      }) +
      titel +
      kennzahl(p) +
      fusszeile(host),
  )
}

/** Karte für Startseite und alles ohne eigenes Projekt — bewusst ohne Zahlen,
 *  damit sie nicht veraltet, wenn der Datenstand wächst. */
export function standardKarteSvg(host: string): string {
  const titel = passendeGroesse('Wo blockiert wird, ist nichts möglich.', INHALT, [86, 74, 62], 2, 'black')
  const zeilen = titel.zeilen
    .map((z, i) =>
      svgText(z, { x: RAND, y: 216 + i * titel.groesse * 1.12, groesse: titel.groesse, familie: 'black', farbe: YELLOW }),
    )
    .join('')
  const unter = passendeGroesse(
    'Jedes blockierte, verzögerte und abgelehnte Neubauvorhaben Berlins — mit Quellen, Akteuren und Wohnungszahl.',
    INHALT,
    [30, 26],
    3,
    'regular',
  )
  return rahmen(
    zeilen +
      unter.zeilen
        .map((z, i) =>
          svgText(z, { x: RAND, y: 430 + i * unter.groesse * 1.4, groesse: unter.groesse, farbe: '#ffffffb3' }),
        )
        .join('') +
      fusszeile(host),
  )
}

// --- Rasterung -------------------------------------------------------------

let wasmBereit: Promise<void> | null = null

function initialisiere(): Promise<void> {
  if (!wasmBereit) {
    wasmBereit = initWasm(readFileSync(ogAsset('resvg.wasm'))).catch((fehler: unknown) => {
      // Bei HMR im Dev läuft das Modul erneut durch, das WASM ist dann schon da.
      if (String(fehler).includes('Already initialized')) return
      wasmBereit = null
      throw fehler
    })
  }
  return wasmBereit
}

let schriften: Uint8Array[] | null = null

/** Rendert ein SVG zu PNG — Standardbreite ist das Open-Graph-Format. */
export async function rendere(svg: string, breite = OG_BREITE): Promise<Uint8Array> {
  await initialisiere()
  if (!schriften) {
    schriften = [
      new Uint8Array(readFileSync(ogAsset(FONT_FILES.archivo))),
      new Uint8Array(readFileSync(ogAsset(FONT_FILES.archivoBlack))),
    ]
  }
  const resvg = new Resvg(svg, {
    font: { fontBuffers: schriften, loadSystemFonts: false, defaultFontFamily: FAMILY.regular },
    fitTo: { mode: 'width', value: breite },
  })
  return resvg.render().asPng()
}

// Ein Rendern kostet ~100 ms; Crawler holen dieselbe Karte mehrfach (Vorschau,
// Retry, zweite Plattform). Der Cache verfällt über updatedAt von selbst, sobald
// die Redaktion das Projekt ändert.
const cache = new Map<string, Uint8Array>()

export async function projektKartePng(p: TrackerProject & { updatedAt?: Date | null }, host: string): Promise<Uint8Array> {
  const schluessel = `${p.id}-${p.updatedAt instanceof Date ? p.updatedAt.getTime() : 0}-${host}`
  const gemerkt = cache.get(schluessel)
  if (gemerkt) return gemerkt
  const png = await rendere(projektKarteSvg(p, host))
  if (cache.size > 120) cache.clear()
  cache.set(schluessel, png)
  return png
}
