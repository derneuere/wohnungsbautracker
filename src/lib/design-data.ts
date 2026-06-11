// Shared derived-metric helpers for the /designs/* redesign routes.

export type TrackerProject = {
  id: number
  title: string
  description: string | null
  lat: number
  lng: number
  party: string
  bezirk: string
  status: string
  date: string | null
  unitCount: number | null
  unitCountEstimate?: number | null
  unitCountEstimateMeta?: string | null
  blockers: string | null
  sourceUrl: string | null
  pressUrls: string | null
  imageUrl: string | null
}

export type EstimateMeta = {
  basis: 'dokumentiert' | 'abgeleitet' | 'keine_wohnnutzung' | 'nicht_bezifferbar'
  spanne?: [number, number]
  quellen: Array<{ url: string; zitat: string }>
  confidence: 'hoch' | 'mittel' | 'niedrig'
  begruendung?: string
  verifiziert?: boolean
  stand?: string
  /** ID eines anderen Eintrags, der dasselbe Bauvorhaben beschreibt — wird in Summen nicht doppelt gezählt. */
  doppelt_mit?: number
}

export function parseEstimateMeta(p: TrackerProject): EstimateMeta | null {
  if (!p.unitCountEstimateMeta) return null
  try {
    return JSON.parse(p.unitCountEstimateMeta)
  } catch {
    return null
  }
}

/** Summe der recherchierten Schätzungen für Projekte OHNE bestätigte WE-Zahl.
 *  Einträge, die dasselbe Bauvorhaben doppelt beschreiben (doppelt_mit), zählen nur einmal. */
export function estimatedUnits(projects: TrackerProject[]): number {
  return projects.reduce((sum, p) => {
    if (p.unitCount) return sum
    if (parseEstimateMeta(p)?.doppelt_mit) return sum
    return sum + (p.unitCountEstimate || 0)
  }, 0)
}

export type Blocker = { name: string; type: string }
export type PressUrl = { title: string; url: string }

export function splitParties(p: TrackerProject): string[] {
  return p.party.split(',').map((s) => s.trim()).filter(Boolean)
}

export function parseBlockers(p: TrackerProject): Blocker[] {
  if (!p.blockers) return []
  try {
    const parsed = typeof p.blockers === 'string' ? JSON.parse(p.blockers) : p.blockers
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function parsePressUrls(p: TrackerProject): PressUrl[] {
  if (!p.pressUrls) return []
  try {
    const parsed = typeof p.pressUrls === 'string' ? JSON.parse(p.pressUrls) : p.pressUrls
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function totalUnits(projects: TrackerProject[]): number {
  return projects.reduce((sum, p) => sum + (p.unitCount || 0), 0)
}

export type PartyRank = { party: string; projects: number; units: number }

export function partyRanking(projects: TrackerProject[]): PartyRank[] {
  const map: Record<string, PartyRank> = {}
  projects.forEach((p) => {
    splitParties(p).forEach((party) => {
      if (!map[party]) map[party] = { party, projects: 0, units: 0 }
      map[party].projects += 1
      map[party].units += p.unitCount || 0
    })
  })
  return Object.values(map).sort((a, b) => b.units - a.units || b.projects - a.projects)
}

export type BezirkRank = { bezirk: string; projects: number; units: number }

export function bezirkRanking(projects: TrackerProject[]): BezirkRank[] {
  const map: Record<string, BezirkRank> = {}
  projects.forEach((p) => {
    if (!map[p.bezirk]) map[p.bezirk] = { bezirk: p.bezirk, projects: 0, units: 0 }
    map[p.bezirk].projects += 1
    map[p.bezirk].units += p.unitCount || 0
  })
  return Object.values(map).sort((a, b) => b.projects - a.projects || b.units - a.units)
}

/** Zählbare WE eines Projekts: belegte Zahl, sonst quellengeprüfte Schätzung.
 *  Doppelt erfasste Vorhaben (doppelt_mit) zählen 0, damit Summen nicht doppelt zählen. */
export function countableUnits(p: TrackerProject): number {
  if (p.unitCount) return p.unitCount
  if (parseEstimateMeta(p)?.doppelt_mit) return 0
  return p.unitCountEstimate || 0
}

export type StatusBreakdown = { status: string; count: number; units: number }

export function statusBreakdown(projects: TrackerProject[], includeEstimates = false): StatusBreakdown[] {
  const order = ['blockiert', 'verzögert', 'abgelehnt']
  const map: Record<string, StatusBreakdown> = {}
  projects.forEach((p) => {
    if (!map[p.status]) map[p.status] = { status: p.status, count: 0, units: 0 }
    map[p.status].count += 1
    map[p.status].units += includeEstimates ? countableUnits(p) : p.unitCount || 0
  })
  return order.filter((s) => map[s]).map((s) => map[s])
}

export function blockerTypeCounts(projects: TrackerProject[]): Array<{ type: string; count: number }> {
  const map: Record<string, number> = {}
  projects.forEach((p) => {
    parseBlockers(p).forEach((b) => {
      map[b.type] = (map[b.type] || 0) + 1
    })
  })
  return Object.entries(map)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
}

/** Unique non-party blocker names, most useful for tickers/lists. */
export function uniqueBlockerNames(projects: TrackerProject[], excludeParties = true): string[] {
  const seen = new Set<string>()
  projects.forEach((p) => {
    parseBlockers(p).forEach((b) => {
      if (excludeParties && b.type === 'partei') return
      seen.add(b.name)
    })
  })
  return [...seen]
}

export function fmt(n: number): string {
  return n.toLocaleString('de-DE')
}

export type StatRow = {
  id: number
  bezirk: string
  year: number
  approvedCount: number
  completedCount: number
}

export type YearTotals = { year: number; approved: number; completed: number }

/**
 * Berlinweite Jahresreihe, aufsteigend nach Jahr.
 * Für Jahre mit einer „Berlin"-Gesamtzeile gilt diese; sonst die Summe der Bezirkszeilen.
 */
export function cityYearSeries(stats: StatRow[]): YearTotals[] {
  const byYear = new Map<number, { city: StatRow | null; approved: number; completed: number }>()
  stats.forEach((s) => {
    const entry = byYear.get(s.year) || { city: null, approved: 0, completed: 0 }
    if (s.bezirk === 'Berlin') {
      entry.city = s
    } else {
      entry.approved += s.approvedCount
      entry.completed += s.completedCount
    }
    byYear.set(s.year, entry)
  })
  return [...byYear.entries()]
    .map(([year, e]) => ({
      year,
      approved: e.city ? e.city.approvedCount : e.approved,
      completed: e.city ? e.city.completedCount : e.completed,
    }))
    .sort((a, b) => a.year - b.year)
}

/** Summen des neuesten Jahres — robust gegen historische Mehrjahres-Daten. */
export function latestYearTotals(stats: StatRow[]): YearTotals {
  const series = cityYearSeries(stats)
  return series[series.length - 1] || { year: new Date().getFullYear(), approved: 0, completed: 0 }
}

/** SEO-Slug für Projekt-Detailseiten: kebab-case-Titel + ID, z.B. "wasserstadt-oberhavel-12". Die ID am Ende ist maßgeblich. */
export function projectSlug(p: { id: number; title: string }): string {
  const base = p.title
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
  return `${base}-${p.id}`
}

/** Liest die Projekt-ID aus einem Slug ("...-12" → 12). */
export function idFromSlug(slug: string): number {
  return Number(slug.split('-').pop())
}
