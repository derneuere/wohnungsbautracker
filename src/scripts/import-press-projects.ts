import { createClient } from "@libsql/client";
const client = createClient({ url: "file:./sqlite.db" });

const now = Math.floor(Date.now() / 1000);

const projects = [
  // === Pankow ===
  {
    title: "Pankower Tor — 2.000 Wohnungen seit 20 Jahren verzögert",
    description:
      'Auf dem ehemaligen Güterbahnhof Pankow sollen 2.000 Wohnungen entstehen. Nach fast zwei Jahrzehnten Verhandlungen wurden erst im März 2025 die städtebaulichen Verträge unterzeichnet. Baubeginn frühestens 2027.',
    lat: 52.5672,
    lng: 13.4115,
    party: "SPD",
    bezirk: "Pankow",
    status: "verzögert",
    date: "25.03.2025",
    pressUrls: JSON.stringify([
      { title: "Entwicklungsstadt: Pankower Tor im Stillstand", url: "https://www.entwicklungsstadt.de/wohnprojekt-pankower-tor-im-stillstand-2027-als-fruehester-termin-realistisch/" },
      { title: "Entwicklungsstadt: Einigung nach zwei Jahrzehnten", url: "https://entwicklungsstadt.de/nach-fast-zwei-jahrzehnten-einigung-beim-projekt-pankower-tor/" },
    ]),
  },
  {
    title: "Elisabeth-Aue — 5.000 Wohnungen gegen Anwohnerprotest",
    description:
      'Auf 70 Hektar in Blankenfelde sollen 5.000 Wohnungen entstehen. Massiver Widerstand der Anwohner, die ein "zweites Märkisches Viertel" befürchten. Baubeginn der ersten Einheiten für 2026 geplant.',
    lat: 52.6100,
    lng: 13.4050,
    party: "Grüne",
    bezirk: "Pankow",
    status: "verzögert",
    date: "01.01.2024",
    pressUrls: JSON.stringify([
      { title: "Entwicklungsstadt: 5.000 Wohnungen auf Elisabeth-Aue", url: "https://www.entwicklungsstadt.de/5-000-wohnungen-auf-elisabeth-aue-weiteres-grossprojekt-in-pankow/" },
    ]),
  },
  // === Lichtenberg ===
  {
    title: "Ilsekiez Karlshorst — HOWOGE-Neubau gerichtlich gestoppt",
    description:
      "237 Wohnungen der HOWOGE im Ilsekiez Karlshorst. Verwaltungsgericht hat Bau gestoppt — BUND klagt wegen Artenschutz (Haussperlinge, Zwergfledermäuse). Ca. 100 Bäume müssten gefällt werden.",
    lat: 52.4780,
    lng: 13.5250,
    party: "Grüne",
    bezirk: "Lichtenberg",
    status: "blockiert",
    date: "01.01.2025",
    pressUrls: JSON.stringify([
      { title: "Berliner Zeitung: BUND klagt gegen Baumfällungen — Wohnungsprojekt gestoppt", url: "https://www.berliner-zeitung.de/news/bund-klagt-gegen-baumfaellungen-wohnungsprojekt-in-lichtenberg-vorerst-gestoppt-li.10019710" },
    ]),
  },
  // === Neukölln ===
  {
    title: "Ringbahnhöfe Neukölln — Bauprojekt insolvent",
    description:
      "Großes Stadtquartier-Projekt zwischen Hertabrücke und Karl-Marx-Straße. Vier Projektgesellschaften haben im Juli 2024 Insolvenz angemeldet. Öffentliches Versorgungswerk hat sich dabei verspekuliert.",
    lat: 52.4750,
    lng: 13.4410,
    party: "SPD",
    bezirk: "Neukölln",
    status: "blockiert",
    date: "01.07.2024",
    pressUrls: JSON.stringify([
      { title: "Tagesspiegel: Insolventes Bauprojekt Ringbahnhöfe — Versorgungswerk verzockt", url: "https://www.tagesspiegel.de/berlin/berliner-wirtschaft/insolventes-bauprojekt-ringbahnhofe-wie-sich-ein-offentliches-versorgungswerk-in-neukolln-verzockte-13483702.html" },
    ]),
  },
  // === Friedrichshain-Kreuzberg ===
  {
    title: "Warschauer Brücke — 1.000 Wohnungen im Hochhaus umstritten",
    description:
      'Bis zu 1.000 Wohnungen in einem 167m-Hochhaus an der Warschauer Brücke geplant. Senat hat dem Bezirk die Planungshoheit entzogen wegen "erheblicher Beeinträchtigung dringender Gesamtinteressen Berlins". Artenschutz-Bedenken.',
    lat: 52.5060,
    lng: 13.4490,
    party: "Grüne",
    bezirk: "Friedrichshain-Kreuzberg",
    status: "verzögert",
    date: "01.01.2025",
    pressUrls: JSON.stringify([
      { title: "Entwicklungsstadt: 1.000 Wohnungen an der Warschauer Brücke", url: "https://www.entwicklungsstadt.de/1-000-wohnungen-sollen-im-hochhaus-an-der-warschauer-bruecke-entstehen/" },
    ]),
  },
  // === Mitte ===
  {
    title: "Molkenmarkt — Wohnungsbau ab frühestens 2029",
    description:
      "Ca. 450 Wohnungen (200 Sozialwohnungen) am historischen Molkenmarkt geplant. Baubeginn auf 2029 verschoben, Bezug frühestens 2032. Initiative kritisiert Verzögerungen und Intransparenz.",
    lat: 52.5150,
    lng: 13.4100,
    party: "SPD",
    bezirk: "Mitte",
    status: "verzögert",
    date: "01.01.2025",
    pressUrls: JSON.stringify([
      { title: "Entwicklungsstadt: Initiative kritisiert Baustart ab 2029", url: "https://entwicklungsstadt.de/wohnungsbau-am-molkenmarkt-initiative-kritisiert-baustart-ab-2029/" },
    ]),
  },
  // === Reinickendorf ===
  {
    title: "Karl-Bonhoeffer-Nervenklinik — 600 Wohnungen gegen Bürgerinitiative",
    description:
      "Auf dem Gelände der ehemaligen Karl-Bonhoeffer-Nervenklinik sollen 600 Wohnungen entstehen. Bürgerinitiative wehrt sich gegen das Projekt.",
    lat: 52.5750,
    lng: 13.3200,
    party: "CDU",
    bezirk: "Reinickendorf",
    status: "verzögert",
    date: "01.01.2024",
    pressUrls: JSON.stringify([
      { title: "Entwicklungsstadt: Bürgerinitiative wehrt sich gegen Wohnungsbau", url: "https://entwicklungsstadt.de/reinickendorf-buergerinitiative-wehrt-sich-gegen-wohnungsbau/" },
    ]),
  },
  // === Marzahn-Hellersdorf ===
  {
    title: "Biesdorf — Bezirksamtschef übergeht BVV-Ablehnung",
    description:
      'Gesobau-Grundstück in Biesdorf: Bezirksbürgermeister bot dem Bausenator das Grundstück an, obwohl die BVV den Neubau abgelehnt hatte. Anwohner fühlen sich "von der Politik hintergangen". Linke/SPD/Grüne kritisieren die Entscheidung.',
    lat: 52.5080,
    lng: 13.5550,
    party: "CDU",
    bezirk: "Marzahn-Hellersdorf",
    status: "verzögert",
    date: "01.01.2023",
    pressUrls: JSON.stringify([
      { title: "Tagesspiegel: Anwohner fühlen sich von Politik hintergangen", url: "https://www.tagesspiegel.de/berlin/bezirke/streit-um-geplanten-neubau-in-berlin-biesdorf-anwohner-fuhlen-sich-von-politik-hintergangen-13539637.html" },
    ]),
  },
  // === Tempelhof-Schöneberg ===
  {
    title: "Pallasstraße — 225 Wohnungen wegen Gentrifizierung blockiert",
    description:
      "225 Wohnungen an der Pallasstraße/Gleditschstraße im Winterfeldt-Kiez geplant. Bezirksamt blockiert wegen Bauhöhe (6 Stockwerke). Anwohner protestieren aus Angst vor Gentrifizierung.",
    lat: 52.4950,
    lng: 13.3530,
    party: "Grüne",
    bezirk: "Tempelhof-Schöneberg",
    status: "blockiert",
    date: "01.01.2023",
    pressUrls: JSON.stringify([
      { title: "Tagesspiegel: Anwohner protestieren gegen Bauprojekt — Gentrifizierung befürchtet", url: "https://www.tagesspiegel.de/berlin/anwohner-protestieren-gegen-bauprojekt-und-furchten-gentrifizierung-4741414.html" },
    ]),
  },
  // === Steglitz-Zehlendorf ===
  {
    title: "Lankwitz Dessauerstraße — 250 Wohnungen aufgegeben",
    description:
      "250 Wohnungen an der Dessauerstraße 37 in Lankwitz geplant. Die Baugrube wurde ausgehoben und dann verlassen. Unvollständige Baugenehmigungen und Planungsblockade des Bezirks führten zum Projektabbruch.",
    lat: 52.4350,
    lng: 13.3490,
    party: "CDU",
    bezirk: "Steglitz-Zehlendorf",
    status: "abgelehnt",
    date: "01.01.2017",
    pressUrls: JSON.stringify([
      { title: "Tagesspiegel: 250 Wohnungen — doch die Baugrube ist verlassen", url: "https://tagesspiegel.de/berlin/steglitz-zehlendorf-in-berlin-lankwitz-sollten-250-wohnungen-entstehen-doch-die-baugrube-ist-verlassen/20697652.html" },
    ]),
  },
  // === Treptow-Köpenick ===
  {
    title: "Kaserne Hessenwinkel — 450 Wohnungen auf Ex-NVA-Gelände",
    description:
      'Auf der ehemaligen NVA-Kaserne in Rahnsdorf sollen 450 Wohnungen entstehen. Bürgerverein will den "Lost Place" retten. Altlastenproblematik und Anwohnerprotest. Baubeginn frühestens Anfang 2030er.',
    lat: 52.4340,
    lng: 13.6400,
    party: "SPD",
    bezirk: "Treptow-Köpenick",
    status: "verzögert",
    date: "01.04.2025",
    pressUrls: JSON.stringify([
      { title: "Entwicklungsstadt: Ehemalige DDR-Kaserne — 450 Wohnungen geplant", url: "https://www.entwicklungsstadt.de/ehemalige-ddr-kaserne-in-rahnsdorf-450-neue-wohnungen-sind-geplant/" },
      { title: "Tagesspiegel: Bürgerverein will Lost Place retten", url: "https://www.tagesspiegel.de/berlin/bezirke/treptow-koepenick/bebauung-ja-aber-nicht-so-burgerverein-will-lost-place-in-treptow-kopenick-retten-14548850.html" },
    ]),
  },
];

console.log("Importiere neue Projekte aus Presserecherche...\n");

let added = 0;
for (const p of projects) {
  // Check duplicate by title
  const existing = await client.execute({
    sql: "SELECT id FROM blocked_projects WHERE title = ?",
    args: [p.title],
  });
  if (existing.rows.length > 0) {
    console.log(`  SKIP: ${p.title}`);
    continue;
  }
  await client.execute({
    sql: `INSERT INTO blocked_projects (title, description, lat, lng, party, bezirk, status, date, source_url, press_urls, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?)`,
    args: [p.title, p.description, p.lat, p.lng, p.party, p.bezirk, p.status, p.date, p.pressUrls, now, now],
  });
  console.log(`  OK: [${p.bezirk}] ${p.title}`);
  added++;
}

// Final stats
const all = await client.execute(
  "SELECT bezirk, count(*) as cnt FROM blocked_projects GROUP BY bezirk ORDER BY cnt DESC"
);
let total = 0;
console.log(`\n${added} neue Projekte. Verteilung:\n`);
for (const r of all.rows) {
  console.log(`  ${String(r[0]).padEnd(30)} ${r[1]}`);
  total += Number(r[1]);
}
console.log(`  ${"GESAMT".padEnd(30)} ${total}`);

const byParty = await client.execute(
  "SELECT party, count(*) as cnt FROM blocked_projects GROUP BY party ORDER BY cnt DESC"
);
console.log("\nNach Partei:");
for (const r of byParty.rows) console.log(`  ${String(r[0]).padEnd(15)} ${r[1]}`);
