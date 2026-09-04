// Suchmaschinen- und KI-Lesbarkeit: Beschreibungstexte, strukturierte Daten
// (JSON-LD) und die Sitemap. Reine Funktionen ohne Datenbankzugriff, damit sie
// in Route-Heads (Server und Client) und in der Sitemap-Route gleichermaßen
// laufen und sich ohne Server testen lassen.

import {
  countableUnits,
  fmt,
  projectSlug,
  splitParties,
  visibleBlockers,
  type TrackerProject,
} from './design-data'
import { SITE_URL, absolut } from './site'

export const SITE_NAME = 'Wohnungsbau-Tracker Berlin'
/** Wer die Seite herausgibt — steht so im Impressum. */
export const HERAUSGEBER = 'Junge Liberale Berlin'

const STATUS_TEXT: Record<string, string> = {
  blockiert: 'blockiert',
  'verzögert': 'verzögert',
  abgelehnt: 'abgelehnt',
}

/** Google kürzt Beschreibungen ab etwa 155–160 Zeichen; darüber verliert der
 *  Snippet den Schluss. Die Zahl ist die Obergrenze für den vollen Satz. */
const MAX_BESCHREIBUNG = 155

type Beschreibbar = Pick<
  TrackerProject,
  'title' | 'status' | 'bezirk' | 'unitCount' | 'unitCountEstimate' | 'unitCountEstimateMeta' | 'blockers'
>

/** Die Meta-Description einer Projektseite.
 *
 *  Vorher stand hier der Anfang des Fließtextes, hart nach 150 Zeichen
 *  abgeschnitten — im Suchergebnis las sich das wie ein abgerissener Satz.
 *  Jetzt sagt sie in einem Satz, was Zahl, Ort und Stand sind, und nennt die
 *  Bremser, wenn dafür noch Platz ist. Der Titel steht schon im <title>, deshalb
 *  wiederholt sie ihn nicht. */
export function projektBeschreibung(p: Beschreibbar): string {
  const we = countableUnits(p)
  const geschaetzt = !p.unitCount && we > 0
  const zahl = we > 0 ? `${geschaetzt ? 'Rund ' : ''}${fmt(we)} Wohnungen` : 'Wohnungsbau'

  const kern =
    p.status === 'erledigt'
      ? `${zahl} in ${p.bezirk}: nach Jahren Verzug endlich fertig.`
      : `${zahl} in ${p.bezirk} ${STATUS_TEXT[p.status] ?? p.status}.`

  const schluss = `Belege und Quellen im ${SITE_NAME}.`

  // Parteien zuerst — sie sind kanonisch und kurz. Sonst die ersten beiden
  // sichtbaren Blocker, deren Namen mitunter lang sind; dann entscheidet die
  // Länge, ob sie noch hineinpassen.
  const parteien = splitParties(p)
  const bremser = parteien.length
    ? parteien
    : visibleBlockers(p)
        .slice(0, 2)
        .map((b) => b.name)
  const mitBremsern = bremser.length ? `${kern} Bremser: ${bremser.join(', ')}. ${schluss}` : null

  if (mitBremsern && mitBremsern.length <= MAX_BESCHREIBUNG) return mitBremsern
  return `${kern} ${schluss}`
}

type Strukturierbar = Beschreibbar &
  Pick<TrackerProject, 'id' | 'lat' | 'lng' | 'description'> & {
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

function iso(d: Date | string | null | undefined): string | undefined {
  if (!d) return undefined
  const datum = d instanceof Date ? d : new Date(d)
  return Number.isNaN(datum.getTime()) ? undefined : datum.toISOString()
}

/** Die Organisation, die alle strukturierten Daten als Herausgeber nennen. */
function herausgeber() {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: HERAUSGEBER,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: absolut('/icon-512.png'), width: 512, height: 512 },
  }
}

/** JSON-LD der Startseite: WebSite plus Herausgeber. Suchmaschinen erkennen
 *  daran den Seitennamen; KI-Suchen ziehen daraus, wer hinter der Seite steht. */
export function seiteJsonLd(beschreibung: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: beschreibung,
        inLanguage: 'de',
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      herausgeber(),
    ],
  }
}

/** JSON-LD einer Projektseite: ein Artikel über einen Ort in Berlin, mit
 *  Koordinaten, Bezirk und den beteiligten Akteuren als Schlagwörtern. Das ist
 *  die Form, die Google für Rich Results liest und die KI-Suchen als
 *  Faktentabelle zitieren können, ohne den Fließtext deuten zu müssen. */
export function projektJsonLd(p: Strukturierbar) {
  const slug = projectSlug(p)
  const url = absolut(`/projekt/${slug}`)
  const we = countableUnits(p)
  const parteien = splitParties(p)
  const akteure = visibleBlockers(p).map((b) => b.name)

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': url,
    mainEntityOfPage: url,
    url,
    headline: p.title,
    description: projektBeschreibung(p),
    image: absolut(`/og/${slug}.png`),
    inLanguage: 'de',
    datePublished: iso(p.createdAt),
    dateModified: iso(p.updatedAt),
    author: { '@id': `${SITE_URL}/#organization` },
    publisher: herausgeber(),
    isPartOf: { '@id': `${SITE_URL}/#website` },
    articleSection: p.bezirk,
    keywords: ['Wohnungsbau Berlin', `Wohnungsbau ${p.bezirk}`, p.bezirk, p.status, ...parteien],
    about: {
      '@type': 'Place',
      name: p.title,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Berlin',
        addressRegion: p.bezirk,
        addressCountry: 'DE',
      },
      geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng },
      ...(we > 0
        ? { additionalProperty: [{ '@type': 'PropertyValue', name: 'Geplante Wohnungen', value: we }] }
        : {}),
    },
    ...(akteure.length ? { mentions: akteure.map((name) => ({ '@type': 'Organization', name })) } : {}),
  }
}

export type SitemapEintrag = { pfad: string; lastmod?: Date | string | null; priority?: number }

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Die Sitemap als XML. Jeder Eintrag wird zur absoluten Adresse; lastmod nur,
 *  wenn ein Datum da ist — ein erfundenes würde Crawler zu unnötigen
 *  Neubesuchen verleiten. */
export function sitemapXml(eintraege: SitemapEintrag[]): string {
  const urls = eintraege.map((e) => {
    const lastmod = iso(e.lastmod)
    return [
      '  <url>',
      // Die Startseite ohne Schrägstrich am Ende — so steht sie auch im
      // canonical-Link, und Crawler sollen nicht zwei Adressen kennen.
      `    <loc>${xmlEscape(e.pfad === '/' ? SITE_URL : absolut(e.pfad))}</loc>`,
      lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : null,
      e.priority !== undefined ? `    <priority>${e.priority.toFixed(1)}</priority>` : null,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n')
  })
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}

/** Die Einträge der Sitemap aus der Projektliste: Startseite, jedes Projekt,
 *  dann die Pflichtseiten. Die Startseite trägt das jüngste Änderungsdatum
 *  aller Projekte, weil sie deren Zahlen zeigt. */
export function sitemapEintraege(
  projekte: Array<Pick<TrackerProject, 'id' | 'title'> & { updatedAt?: Date | string | null }>,
): SitemapEintrag[] {
  const zeiten = projekte
    .map((p) => (p.updatedAt ? new Date(p.updatedAt).getTime() : NaN))
    .filter((t) => !Number.isNaN(t))
  const juengste = zeiten.length ? new Date(Math.max(...zeiten)) : null

  return [
    { pfad: '/', lastmod: juengste, priority: 1.0 },
    ...projekte.map((p) => ({ pfad: `/projekt/${projectSlug(p)}`, lastmod: p.updatedAt, priority: 0.8 })),
    { pfad: '/impressum', priority: 0.2 },
    { pfad: '/datenschutz', priority: 0.2 },
    { pfad: '/lizenzen', priority: 0.1 },
  ]
}
