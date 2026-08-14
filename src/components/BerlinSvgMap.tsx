import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { BEZIRKE, MAP_H, MAP_W, projiziere } from '../lib/berlin-map-data'

// Schlichte SVG-Karte der Berliner Bezirke (Stil: Amt für Statistik) mit
// zweistufigem Drilldown: erster Tap wählt einen Bezirk (ganzflächiges
// Tap-Target, die Karte zoomt hinein), zweiter Tap öffnet das Projekt.
// Ein Breadcrumb über der Karte führt zurück. Die Geometrie kommt fertig
// projiziert aus berlin-map-data.ts — kein Laufzeit-Fetch, kein Layout-Sprung.

type Punkt = {
  id: number
  lat: number
  lng: number
  bezirk: string
  title: string
  sub?: string
  /** Projekt-Slug für die Detailseite; ohne Slug bleibt der Punkt dekorativ. */
  slug?: string
}

const FLAECHE = 'rgba(255,255,255,0.06)'
const GRENZE = 'rgba(255,255,255,0.4)'
const PUNKT = '#FFED00'
const NACHT = '#02173A'

const PAD = 30
const ZOOM_EASE = 'cubic-bezier(0.25, 1, 0.3, 1)'
const ZOOM_MS = 550

export default function BerlinSvgMap({
  punkte,
  staticBezirk,
}: {
  punkte: Punkt[]
  /** Rendert die Karte statisch auf diesen Bezirk gezoomt, ohne Interaktion. */
  staticBezirk?: string
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(staticBezirk ?? null)
  const [hoveredBezirk, setHoveredBezirk] = useState<string | null>(null)
  const [hoveredPunkt, setHoveredPunkt] = useState<number | null>(null)
  const [tip, setTip] = useState<null | { x: number; y: number; title: string; sub?: string }>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const interaktiv = !staticBezirk

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const proj = useMemo(
    () =>
      punkte.map((p) => {
        const [x, y] = projiziere(p.lng, p.lat)
        return { ...p, x, y }
      }),
    [punkte],
  )

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of punkte) m.set(p.bezirk, (m.get(p.bezirk) ?? 0) + 1)
    return m
  }, [punkte])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    const bekannt = new Set(BEZIRKE.map((b) => b.name))
    for (const p of punkte)
      if (!bekannt.has(p.bezirk))
        console.warn(`BerlinSvgMap: unbekannter Bezirk „${p.bezirk}" bei Projekt ${p.id} (${p.title})`)
  }, [punkte])

  useEffect(() => {
    if (!interaktiv || !selected) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [interaktiv, selected])

  // Zoom als CSS-Transform auf einer Gruppe: translate-dann-scale um (0,0),
  // damit keine transform-origin-Überraschungen auftreten. px == viewBox-Einheiten.
  const bz = selected ? BEZIRKE.find((b) => b.name === selected) : null
  const s = bz ? Math.min(MAP_W / (bz.bbox[2] + 2 * PAD), MAP_H / (bz.bbox[3] + 2 * PAD)) : 1
  const tx = bz ? MAP_W / 2 - s * (bz.bbox[0] + bz.bbox[2] / 2) : 0
  const ty = bz ? MAP_H / 2 - s * (bz.bbox[1] + bz.bbox[3] / 2) : 0

  const showTip = (p: Punkt, e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    setTip({ x: e.clientX - rect.left, y: e.clientY - rect.top, title: p.title, sub: p.sub })
  }

  const waehleBezirk = (name: string) => {
    setSelected(name)
    setTip(null)
    setHoveredPunkt(null)
  }

  return (
    <div ref={wrapRef} className="relative" style={{ WebkitTapHighlightColor: 'transparent' }}>
      {interaktiv && (
        <div className="mb-3 flex h-5 items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em]">
          <button
            type="button"
            onClick={() => setSelected(null)}
            disabled={!selected}
            className="cursor-pointer text-white/60 transition-colors enabled:hover:text-white disabled:cursor-default disabled:text-white"
          >
            Berlin
          </button>
          {selected ? (
            <>
              <span className="text-white/30">›</span>
              <span style={{ color: PUNKT }}>{selected}</span>
            </>
          ) : (
            <span className="font-semibold normal-case tracking-normal text-white/40">Bezirk antippen</span>
          )}
        </div>
      )}

      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="h-auto w-full"
        role={interaktiv ? undefined : 'img'}
        aria-label={interaktiv ? undefined : 'Karte der Berliner Bezirke mit dem Standort des Vorhabens'}
      >
        <g
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${s})`,
            transformOrigin: '0 0',
            transition:
              staticBezirk || reducedMotion ? 'none' : `transform ${ZOOM_MS}ms ${ZOOM_EASE}`,
          }}
        >
          {BEZIRKE.map((b) => {
            const istGewaehlt = selected === b.name
            const anklickbar = interaktiv && !istGewaehlt
            const n = counts.get(b.name) ?? 0
            return (
              <g
                key={b.name}
                role={anklickbar ? 'button' : undefined}
                tabIndex={anklickbar ? 0 : undefined}
                aria-label={anklickbar ? `${b.name} — ${n} ${n === 1 ? 'Projekt' : 'Projekte'}` : undefined}
                className={anklickbar ? 'cursor-pointer focus:outline-none' : undefined}
                onClick={anklickbar ? () => waehleBezirk(b.name) : undefined}
                onKeyDown={
                  anklickbar
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          waehleBezirk(b.name)
                        }
                      }
                    : undefined
                }
                onPointerEnter={anklickbar ? () => setHoveredBezirk(b.name) : undefined}
                onPointerLeave={anklickbar ? () => setHoveredBezirk(null) : undefined}
                onFocus={anklickbar ? () => setHoveredBezirk(b.name) : undefined}
                onBlur={anklickbar ? () => setHoveredBezirk(null) : undefined}
              >
                <path
                  d={b.d}
                  fill={hoveredBezirk === b.name && anklickbar ? 'rgba(255,255,255,0.12)' : FLAECHE}
                  fillOpacity={selected && !istGewaehlt ? 0.5 : 1}
                  stroke={GRENZE}
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  style={{ transition: 'fill 150ms, fill-opacity 300ms' }}
                />
              </g>
            )
          })}

          {/* Projektpunkte: dekorativ auf der Berlin-Ebene, interaktiv im gewählten Bezirk. */}
          {proj.map((p) => {
            if (p.x < -20 || p.y < -20 || p.x > MAP_W + 20 || p.y > MAP_H + 20) return null
            const aktiv = interaktiv && selected === p.bezirk && p.slug
            const r = aktiv ? (hoveredPunkt === p.id ? 20 : 16) / s : 5 / s
            const circle = (
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill={PUNKT}
                stroke={NACHT}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                style={{ transition: staticBezirk || reducedMotion ? undefined : `r ${ZOOM_MS}ms ${ZOOM_EASE}` }}
                pointerEvents="none"
              />
            )
            if (!aktiv) return <g key={p.id}>{circle}</g>

            const href = `/projekt/${p.slug}`
            const navigiere = () => router.navigate({ to: '/projekt/$slug', params: { slug: p.slug! } })
            return (
              <a
                key={p.id}
                href={href}
                aria-label={p.title}
                className="cursor-pointer focus:outline-none"
                onPointerDown={() => router.preloadRoute({ to: '/projekt/$slug', params: { slug: p.slug! } })}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
                  e.preventDefault()
                  navigiere()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    navigiere()
                  }
                }}
                onPointerEnter={(e) => {
                  setHoveredPunkt(p.id)
                  showTip(p, e)
                }}
                onPointerMove={(e) => showTip(p, e)}
                onPointerLeave={() => {
                  setHoveredPunkt(null)
                  setTip(null)
                }}
              >
                {/* Unsichtbare Tap-Fläche: 60 viewBox-Einheiten ≈ 40 px auf Handybreite. */}
                <circle cx={p.x} cy={p.y} r={60 / s} fill="transparent" pointerEvents="all" />
                {circle}
              </a>
            )
          })}
        </g>
      </svg>

      {tip && (
        <div
          className="pointer-events-none absolute z-10 max-w-[280px] -translate-x-1/2 -translate-y-full border-2 px-3 py-2"
          style={{ left: tip.x, top: tip.y - 14, backgroundColor: NACHT, borderColor: PUNKT }}
        >
          <div className="text-xs font-extrabold leading-snug text-white">{tip.title}</div>
          {tip.sub && (
            <div className="mt-0.5 text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: PUNKT }}>
              {tip.sub}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
