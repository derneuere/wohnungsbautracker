import { useEffect, useMemo, useRef, useState } from 'react'

// Schlichte SVG-Karte der Berliner Bezirke (Stil: Amt für Statistik) —
// nur Umrisse und einfarbige Projektpunkte, keine Basemap, keine Ortsnamen.
// Hover zeigt einen Tooltip mit Titel und optionaler Unterzeile.

type Punkt = {
  id: number
  lat: number
  lng: number
  title: string
  sub?: string
  href?: string
}

type Built = {
  w: number
  h: number
  paths: string[]
  project: (lng: number, lat: number) => [number, number]
}

function build(geo: any): Built {
  const coords: Array<[number, number]> = []
  const walk = (c: any) => {
    if (typeof c[0] === 'number') coords.push(c as [number, number])
    else c.forEach(walk)
  }
  geo.features.forEach((f: any) => walk(f.geometry.coordinates))

  const lngs = coords.map((c) => c[0])
  const lats = coords.map((c) => c[1])
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)

  const kx = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180))
  const w = 1000
  const scale = w / ((maxLng - minLng) * kx)
  const h = (maxLat - minLat) * scale

  const project = (lng: number, lat: number): [number, number] => [
    (lng - minLng) * kx * scale,
    (maxLat - lat) * scale,
  ]

  const ringToPath = (ring: Array<[number, number]>) =>
    ring
      .map((c, i) => {
        const [x, y] = project(c[0], c[1])
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join('') + 'Z'

  const paths: string[] = []
  geo.features.forEach((f: any) => {
    const g = f.geometry
    if (g.type === 'Polygon') {
      paths.push(g.coordinates.map(ringToPath).join(''))
    } else if (g.type === 'MultiPolygon') {
      paths.push(g.coordinates.map((poly: any) => poly.map(ringToPath).join('')).join(''))
    }
  })

  return { w, h, paths, project }
}

export default function BerlinSvgMap({
  punkte,
  flaeche = 'rgba(255,255,255,0.06)',
  grenze = 'rgba(255,255,255,0.4)',
  punkt = '#FFED00',
}: {
  punkte: Punkt[]
  flaeche?: string
  grenze?: string
  punkt?: string
}) {
  const [geo, setGeo] = useState<any>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const [tip, setTip] = useState<null | { x: number; y: number; title: string; sub?: string }>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/berlin-bezirke.geojson')
      .then((r) => r.json())
      .then(setGeo)
      .catch(() => {})
  }, [])

  const built = useMemo(() => (geo ? build(geo) : null), [geo])

  if (!built) {
    return <div className="aspect-[1000/620] w-full" aria-hidden />
  }

  const showTip = (p: Punkt, e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    setTip({ x: e.clientX - rect.left, y: e.clientY - rect.top, title: p.title, sub: p.sub })
  }

  return (
    <div ref={wrapRef} className="relative">
      <svg
        viewBox={`0 0 ${built.w} ${built.h}`}
        className="h-auto w-full"
        role="img"
        aria-label="Karte der Berliner Bezirke mit den erfassten Bauvorhaben"
      >
        {built.paths.map((d, i) => (
          <path key={i} d={d} fill={flaeche} stroke={grenze} strokeWidth="1.4" strokeLinejoin="round" />
        ))}
        {punkte.map((p) => {
          const [x, y] = built.project(p.lng, p.lat)
          if (x < -20 || y < -20 || x > built.w + 20 || y > built.h + 20) return null
          const circle = (
            <circle
              cx={x}
              cy={y}
              r={hovered === p.id ? 11 : 7}
              fill={punkt}
              stroke="#02173A"
              strokeWidth="2"
              style={{ transition: 'r 120ms' }}
              onMouseEnter={(e) => {
                setHovered(p.id)
                showTip(p, e)
              }}
              onMouseMove={(e) => showTip(p, e)}
              onMouseLeave={() => {
                setHovered(null)
                setTip(null)
              }}
            />
          )
          return p.href ? (
            <a key={p.id} href={p.href} className="cursor-pointer" aria-label={p.title}>
              {circle}
            </a>
          ) : (
            <g key={p.id}>{circle}</g>
          )
        })}
      </svg>

      {tip && (
        <div
          className="pointer-events-none absolute z-10 max-w-[280px] -translate-x-1/2 -translate-y-full border-2 px-3 py-2"
          style={{ left: tip.x, top: tip.y - 14, backgroundColor: '#02173A', borderColor: '#FFED00' }}
        >
          <div className="text-xs font-extrabold leading-snug text-white">{tip.title}</div>
          {tip.sub && (
            <div className="mt-0.5 text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: '#FFED00' }}>
              {tip.sub}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
