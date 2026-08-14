/**
 * Erzeugt src/lib/berlin-map-data.ts aus public/berlin-bezirke.geojson:
 * die Bezirksumrisse als fertige SVG-Pfade samt Bounding-Box und Centroid,
 * plus die gebackene Projektion für Projektkoordinaten.
 *
 *   bun run src/scripts/build-map-data.ts
 *
 * Bewusst ein Skript und kein Build-Schritt: die Bezirksgrenzen ändern sich
 * praktisch nie, und das generierte Modul liegt versioniert im Repo. Das
 * GeoJSON in public/ ist nur noch der Input dieses Skripts und wird zur
 * Laufzeit nicht mehr ausgeliefert.
 *
 * Die Projektion repliziert exakt die frühere Laufzeit-Berechnung in
 * BerlinSvgMap (äquirektangular, Breite 1000, kx = cos(mittlere Breite)),
 * damit die Punktpositionen pixelidentisch bleiben.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '../..')

type Ring = Array<[number, number]>

const geo = JSON.parse(readFileSync(resolve(ROOT, 'public/berlin-bezirke.geojson'), 'utf8'))

// --- Projektion: bbox über alle Koordinaten, Min/Max per Schleife ---
let minLng = Infinity
let maxLng = -Infinity
let minLat = Infinity
let maxLat = -Infinity
const walk = (c: any, f: (p: [number, number]) => void) => {
  if (typeof c[0] === 'number') f(c as [number, number])
  else for (const sub of c) walk(sub, f)
}
for (const feat of geo.features)
  walk(feat.geometry.coordinates, ([lng, lat]) => {
    if (lng < minLng) minLng = lng
    if (lng > maxLng) maxLng = lng
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
  })

const kx = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180))
const W = 1000
const scale = W / ((maxLng - minLng) * kx)
const H = (maxLat - minLat) * scale

const project = ([lng, lat]: [number, number]): [number, number] => [
  (lng - minLng) * kx * scale,
  (maxLat - lat) * scale,
]

// --- Douglas-Peucker in viewBox-Einheiten (ε = 0.5 ≈ 0.5 px bei voller Breite) ---
const EPS = 0.5
function simplify(ring: Ring): Ring {
  if (ring.length < 3) return ring
  const keep = new Array<boolean>(ring.length).fill(false)
  keep[0] = keep[ring.length - 1] = true
  const stack: Array<[number, number]> = [[0, ring.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop()!
    const [ax, ay] = ring[a]
    const [bx, by] = ring[b]
    const dx = bx - ax
    const dy = by - ay
    const len2 = dx * dx + dy * dy
    let maxDist = 0
    let maxIdx = -1
    for (let i = a + 1; i < b; i++) {
      const [px, py] = ring[i]
      let dist: number
      if (len2 === 0) dist = Math.hypot(px - ax, py - ay)
      else dist = Math.abs(dy * px - dx * py + bx * ay - by * ax) / Math.sqrt(len2)
      if (dist > maxDist) {
        maxDist = dist
        maxIdx = i
      }
    }
    if (maxDist > EPS) {
      keep[maxIdx] = true
      stack.push([a, maxIdx], [maxIdx, b])
    }
  }
  return ring.filter((_, i) => keep[i])
}

/** Signierte Fläche (Shoelace) in viewBox-Einheiten². */
const area = (ring: Ring) => {
  let s = 0
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[(i + 1) % ring.length]
    s += x1 * y2 - x2 * y1
  }
  return s / 2
}

const centroidOf = (ring: Ring): [number, number] => {
  const a = area(ring)
  let cx = 0
  let cy = 0
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[(i + 1) % ring.length]
    const f = x1 * y2 - x2 * y1
    cx += (x1 + x2) * f
    cy += (y1 + y2) * f
  }
  return [cx / (6 * a), cy / (6 * a)]
}

const r1 = (n: number) => Math.round(n * 10) / 10

function ringToPath(ring: Ring): string {
  let d = ''
  let prev: [number, number] | null = null
  for (const p of ring) {
    const q: [number, number] = [r1(p[0]), r1(p[1])]
    if (prev && q[0] === prev[0] && q[1] === prev[1]) continue
    d += `${prev ? 'L' : 'M'}${q[0]} ${q[1]}`
    prev = q
  }
  return d + 'Z'
}

type Shape = {
  name: string
  d: string
  bbox: [number, number, number, number]
  centroid: [number, number]
}

let ptsBefore = 0
let ptsAfter = 0

const bezirke: Shape[] = geo.features.map((feat: any) => {
  const g = feat.geometry
  const polys: Ring[][] = g.type === 'Polygon' ? [g.coordinates] : g.coordinates

  let d = ''
  let bx0 = Infinity
  let by0 = Infinity
  let bx1 = -Infinity
  let by1 = -Infinity
  let biggest: Ring | null = null
  let biggestArea = 0

  for (const poly of polys) {
    for (const rawRing of poly) {
      const projected: Ring = rawRing.map(project)
      ptsBefore += projected.length
      const slim = simplify(projected)
      const a = Math.abs(area(slim))
      if (a < 4) continue // Mini-Ringe (Splitter unterhalb der Sichtbarkeit) verwerfen
      ptsAfter += slim.length
      d += ringToPath(slim)
      for (const [x, y] of slim) {
        if (x < bx0) bx0 = x
        if (y < by0) by0 = y
        if (x > bx1) bx1 = x
        if (y > by1) by1 = y
      }
      if (a > biggestArea) {
        biggestArea = a
        biggest = slim
      }
    }
  }

  const [cx, cy] = centroidOf(biggest!)
  return {
    name: feat.properties.name,
    d,
    bbox: [r1(bx0), r1(by0), r1(bx1 - bx0), r1(by1 - by0)],
    centroid: [r1(cx), r1(cy)],
  }
})

const out = `// GENERIERT von src/scripts/build-map-data.ts — nicht von Hand bearbeiten.
// Quelle: public/berlin-bezirke.geojson (äquirektangulare Projektion, Breite ${W},
// Douglas-Peucker ε=${EPS} viewBox-Einheiten).

export const MAP_W = ${W}
export const MAP_H = ${r1(H)}

const MIN_LNG = ${minLng}
const MAX_LAT = ${maxLat}
const KX = ${kx}
const SCALE = ${scale}

/** Projiziert WGS84-Koordinaten in viewBox-Einheiten (0 0 ${W} ${r1(H)}). */
export const projiziere = (lng: number, lat: number): [number, number] => [
  (lng - MIN_LNG) * KX * SCALE,
  (MAX_LAT - lat) * SCALE,
]

export type BezirkShape = {
  name: string
  /** Fertiger SVG-Pfad des Bezirksumrisses. */
  d: string
  /** [x, y, Breite, Höhe] in viewBox-Einheiten. */
  bbox: [number, number, number, number]
  /** Flächenschwerpunkt des größten Rings — für Badges/Labels. */
  centroid: [number, number]
}

export const BEZIRKE: BezirkShape[] = ${JSON.stringify(bezirke, null, 2)}
`

writeFileSync(resolve(ROOT, 'src/lib/berlin-map-data.ts'), out)
console.log(
  `berlin-map-data.ts geschrieben: ${bezirke.length} Bezirke, ${ptsBefore} → ${ptsAfter} Punkte, ${Math.round(out.length / 1024)} KB.`,
)
console.log(bezirke.map((b) => b.name).join(', '))
