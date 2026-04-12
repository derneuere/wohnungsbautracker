import { useEffect, useRef, useState } from 'react'
import { PARTY_COLORS } from '../lib/parties'
import type { InferSelectModel } from 'drizzle-orm'
import type { blockedProjects } from '../db/schema'

type Project = InferSelectModel<typeof blockedProjects>

interface MapViewProps {
  projects: Project[]
  bezirkPartyMap: Record<string, string>
}

export default function MapView({ projects, bezirkPartyMap }: MapViewProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [leaflet, setLeaflet] = useState<any>(null)
  const geoLayerRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    let map: any

    import('leaflet').then((L) => {
      const lib = L.default
      if (!mapRef.current) return

      map = lib.map(mapRef.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
      }).setView([52.52, 13.405], 10)

      lib.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map)

      lib.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        pane: 'overlayPane',
      }).addTo(map)

      setLeaflet(lib)
      setMapInstance(map)
    })

    return () => {
      if (map) map.remove()
    }
  }, [])

  useEffect(() => {
    if (!mapInstance || !leaflet) return

    fetch('/berlin-bezirke.geojson')
      .then((r) => r.json())
      .then((geojson) => {
        if (geoLayerRef.current) {
          mapInstance.removeLayer(geoLayerRef.current)
        }

        geoLayerRef.current = leaflet.geoJSON(geojson, {
          style: (feature: any) => {
            const bezirkName = feature.properties.name
            const party = bezirkPartyMap[bezirkName]
            const color = party ? PARTY_COLORS[party] || '#999' : '#999'
            return {
              fillColor: color,
              fillOpacity: 0.08,
              color: '#888',
              weight: 1.5,
              opacity: 0.5,
            }
          },
          interactive: false,
        }).addTo(mapInstance)
      })
  }, [mapInstance, leaflet, bezirkPartyMap])

  useEffect(() => {
    if (!mapInstance || !leaflet) return

    markersRef.current.forEach((m) => mapInstance.removeLayer(m))
    markersRef.current = []

    projects.forEach((project) => {
      const firstParty = project.party.split(',')[0].trim()
      const marker = leaflet.circleMarker([project.lat, project.lng], {
        radius: 8,
        color: '#fff',
        weight: 2,
        fillColor: PARTY_COLORS[firstParty] || '#999',
        fillOpacity: 0.9,
        bubblingMouseEvents: false,
      }).addTo(mapInstance)

      marker.bindTooltip(project.title, {
        direction: 'top',
        offset: [0, -10],
        className: 'bezirk-tooltip',
      })

      marker.on('click', () => {
        setSelectedProject(project)
      })

      marker.on('mouseover', () => {
        mapRef.current!.style.cursor = 'pointer'
      })
      marker.on('mouseout', () => {
        mapRef.current!.style.cursor = ''
      })

      markersRef.current.push(marker)
    })
  }, [mapInstance, leaflet, projects])

  const statusColor: Record<string, string> = {
    blockiert: '#DC2626',
    'verzögert': '#F59E0B',
    abgelehnt: '#6B7280',
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />

      {selectedProject && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] mx-auto max-w-md rounded-lg border border-[var(--color-border)] bg-white p-4 shadow-lg">
          <button
            onClick={() => setSelectedProject(null)}
            className="absolute right-3 top-3 text-lg leading-none text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            &times;
          </button>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex flex-shrink-0 gap-0.5">
              {selectedProject.party.split(',').map((party: string, i: number) => (
                <span key={i} className="inline-block h-4 w-4 rounded-full" style={{ backgroundColor: PARTY_COLORS[party.trim()] || '#999' }} />
              ))}
            </div>
            <div className="min-w-0 flex-1 pr-4">
              <h3 className="text-sm font-bold leading-snug">
                {selectedProject.title}
                {selectedProject.unitCount && <span className="ml-1 text-xs font-medium text-[var(--color-berlin-red)]">{selectedProject.unitCount.toLocaleString('de-DE')} WE</span>}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="inline-block rounded px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: statusColor[selectedProject.status] || '#999' }}
                >
                  {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {selectedProject.party.split(',').join(', ')} &middot; {selectedProject.bezirk}
                  {selectedProject.date && <> &middot; {selectedProject.date}</>}
                </span>
              </div>
              {selectedProject.description && (
                <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-muted)]">
                  {selectedProject.description}
                </p>
              )}
              {selectedProject.blockers && (() => {
                try {
                  const blockers = typeof selectedProject.blockers === 'string' ? JSON.parse(selectedProject.blockers) : selectedProject.blockers
                  if (!Array.isArray(blockers)) return null
                  const typeColors: Record<string, string> = {
                    partei: '#BE2837', 'bürgerinitiative': '#F59E0B', 'behörde': '#3B82F6',
                    gericht: '#8B5CF6', umwelt: '#10B981', investor: '#111',
                  }
                  return (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {blockers.map((b: any, i: number) => (
                        <span key={i} className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: (typeColors[b.type] || '#999') + '1a', color: typeColors[b.type] || '#999' }}>
                          {b.name}
                        </span>
                      ))}
                    </div>
                  )
                } catch { return null }
              })()}
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {selectedProject.sourceUrl && (
                  <a href={selectedProject.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[var(--color-berlin-red)] no-underline hover:underline">
                    Drucksache &rarr;
                  </a>
                )}
                {(() => {
                  try {
                    const urls = typeof selectedProject.pressUrls === 'string' ? JSON.parse(selectedProject.pressUrls) : selectedProject.pressUrls
                    if (!Array.isArray(urls)) return null
                    return urls.slice(0, 2).map((link: any, i: number) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-text-muted)] no-underline hover:underline">
                        {link.title.split(':')[0]} &rarr;
                      </a>
                    ))
                  } catch { return null }
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
