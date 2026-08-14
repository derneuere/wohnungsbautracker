/**
 * Erzeugt aus public/favicon.svg alle Rasterfassungen (favicon.ico,
 * apple-touch-icon, PWA-Icons) und das statische Standard-Vorschaubild
 * public/og/default.png.
 *
 *   bun run src/scripts/build-icons.ts
 *
 * Bewusst ein Skript und kein Build-Schritt: die Dateien ändern sich praktisch
 * nie, liegen versioniert im Repo und müssen dort auch ohne Buildkette liegen —
 * das Standardbild ist zugleich der Notnagel, wenn die Rasterung im Betrieb
 * ausfällt.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { rendere, standardKarteSvg } from '../server/og-image'
import { SITE_HOST } from '../lib/site'

const PUBLIC = resolve(import.meta.dirname, '../../public')

/** ICO-Container mit eingebetteten PNGs (seit Vista erlaubt, spart die
 *  BMP-Kodierung samt AND-Maske). */
function ico(bilder: { groesse: number; png: Uint8Array }[]): Uint8Array {
  const kopf = 6 + bilder.length * 16
  const gesamt = kopf + bilder.reduce((s, b) => s + b.png.length, 0)
  const out = new Uint8Array(gesamt)
  const dv = new DataView(out.buffer)
  dv.setUint16(0, 0, true) // reserviert
  dv.setUint16(2, 1, true) // Typ: Icon
  dv.setUint16(4, bilder.length, true)
  let offset = kopf
  bilder.forEach((b, i) => {
    const e = 6 + i * 16
    out[e] = b.groesse >= 256 ? 0 : b.groesse
    out[e + 1] = b.groesse >= 256 ? 0 : b.groesse
    out[e + 2] = 0 // Farbpalette
    out[e + 3] = 0
    dv.setUint16(e + 4, 1, true) // Ebenen
    dv.setUint16(e + 6, 32, true) // Bits pro Pixel
    dv.setUint32(e + 8, b.png.length, true)
    dv.setUint32(e + 12, offset, true)
    out.set(b.png, offset)
    offset += b.png.length
  })
  return out
}

const faviconSvg = readFileSync(resolve(PUBLIC, 'favicon.svg'), 'utf8')

const groessen = [16, 32, 48, 180, 192, 512]
const gerendert = new Map<number, Uint8Array>()
for (const g of groessen) gerendert.set(g, await rendere(faviconSvg, g))

writeFileSync(resolve(PUBLIC, 'favicon.ico'), ico([16, 32, 48].map((g) => ({ groesse: g, png: gerendert.get(g)! }))))
writeFileSync(resolve(PUBLIC, 'apple-touch-icon.png'), gerendert.get(180)!)
writeFileSync(resolve(PUBLIC, 'icon-192.png'), gerendert.get(192)!)
writeFileSync(resolve(PUBLIC, 'icon-512.png'), gerendert.get(512)!)

const standard = await rendere(standardKarteSvg(SITE_HOST))
writeFileSync(resolve(PUBLIC, 'og/default.png'), standard)

console.log(
  `favicon.ico (16/32/48), apple-touch-icon.png, icon-192.png, icon-512.png und og/default.png (${Math.round(standard.length / 1024)} KB) geschrieben.`,
)
