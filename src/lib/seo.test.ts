import { describe, expect, it } from 'vitest'
import { projektBeschreibung, projektJsonLd, sitemapEintraege, sitemapXml } from './seo'

const basis = {
  id: 11,
  title: 'Alte Schäferei: Neubau an Verkehrslösung gekoppelt',
  description: null,
  lat: 52.6,
  lng: 13.4,
  bezirk: 'Pankow',
  status: 'verzögert',
  unitCount: 2500,
  unitCountEstimate: null,
  unitCountEstimateMeta: null,
  blockers: JSON.stringify([
    { name: 'CDU', type: 'partei' },
    { name: 'Die Linke (gemeinsamer Rahmenplan-Beschluss VIII-1561)', type: 'partei' },
  ]),
  createdAt: new Date('2026-01-05T10:00:00Z'),
  updatedAt: new Date('2026-08-20T12:00:00Z'),
}

describe('projektBeschreibung', () => {
  it('nennt Zahl, Bezirk, Stand und die Parteien in einem Satz', () => {
    expect(projektBeschreibung(basis)).toBe(
      '2.500 Wohnungen in Pankow verzögert. Bremser: CDU, Linke. Belege und Quellen im Wohnungsbau-Tracker Berlin.',
    )
  })

  it('kennzeichnet Schätzungen und bleibt unter der Snippet-Grenze', () => {
    const text = projektBeschreibung({
      ...basis,
      unitCount: null,
      unitCountEstimate: 4700,
      blockers: JSON.stringify([
        { name: 'Bezirksamt Mitte mit sehr langem Zusatz zur Zuständigkeit', type: 'behörde' },
        { name: 'Eine Bürgerinitiative mit ebenfalls sehr langem Namen', type: 'bürgerinitiative' },
      ]),
    })
    expect(text.startsWith('Rund 4.700 Wohnungen in Pankow verzögert.')).toBe(true)
    expect(text).not.toContain('Bremser')
    expect(text.length).toBeLessThanOrEqual(155)
  })

  it('formuliert erledigte Vorhaben als fertig', () => {
    expect(projektBeschreibung({ ...basis, status: 'erledigt', blockers: null })).toBe(
      '2.500 Wohnungen in Pankow: nach Jahren Verzug endlich fertig. Belege und Quellen im Wohnungsbau-Tracker Berlin.',
    )
  })

  it('kommt ohne Wohnungszahl aus', () => {
    expect(projektBeschreibung({ ...basis, unitCount: null, blockers: null })).toBe(
      'Wohnungsbau in Pankow verzögert. Belege und Quellen im Wohnungsbau-Tracker Berlin.',
    )
  })
})

describe('projektJsonLd', () => {
  it('beschreibt den Ort mit Koordinaten, Bezirk und Wohnungszahl', () => {
    const ld = projektJsonLd(basis) as any
    expect(ld['@type']).toBe('Article')
    expect(ld.url).toBe('https://wohnungsbautracker.de/projekt/alte-schaeferei-neubau-an-verkehrsloesung-gekoppelt-11')
    expect(ld.about.geo).toEqual({ '@type': 'GeoCoordinates', latitude: 52.6, longitude: 13.4 })
    expect(ld.about.address.addressRegion).toBe('Pankow')
    expect(ld.about.additionalProperty[0].value).toBe(2500)
    expect(ld.keywords).toContain('CDU')
    expect(ld.dateModified).toBe('2026-08-20T12:00:00.000Z')
    expect(ld.mentions).toHaveLength(2)
  })
})

describe('sitemap', () => {
  it('listet Startseite, Projekte und Pflichtseiten mit Änderungsdatum', () => {
    const xml = sitemapXml(sitemapEintraege([basis, { ...basis, id: 12, title: 'Zweites & Drittes', updatedAt: null }]))
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<loc>https://wohnungsbautracker.de</loc>')
    expect(xml).toContain('<loc>https://wohnungsbautracker.de/projekt/alte-schaeferei-neubau-an-verkehrsloesung-gekoppelt-11</loc>')
    expect(xml).toContain('<loc>https://wohnungsbautracker.de/projekt/zweites-drittes-12</loc>')
    expect(xml).toContain('<loc>https://wohnungsbautracker.de/impressum</loc>')
    // Die Startseite trägt das jüngste Projektdatum; ein Projekt ohne Datum
    // bekommt kein lastmod.
    expect(xml.match(/<lastmod>2026-08-20<\/lastmod>/g)).toHaveLength(2)
    expect(xml).not.toContain('&')
  })
})
