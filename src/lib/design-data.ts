// Shared derived-metric helpers für Startseite, Projektseiten und Admin.

export type TrackerProject = {
  id: number
  title: string
  description: string | null
  lat: number
  lng: number
  /** @deprecated Tote Spalte — Parteien kommen aus splitParties (blockers). */
  party?: string | null
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
  hidden?: boolean | null
  politicalResponsibility?: string | null
  politicalResponsibilityMeta?: string | null
  /** Bei status 'erledigt': wie lange es gedauert hat und was am Ende herauskam. */
  resolution?: string | null
}

/** Die Spalten, aus denen sich Listen, Karte und alle Kennzahlen berechnen —
 *  und mehr lädt die Startseite auch nicht.
 *
 *  Vorher zog sie über `select()` jede Spalte: allein
 *  politicalResponsibilityMeta (die Belege) sind über alle Projekte 415 KB, die
 *  Beschreibungen weitere 149 KB. Beides wird auf der Startseite nirgends
 *  gerendert, landete aber in jedem SSR-Durchlauf im Hydrations-Payload — 660
 *  der 759 KB ausgelieferten HTML waren dieser eine Datensatz. Die Belege
 *  gehören auf die Projektseite, die sie über ihren eigenen Loader holt.
 *
 *  Ein volles `TrackerProject` ist hierauf zuweisbar; die Helfer unten nehmen
 *  deshalb beide Formen entgegen. */
export type TrackerListProject = Pick<
  TrackerProject,
  | 'id'
  | 'title'
  | 'lat'
  | 'lng'
  | 'bezirk'
  | 'status'
  | 'unitCount'
  | 'unitCountEstimate'
  | 'unitCountEstimateMeta'
  | 'blockers'
>

/** Spaltennamen aus TrackerListProject — damit die Query in projects.ts und
 *  dieser Typ nicht auseinanderlaufen können. */
export const LIST_COLUMNS = [
  'id',
  'title',
  'lat',
  'lng',
  'bezirk',
  'status',
  'unitCount',
  'unitCountEstimate',
  'unitCountEstimateMeta',
  'blockers',
] as const satisfies ReadonlyArray<keyof TrackerListProject>

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

export function parseEstimateMeta(p: Pick<TrackerProject, 'unitCountEstimateMeta'>): EstimateMeta | null {
  if (!p.unitCountEstimateMeta) return null
  try {
    return JSON.parse(p.unitCountEstimateMeta)
  } catch {
    return null
  }
}

/** Summe der recherchierten Schätzungen für Projekte OHNE bestätigte WE-Zahl.
 *  Einträge, die dasselbe Bauvorhaben doppelt beschreiben (doppelt_mit), zählen nur einmal. */
export function estimatedUnits(projects: TrackerListProject[]): number {
  return projects.reduce((sum, p) => {
    if (p.unitCount) return sum
    if (parseEstimateMeta(p)?.doppelt_mit) return sum
    return sum + (p.unitCountEstimate || 0)
  }, 0)
}

/** Wie stark Politik oder Verwaltung an der Blockade beteiligt sind — Ergebnis
 *  der Belegprüfung. Projekte mit 'keine' sind ausgeblendet (hidden). */
export type PoliticalResponsibility = 'hauptursache' | 'mitursaechlich' | 'keine'

/** Ein Snapshot der Quelle in einem Webarchiv. Quellen verschwinden: Fraktionen
 *  räumen ihre Seiten auf, Ratsinformationssysteme werden migriert. Ohne Archiv
 *  ist ein Beleg nur so lange gültig, wie der Herausgeber ihn stehen lässt. */
export type Archiv = {
  url: string
  /** Datum des Snapshots (ISO), nicht des Abrufs. */
  stand?: string | null
}

/** Ein amtliches Dokument hinter einem Beleg — bei der BVV eine Drucksache.
 *
 *  `pdf` ist die selbst hinterlegte Kopie unter /public, und das ist keine
 *  Bequemlichkeit: auf die Dokumentadressen in ALLRIS kann man von außen nicht
 *  zeigen. `do027.asp?DOLFDNR=…` liefert das PDF nur, wenn dieselbe Session
 *  vorher die Vorgangsseite geladen hat — kalt angeklickt kommt „Keine
 *  Information verfügbar"; die Anlagen hängen zusätzlich an
 *  sessiongebundenen Wegwerf-Pfaden. `quelle` (die Vorgangsseite) funktioniert
 *  dagegen von außen. `ergebnis` nennt, was aus der Drucksache geworden ist —
 *  ein zurückgezogener Antrag belegt einen Blockadeversuch, keine Blockade. */
export type Belegdokument = {
  /** Drucksachennummer, z. B. 'VIII-0299'. */
  nummer?: string | null
  titel: string
  /** Beschlusslage im Wortlaut des Systems, z. B. 'in der BVV abgelehnt'. */
  ergebnis?: string | null
  datum?: string | null
  /** Pfad der hier hinterlegten Kopie, z. B. '/belege/bvv-pankow/…pdf'. */
  pdf?: string | null
  /** Die Vorgangsseite im Ratsinformationssystem, mit Beratungsfolge. */
  quelle?: string | null
  archiv?: Archiv | null
}

/** Ein einzelner Beleg. `belegstaerke` trennt das Verbindliche vom Beiläufigen:
 *  'stark' = Beschluss oder Verwaltungsakt, 'mittel' = Pressemitteilung oder
 *  Zitat, 'schwach' = bloße Anfrage oder Einzelmeinung. */
export type Beleg = {
  akteur: string
  typ: string
  ebene?: string | null
  datum?: string | null
  art?: string | null
  aussage: string
  url: string
  titel?: string | null
  belegstaerke?: 'stark' | 'mittel' | 'schwach' | null
  /** Wohin der Beleg zielt. 'unterstuetzt' heißt: Dieser Akteur will, dass gebaut
   *  wird — solche Belege dürfen nicht als Nachweis einer Blockade gelesen werden. */
  richtung?: 'blockiert' | 'unterstuetzt' | 'neutral' | null
  /** Snapshot der unter `url` verlinkten Seite. */
  archiv?: Archiv | null
  /** Die amtlichen Dokumente, auf denen der Beleg beruht. Sie ersetzen die
   *  Sammelverweise auf Suchmasken, die kein Mensch nachvollziehen kann. */
  dokumente?: Belegdokument[] | null
}

export type ResponsibilityMeta = {
  bewertung: PoliticalResponsibility | null
  fazit: string | null
  stand?: string
  dublette_von?: number | null
  funde: Beleg[]
}

export const RESPONSIBILITY_LABEL: Record<PoliticalResponsibility, string> = {
  hauptursache: 'Politik/Verwaltung ist die Hauptursache',
  mitursaechlich: 'Politik/Verwaltung ist mitursächlich',
  keine: 'keine politische Ursache belegbar',
}

export function parseResponsibilityMeta(p: TrackerProject): ResponsibilityMeta | null {
  if (!p.politicalResponsibilityMeta) return null
  try {
    const parsed = JSON.parse(p.politicalResponsibilityMeta)
    return { ...parsed, funde: Array.isArray(parsed?.funde) ? parsed.funde : [] }
  } catch {
    return null
  }
}

/** Belege eines Projekts — in der gespeicherten Reihenfolge. Die ist maßgeblich,
 *  weil die [n]-Marken im Projekttext genau darauf zeigen: Position i im Array
 *  ist Fußnote i+1. Früher wurde hier nach Richtung und Stärke umsortiert, was
 *  die Nummerierung gegenüber dem Text verschob. Gegenpositionen sind jetzt am
 *  Badge „fordert Bau" erkennbar statt an ihrer Position. */
export function belege(p: TrackerProject): Beleg[] {
  return parseResponsibilityMeta(p)?.funde ?? []
}

/** Akteure, die sich belegbar FÜR das Vorhaben ausgesprochen haben. */
export function befuerworter(p: TrackerProject): Beleg[] {
  return belege(p).filter((f) => f.richtung === 'unterstuetzt')
}

/** Ein Textstück: entweder Fließtext oder eine Fußnotenmarke. */
export type TextTeil = { text: string } | { note: number }

/** Zerlegt einen Projekttext an den [n]-Marken, damit sie als hochgestellte
 *  Verweise gerendert werden können. Marken, für die es keinen Beleg gibt,
 *  bleiben als normaler Text stehen statt ins Leere zu verweisen. */
export function zerlegeMitFussnoten(text: string, anzahlBelege: number): TextTeil[] {
  const teile: TextTeil[] = []
  let rest = text
  const marke = /\[(\d{1,2})\]/
  for (;;) {
    const m = rest.match(marke)
    if (!m || m.index === undefined) break
    const n = Number(m[1])
    if (m.index > 0) teile.push({ text: rest.slice(0, m.index) })
    if (n >= 1 && n <= anzahlBelege) teile.push({ note: n })
    else teile.push({ text: m[0] })
    rest = rest.slice(m.index + m[0].length)
  }
  if (rest) teile.push({ text: rest })
  return teile
}

/** Quellen, die im Belegapparat noch nicht vorkommen — sie hängen unnummeriert
 *  hinten an, damit kein Link doppelt erscheint. */
export function weitereQuellen(p: TrackerProject): PressUrl[] {
  const schon = new Set(belege(p).map((f) => (f.url ?? '').replace(/\/$/, '')))
  const alle = [...parsePressUrls(p)]
  if (p.sourceUrl) alle.unshift({ title: 'Drucksache', url: p.sourceUrl })
  const gesehen = new Set<string>()
  return alle.filter((q) => {
    const u = (q.url ?? '').replace(/\/$/, '')
    if (!u || schon.has(u) || gesehen.has(u)) return false
    gesehen.add(u)
    return true
  })
}

/** `partei` an Nicht-Partei-Blockern: belegte Parteiführung des Akteurs
 *  (z.B. Bezirksamt unter CDU-Stadtrat), ggf. kommagetrennt („CDU,SPD"). */
export type Blocker = { name: string; type: string; partei?: string | null }
export type PressUrl = { title: string; url: string }

const PARTEI_MUSTER: Array<[RegExp, string]> = [
  [/grün/i, 'Grüne'],
  [/link/i, 'Linke'],
  [/spd/i, 'SPD'],
  [/cdu/i, 'CDU'],
  [/fdp/i, 'FDP'],
  [/bsw/i, 'BSW'],
  [/afd/i, 'AfD'],
]

/** Alle kanonischen Parteien, die in einem Text vorkommen — Blocker-Namen
 *  dürfen Fraktions- und Gremienzusätze tragen („Linksfraktion BVV Pankow"),
 *  und ein gemeinsamer Beschluss („BVV-Mehrheit CDU und Grüne") zählt für beide. */
export function kanonischeParteien(text: string): string[] {
  return PARTEI_MUSTER.filter(([muster]) => muster.test(text)).map(([, partei]) => partei)
}

/** Parteien eines Projekts, abgeleitet aus den sichtbaren Blockern: aus den
 *  Namen der partei-Blocker plus den partei-Tags der übrigen Blocker. Die
 *  party-Spalte wird bewusst nicht mehr gelesen — jede Partei in der Bilanz
 *  hat damit einen anzeigbaren Blocker auf der Projektseite. */
export function splitParties(p: Pick<TrackerProject, 'blockers'>): string[] {
  const parteien: string[] = []
  visibleBlockers(p).forEach((b) => {
    const quelle = b.type === 'partei' ? b.name : b.partei ?? ''
    kanonischeParteien(quelle).forEach((partei) => {
      if (!parteien.includes(partei)) parteien.push(partei)
    })
  })
  return parteien
}

export function parseBlockers(p: Pick<TrackerProject, 'blockers'>): Blocker[] {
  if (!p.blockers) return []
  try {
    const parsed = typeof p.blockers === 'string' ? JSON.parse(p.blockers) : p.blockers
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Blocker-Typen, die nicht als „Akteure" angezeigt werden. Gerichte wenden nur
 *  das Gesetz an — sie werden aus den Verhinderer-Listen und dem Ticker gefiltert. */
export const HIDDEN_BLOCKER_TYPES = new Set(['gericht'])

/** Blocker eines Projekts ohne die ausgeblendeten Typen (z.B. Gerichte). */
export function visibleBlockers(p: Pick<TrackerProject, 'blockers'>): Blocker[] {
  return parseBlockers(p).filter((b) => !HIDDEN_BLOCKER_TYPES.has(b.type))
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

export function totalUnits(projects: Pick<TrackerProject, 'unitCount'>[]): number {
  return projects.reduce((sum, p) => sum + (p.unitCount || 0), 0)
}

/** Vorhaben, die noch offen sind. Fertiggestellte bleiben im Tracker sichtbar —
 *  ihr Verzug ist die Aussage —, dürfen aber nicht zu den blockierten Wohnungen
 *  gezählt oder einer Partei als laufende Blockade angelastet werden. */
export function offeneProjekte<T extends Pick<TrackerProject, 'status'>>(projects: T[]): T[] {
  return projects.filter((p) => p.status !== 'erledigt')
}

export function erledigteProjekte<T extends Pick<TrackerProject, 'status'>>(projects: T[]): T[] {
  return projects.filter((p) => p.status === 'erledigt')
}

export type PartyRank = { party: string; projects: number; units: number }

export function partyRanking(projects: Pick<TrackerProject, 'blockers' | 'unitCount'>[]): PartyRank[] {
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

/** Zählbare WE eines Projekts: belegte Zahl, sonst quellengeprüfte Schätzung.
 *  Doppelt erfasste Vorhaben (doppelt_mit) zählen 0, damit Summen nicht doppelt zählen. */
export function countableUnits(
  p: Pick<TrackerProject, 'unitCount' | 'unitCountEstimate' | 'unitCountEstimateMeta'>,
): number {
  if (p.unitCount) return p.unitCount
  if (parseEstimateMeta(p)?.doppelt_mit) return 0
  return p.unitCountEstimate || 0
}

/** WE-Zahl für die Anzeige-Reihenfolge: belegte Zahl, sonst Schätzung — anders als
 *  countableUnits auch bei doppelt erfassten Vorhaben, denn die Karte zeigt ihre
 *  Zahl ja an und soll deshalb an der passenden Stelle einsortiert werden. */
export function sortableUnits(p: Pick<TrackerProject, 'unitCount' | 'unitCountEstimate'>): number {
  return p.unitCount || p.unitCountEstimate || 0
}

export type StatusBreakdown = { status: string; count: number; units: number }

export function statusBreakdown(
  projects: TrackerListProject[],
  includeEstimates = false,
): StatusBreakdown[] {
  const order = ['blockiert', 'verzögert', 'abgelehnt', 'erledigt']
  const map: Record<string, StatusBreakdown> = {}
  projects.forEach((p) => {
    if (!map[p.status]) map[p.status] = { status: p.status, count: 0, units: 0 }
    map[p.status].count += 1
    map[p.status].units += includeEstimates ? countableUnits(p) : p.unitCount || 0
  })
  return order.filter((s) => map[s]).map((s) => map[s])
}

/** Unique non-party blocker names, most useful for tickers/lists.
 *  Ausgeblendete Typen (Gerichte) werden nicht aufgeführt. */
export function uniqueBlockerNames(
  projects: Pick<TrackerProject, 'blockers'>[],
  excludeParties = true,
): string[] {
  const seen = new Set<string>()
  projects.forEach((p) => {
    parseBlockers(p).forEach((b) => {
      if (excludeParties && b.type === 'partei') return
      if (HIDDEN_BLOCKER_TYPES.has(b.type)) return
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

// ---------------------------------------------------------------------------
// Kategorisierung nach Blockade-Ursache
// ---------------------------------------------------------------------------
// Ordnet jedes Projekt einer Hauptursache zu — abgeleitet aus den Blocker-Typen.
// Zweck: filterbar machen, um zu zeigen, welcher Anteil administrativ/politisch
// blockiert ist (Kernbotschaft) gegenüber Markt-/Insolvenzfällen, Umwelt usw.

export type ProjectCategory = 'verwaltung' | 'buerger' | 'umwelt' | 'insolvenz' | 'sonstige'

export const CATEGORY_ORDER: ProjectCategory[] = [
  'verwaltung',
  'insolvenz',
  'umwelt',
  'buerger',
  'sonstige',
]

export const CATEGORY_META: Record<ProjectCategory, { label: string; kurz: string; color: string }> = {
  verwaltung: { label: 'Verwaltung & Politik', kurz: 'Verwaltung', color: '#0B2B6B' },
  insolvenz: { label: 'Insolvenz & Markt', kurz: 'Insolvenz', color: '#C08A00' },
  umwelt: { label: 'Umwelt & Artenschutz', kurz: 'Umwelt', color: '#46962B' },
  buerger: { label: 'Bürgerprotest', kurz: 'Bürger', color: '#1CB5E5' },
  sonstige: { label: 'Sonstiges', kurz: 'Sonstiges', color: '#7A8699' },
}

/** Hauptursache der Blockade — Priorität: Insolvenz/Markt > Verwaltung/Politik >
 *  Umwelt > Bürgerprotest > Sonstiges. Gerichte fließen bewusst nicht ein. */
export function projectCategory(p: TrackerProject): ProjectCategory {
  const types = new Set(parseBlockers(p).map((b) => b.type))
  if (types.has('investor')) return 'insolvenz'
  if (types.has('behörde') || types.has('partei')) return 'verwaltung'
  if (types.has('umwelt')) return 'umwelt'
  if (types.has('bürgerinitiative')) return 'buerger'
  return 'sonstige'
}
