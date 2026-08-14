/**
 * Schriftmaße für die Teilen-Vorschaubilder.
 *
 * resvg rendert SVG-Text, kann aber nicht messen — für Zeilenumbruch und
 * automatische Schriftgröße brauchen wir die Glyphenbreiten selbst. Deshalb hier
 * ein minimaler TrueType-Leser: Tabellenverzeichnis → `head` (unitsPerEm),
 * `hhea`/`hmtx` (Vorschubbreiten), `cmap` (Zeichen → Glyph-ID). Das reicht für
 * reine Breitenmessung; Kerning bleibt außen vor (bei Archivo Black im
 * Plakatformat unter einem Prozent Abweichung).
 */
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, resolve } from 'node:path'

/** Verzeichnis mit Schriften und WASM — im Dev unter public/og, im Produktions-
 *  Build unter .output/public/og. Beide Fälle werden hier abgeklopft, damit die
 *  Bilderzeugung ohne Sonderpfade in beiden Umgebungen läuft. */
function assetDir(): string {
  const hier = fileURLToPath(new URL('.', import.meta.url))
  const kandidaten = [
    process.env.OG_ASSET_DIR,
    resolve(hier, '../public/og'), // Nitro-Bundle: .output/server → .output/public
    resolve(hier, '../../public/og'), // Dev: src/server → public
    resolve(process.cwd(), '.output/public/og'),
    resolve(process.cwd(), 'public/og'),
  ].filter(Boolean) as string[]
  const treffer = kandidaten.find((d) => existsSync(join(d, 'archivo-black.ttf')))
  if (!treffer) throw new Error(`OG-Assets nicht gefunden. Gesucht in: ${kandidaten.join(', ')}`)
  return treffer
}

let dir: string | null = null
export function ogAsset(datei: string): string {
  if (!dir) dir = assetDir()
  return join(dir, datei)
}

export const FONT_FILES = {
  archivo: 'archivo.ttf',
  archivoBlack: 'archivo-black.ttf',
} as const

/** Familienname, wie ihn resvg aus der Schriftdatei liest. */
export const FAMILY = {
  regular: 'Archivo',
  black: 'Archivo Black',
} as const

export type Familie = keyof typeof FAMILY

type Metrik = { unitsPerEm: number; breite: (cp: number) => number }

function leseCmap(dv: DataView, cmapOff: number): (cp: number) => number {
  const anzahl = dv.getUint16(cmapOff + 2)
  let format4 = 0
  let format12 = 0
  for (let i = 0; i < anzahl; i++) {
    const rec = cmapOff + 4 + i * 8
    const platform = dv.getUint16(rec)
    const encoding = dv.getUint16(rec + 2)
    const off = cmapOff + dv.getUint32(rec + 4)
    const format = dv.getUint16(off)
    const unicode = platform === 0 || (platform === 3 && (encoding === 1 || encoding === 10))
    if (!unicode) continue
    if (format === 12 && !format12) format12 = off
    if (format === 4 && !format4) format4 = off
  }

  if (format12) {
    const gruppen = dv.getUint32(format12 + 12)
    return (cp) => {
      let lo = 0
      let hi = gruppen - 1
      while (lo <= hi) {
        const mid = (lo + hi) >> 1
        const g = format12 + 16 + mid * 12
        const start = dv.getUint32(g)
        const end = dv.getUint32(g + 4)
        if (cp < start) hi = mid - 1
        else if (cp > end) lo = mid + 1
        else return dv.getUint32(g + 8) + (cp - start)
      }
      return 0
    }
  }

  if (!format4) return () => 0
  const segCount = dv.getUint16(format4 + 6) / 2
  const endeOff = format4 + 14
  const startOff = endeOff + segCount * 2 + 2
  const deltaOff = startOff + segCount * 2
  const rangeOff = deltaOff + segCount * 2
  return (cp) => {
    if (cp > 0xffff) return 0
    for (let i = 0; i < segCount; i++) {
      if (dv.getUint16(endeOff + i * 2) < cp) continue
      const start = dv.getUint16(startOff + i * 2)
      if (start > cp) return 0
      const delta = dv.getInt16(deltaOff + i * 2)
      const range = dv.getUint16(rangeOff + i * 2)
      if (range === 0) return (cp + delta) & 0xffff
      const gOff = rangeOff + i * 2 + range + (cp - start) * 2
      const gid = dv.getUint16(gOff)
      return gid === 0 ? 0 : (gid + delta) & 0xffff
    }
    return 0
  }
}

function leseMetrik(buf: Buffer): Metrik {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  const anzahlTabellen = dv.getUint16(4)
  const tabellen: Record<string, number> = {}
  for (let i = 0; i < anzahlTabellen; i++) {
    const p = 12 + i * 16
    const tag = String.fromCharCode(buf[p], buf[p + 1], buf[p + 2], buf[p + 3])
    tabellen[tag] = dv.getUint32(p + 8)
  }
  const unitsPerEm = dv.getUint16(tabellen.head + 18)
  const anzahlHMetriken = dv.getUint16(tabellen.hhea + 34)
  const hmtx = tabellen.hmtx
  const glyph = leseCmap(dv, tabellen.cmap)
  const cache = new Map<number, number>()
  return {
    unitsPerEm,
    breite: (cp) => {
      const gemerkt = cache.get(cp)
      if (gemerkt !== undefined) return gemerkt
      const gid = glyph(cp)
      const w = dv.getUint16(hmtx + Math.min(gid, anzahlHMetriken - 1) * 4)
      cache.set(cp, w)
      return w
    },
  }
}

const metriken: Partial<Record<Familie, Metrik>> = {}

function metrik(familie: Familie): Metrik {
  let m = metriken[familie]
  if (!m) {
    m = leseMetrik(readFileSync(ogAsset(familie === 'black' ? FONT_FILES.archivoBlack : FONT_FILES.archivo)))
    metriken[familie] = m
  }
  return m
}

/** Textbreite in Pixeln bei gegebener Schriftgröße. */
export function textBreite(text: string, groesse: number, familie: Familie, laufweite = 0): number {
  const m = metrik(familie)
  let summe = 0
  for (const zeichen of text) summe += m.breite(zeichen.codePointAt(0)!)
  return (summe / m.unitsPerEm) * groesse + Math.max(0, [...text].length - 1) * laufweite
}

/** Bricht Text an Wortgrenzen auf die verfügbare Breite um. Überlange
 *  Einzelwörter (Berliner Behördennamen…) bleiben stehen — sie werden über die
 *  automatische Schriftgrößenwahl klein genug. */
export function umbrechen(text: string, breite: number, groesse: number, familie: Familie): string[] {
  const zeilen: string[] = []
  let aktuell = ''
  for (const wort of text.split(/\s+/).filter(Boolean)) {
    const versuch = aktuell ? `${aktuell} ${wort}` : wort
    if (aktuell && textBreite(versuch, groesse, familie) > breite) {
      zeilen.push(aktuell)
      aktuell = wort
    } else {
      aktuell = versuch
    }
  }
  if (aktuell) zeilen.push(aktuell)
  return zeilen
}

/** Größte Schriftgröße aus `groessen`, mit der der Text in `maxZeilen` passt. */
export function passendeGroesse(
  text: string,
  breite: number,
  groessen: number[],
  maxZeilen: number,
  familie: Familie,
): { groesse: number; zeilen: string[] } {
  let letzte = { groesse: groessen[groessen.length - 1], zeilen: [] as string[] }
  for (const groesse of groessen) {
    const zeilen = umbrechen(text, breite, groesse, familie)
    letzte = { groesse, zeilen }
    if (zeilen.length <= maxZeilen && zeilen.every((z) => textBreite(z, groesse, familie) <= breite)) {
      return { groesse, zeilen }
    }
  }
  return { groesse: letzte.groesse, zeilen: letzte.zeilen.slice(0, maxZeilen) }
}
