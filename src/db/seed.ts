import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { bvvParties, constructionStats, blockedProjects } from './schema'

const client = createClient({ url: 'file:./sqlite.db' })
const db = drizzle(client)

async function seed() {
  console.log('Seeding BVV parties...')
  await db.insert(bvvParties).values([
    { bezirk: 'Charlottenburg-Wilmersdorf', rulingParty: 'CDU', coalitionParties: 'CDU,Grüne' },
    { bezirk: 'Friedrichshain-Kreuzberg', rulingParty: 'Grüne', coalitionParties: 'Grüne,Linke,SPD' },
    { bezirk: 'Lichtenberg', rulingParty: 'Linke', coalitionParties: 'Linke,SPD' },
    { bezirk: 'Marzahn-Hellersdorf', rulingParty: 'CDU', coalitionParties: 'CDU,SPD' },
    { bezirk: 'Mitte', rulingParty: 'SPD', coalitionParties: 'SPD,Grüne' },
    { bezirk: 'Neukölln', rulingParty: 'SPD', coalitionParties: 'SPD,CDU' },
    { bezirk: 'Pankow', rulingParty: 'SPD', coalitionParties: 'SPD,Grüne,Linke' },
    { bezirk: 'Reinickendorf', rulingParty: 'CDU', coalitionParties: 'CDU,SPD' },
    { bezirk: 'Spandau', rulingParty: 'CDU', coalitionParties: 'CDU,SPD' },
    { bezirk: 'Steglitz-Zehlendorf', rulingParty: 'CDU', coalitionParties: 'CDU,Grüne' },
    { bezirk: 'Tempelhof-Schöneberg', rulingParty: 'SPD', coalitionParties: 'SPD,Grüne' },
    { bezirk: 'Treptow-Köpenick', rulingParty: 'SPD', coalitionParties: 'SPD,Linke,Grüne' },
  ])

  console.log('Seeding construction stats...')
  await db.insert(constructionStats).values([
    { bezirk: 'Charlottenburg-Wilmersdorf', year: 2024, approvedCount: 980, completedCount: 620 },
    { bezirk: 'Friedrichshain-Kreuzberg', year: 2024, approvedCount: 450, completedCount: 280 },
    { bezirk: 'Lichtenberg', year: 2024, approvedCount: 1200, completedCount: 890 },
    { bezirk: 'Marzahn-Hellersdorf', year: 2024, approvedCount: 1500, completedCount: 1100 },
    { bezirk: 'Mitte', year: 2024, approvedCount: 1100, completedCount: 750 },
    { bezirk: 'Neukölln', year: 2024, approvedCount: 680, completedCount: 420 },
    { bezirk: 'Pankow', year: 2024, approvedCount: 1800, completedCount: 1300 },
    { bezirk: 'Reinickendorf', year: 2024, approvedCount: 520, completedCount: 380 },
    { bezirk: 'Spandau', year: 2024, approvedCount: 750, completedCount: 490 },
    { bezirk: 'Steglitz-Zehlendorf', year: 2024, approvedCount: 620, completedCount: 410 },
    { bezirk: 'Tempelhof-Schöneberg', year: 2024, approvedCount: 890, completedCount: 580 },
    { bezirk: 'Treptow-Köpenick', year: 2024, approvedCount: 1350, completedCount: 950 },
  ])

  console.log('Seeding example blocked projects...')
  await db.insert(blockedProjects).values([
    {
      title: 'Wohnquartier am Tempelhofer Feld',
      description: 'Geplantes Wohnquartier mit 2.500 Wohnungen am Rande des Tempelhofer Feldes. Durch BVV-Beschluss blockiert.',
      lat: 52.4731,
      lng: 13.4017,
      party: 'Grüne',
      bezirk: 'Tempelhof-Schöneberg',
      status: 'blockiert',
      sourceUrl: '',
    },
    {
      title: 'Neubau Michelangelostraße',
      description: '450 Wohnungen in Prenzlauer Berg. Bebauungsplan seit 2 Jahren verzögert.',
      lat: 52.5537,
      lng: 13.4285,
      party: 'Linke',
      bezirk: 'Pankow',
      status: 'verzögert',
      sourceUrl: '',
    },
    {
      title: 'Bauvorhaben Kreuzberg Südost',
      description: '800 Wohnungen am Spreeufer. Durch Bürgerinitiative und BVV abgelehnt.',
      lat: 52.4965,
      lng: 13.4445,
      party: 'Grüne',
      bezirk: 'Friedrichshain-Kreuzberg',
      status: 'abgelehnt',
      sourceUrl: '',
    },
    {
      title: 'Wohnpark Spandauer Ufer',
      description: '1.200 Wohnungen an der Havel. Genehmigung durch BVV verzögert.',
      lat: 52.5355,
      lng: 13.2050,
      party: 'CDU',
      bezirk: 'Spandau',
      status: 'verzögert',
      sourceUrl: '',
    },
    {
      title: 'Stadtquartier Blankenburger Süden',
      description: '6.000 Wohnungen geplant. Massiver Widerstand im Bezirk Pankow.',
      lat: 52.5800,
      lng: 13.4500,
      party: 'SPD',
      bezirk: 'Pankow',
      status: 'blockiert',
      sourceUrl: '',
    },
  ])

  console.log('Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
