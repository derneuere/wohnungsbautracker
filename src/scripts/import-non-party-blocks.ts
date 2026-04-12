import { createClient } from "@libsql/client";
const client = createClient({ url: "file:./sqlite.db" });
const now = Math.floor(Date.now() / 1000);

const projects = [
  // === GERICHTE / ARTENSCHUTZ ===
  {
    title: "SEZ-Gelände — 680 Wohnungen wegen Fledermäusen gestoppt",
    description: "Auf dem Gelände des ehemaligen Sport- und Erholungszentrums (SEZ) in Friedrichshain sollen 680 Wohnungen entstehen. Bezirksamt stoppte den Abriss im November 2024 wegen Artenschutz — Zwergfledermäuse nisten im Gebäude.",
    lat: 52.5280, lng: 13.4380,
    party: "Grüne", bezirk: "Friedrichshain-Kreuzberg", status: "blockiert",
    date: "01.11.2024", unitCount: 680,
    blockers: JSON.stringify([
      { name: "Grüne", type: "partei" },
      { name: "Bezirksamt Friedrichshain-Kreuzberg", type: "behörde" },
      { name: "Artenschutz (Zwergfledermäuse)", type: "umwelt" },
    ]),
    pressUrls: JSON.stringify([
      { title: "taz: Bezirk stoppt SEZ-Abriss wegen Artenschutz", url: "https://taz.de/Streit-um-das-ehemalige-SEZ-in-Berlin/!6158565/" },
      { title: "Entwicklungsstadt: SEZ-Abriss gestoppt", url: "https://www.entwicklungsstadt.de/sez-abriss-gestoppt-bezirk-verweist-auf-artenschutzbedenken/" },
    ]),
  },
  // === INVESTOREN-INSOLVENZ ===
  {
    title: "Kiehlufer Neukölln — 300 Wohnungen nach Ziegert-Insolvenz",
    description: "300 Wohnungen am Schifffahrtskanal in Neukölln. Investor Ziegert/Incept GmbH meldete im März 2025 Insolvenz an. Britischer Investor Archer Global hat übernommen, Projekt liegt auf Eis.",
    lat: 52.4830, lng: 13.4390,
    party: "SPD", bezirk: "Neukölln", status: "blockiert",
    date: "25.03.2025", unitCount: 300,
    blockers: JSON.stringify([
      { name: "Ziegert/Incept (Insolvenz)", type: "investor" },
    ]),
    pressUrls: JSON.stringify([
      { title: "Entwicklungsstadt: Kiehlufer — Incept und Ziegert melden Insolvenz", url: "https://www.entwicklungsstadt.de/kiehlufer-projekt-in-der-schwebe-incept-und-ziegert-melden-insolvenz-an/" },
      { title: "Tagesspiegel: 300 Wohnungen am Kiehlufer geplant", url: "https://www.tagesspiegel.de/berlin/bezirke/bauprojekt-in-berlin-neukolln-am-kiehlufer-sollen-300-neue-wohnungen-und-gewerbeflachen-entstehen-11812823.html" },
    ]),
  },
  {
    title: "Goslarer Ufer — Wohnquartier nach Ziegert-Insolvenz gestoppt",
    description: "Ca. 270 Wohnungen am Goslarer Ufer in Charlottenburg. Ziegert/Incept-Insolvenz im März 2025 stoppt das Projekt. Archer Global (UK) übernimmt, Zukunft unklar.",
    lat: 52.5310, lng: 13.3220,
    party: "CDU", bezirk: "Charlottenburg-Wilmersdorf", status: "blockiert",
    date: "25.03.2025", unitCount: 270,
    blockers: JSON.stringify([
      { name: "Ziegert/Incept (Insolvenz)", type: "investor" },
    ]),
    pressUrls: JSON.stringify([
      { title: "Tagesspiegel: Ziegert-Insolvenz stoppt Wohnquartier in Charlottenburg", url: "https://www.tagesspiegel.de/berlin/bezirke/berliner-immobilienprojekt-ziegert-insolvenz-stoppt-plane-fuer-neues-wohnquartier-in-charlottenburg-13453408.html" },
    ]),
  },
  {
    title: "Vonovia — 1.500 Wohnungen berlinweit auf Eis",
    description: "Deutschlands größter Vermieter Vonovia hat den Baustart für 1.500 Wohnungen in Berlin auf unbestimmte Zeit verschoben. Grund: Inflation, steigende Zinsen und Baukosten. Auch 2024 kein Neubau-Start.",
    lat: 52.5200, lng: 13.4050,
    party: "SPD", bezirk: "Mitte", status: "blockiert",
    date: "01.01.2023", unitCount: 1500,
    blockers: JSON.stringify([
      { name: "Vonovia (Baustopp)", type: "investor" },
    ]),
    pressUrls: JSON.stringify([
      { title: "Entwicklungsstadt: Vonovia verschiebt Baustart für 1.500 Wohnungen", url: "https://entwicklungsstadt.de/vonovia-verschiebt-den-baustart-fuer-1500-wohnungen-in-berlin/" },
      { title: "Tagesspiegel: Lederer wirft Vonovia fehlende Verlässlichkeit vor", url: "https://www.tagesspiegel.de/berlin/baustopp-von-vonovia-in-berlin-lederer-wirft-immobilienriesen-fehlende-verlasslichkeit-vor-9276207.html" },
    ]),
  },
  // === BÜRGERINITIATIVEN ===
  {
    title: "Helene-Weigel-Platz — Luxustürme gegen Anwohnerprotest",
    description: "350+ Wohnungen in 4 Türmen (10-15 Stockwerke) am Helene-Weigel-Platz in Marzahn-Süd. Anwohnerinitiative sammelte 2.000+ Unterschriften. Forderung: erst Infrastruktur (Schulen, Kitas, Ärzte), dann bauen.",
    lat: 52.5380, lng: 13.5720,
    party: "CDU", bezirk: "Marzahn-Hellersdorf", status: "verzögert",
    date: "01.01.2025", unitCount: 350,
    blockers: JSON.stringify([
      { name: "Anwohnerinitiative Helene-Weigel-Platz", type: "bürgerinitiative" },
    ]),
    pressUrls: JSON.stringify([
      { title: "Berliner Zeitung: Sauerei hoch drei — Anwohner gegen Luxuswohntürme", url: "https://www.berliner-zeitung.de/mensch-metropole/sauerei-hoch-drei-in-marzahn-anwohner-gegen-luxuswohntuerme-am-helene-weigel-platz-li.2318870" },
      { title: "Entwicklungsstadt: Proteste um Neubauplaene am Marzahner Ortsteilzentrum", url: "https://www.entwicklungsstadt.de/helene-weigel-platz-proteste-um-neubauplaene-am-marzahner-ortsteilzentrum/" },
    ]),
  },
  {
    title: "Buckower Felder — Bürgerentscheid vom Senat ausgehebelt",
    description: "Ca. 900 Wohnungen in Neukölln. Bürgerinitiative 'Rettet die Buckower Felder' sammelte 5.500 Unterschriften und erzwang Bürgerentscheid. Senat übernahm Planungshoheit um den Volksentscheid zu umgehen.",
    lat: 52.4330, lng: 13.4550,
    party: "SPD", bezirk: "Neukölln", status: "verzögert",
    date: "01.01.2023", unitCount: 900,
    blockers: JSON.stringify([
      { name: "BI Rettet die Buckower Felder", type: "bürgerinitiative" },
      { name: "Senat Berlin (Planungsübernahme)", type: "behörde" },
    ]),
    pressUrls: JSON.stringify([
      { title: "Berliner Zeitung: Senat will Bürgerbegehren trickreich verhindern", url: "https://www.berliner-zeitung.de/mensch-metropole/buergerinitiative-buckower-felder-in-berlin-neukoelln-berliner-senat-will-buergerbegehren-trickreich-verhindern-li.75491" },
    ]),
  },
  // === BEHÖRDEN ===
  {
    title: "Schumacher Quartier Tegel — Autobahn GmbH bedroht 570 Wohnungen",
    description: "Im Schumacher Quartier (ehem. Flughafen Tegel) sind 5.000 Wohnungen geplant. Die Autobahn GmbH fordert größeren Abstand zum A111-Tunnel — 570 Wohnungen sind dadurch gefährdet.",
    lat: 52.5600, lng: 13.2900,
    party: "CDU", bezirk: "Reinickendorf", status: "verzögert",
    date: "01.01.2025", unitCount: 570,
    blockers: JSON.stringify([
      { name: "Autobahn GmbH", type: "behörde" },
    ]),
    pressUrls: JSON.stringify([
      { title: "Berliner Woche: Schumacher Quartier kann nicht wie geplant realisiert werden", url: "https://www.berliner-woche.de/tegel/c-bauen/das-schumacher-quartier-kann-bisher-nicht-wie-geplant-realisiert-werden_a405450" },
    ]),
  },
  {
    title: "Zentraler Festplatz — 2.000 Wohnungen von Giffey gestoppt",
    description: "Auf dem Zentralen Festplatz an der Grenze Wedding/Reinickendorf sollten 2.000 landeseigene Wohnungen entstehen. Bürgermeisterin Giffey (SPD) stoppte das Großprojekt 2023.",
    lat: 52.5560, lng: 13.3450,
    party: "SPD", bezirk: "Mitte", status: "abgelehnt",
    date: "01.01.2023", unitCount: 2000,
    blockers: JSON.stringify([
      { name: "SPD (Giffey)", type: "partei" },
      { name: "Senat Berlin", type: "behörde" },
    ]),
    pressUrls: JSON.stringify([
      { title: "Tagesspiegel: Aus für 2.000 Wohnungen — Giffey stoppt Großprojekt", url: "https://www.tagesspiegel.de/berlin/aus-fur-2000-wohnungen-auf-dem-zentralen-festplatz-jetzt-stoppt-auch-giffey-ein-berliner-wohnungsbau-grossprojekt-9325418.html" },
    ]),
  },
];

console.log("Importiere neue Projekte (nicht-Partei-Blockaden)...\n");

let added = 0;
for (const p of projects) {
  const existing = await client.execute({
    sql: "SELECT id FROM blocked_projects WHERE title = ?",
    args: [p.title],
  });
  if (existing.rows.length > 0) {
    console.log("  SKIP: " + p.title);
    continue;
  }
  await client.execute({
    sql: `INSERT INTO blocked_projects (title, description, lat, lng, party, bezirk, status, date, unit_count, blockers, source_url, press_urls, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?)`,
    args: [p.title, p.description, p.lat, p.lng, p.party, p.bezirk, p.status, p.date, p.unitCount, p.blockers, p.pressUrls, now, now],
  });
  console.log("  OK: [" + p.bezirk + "] " + p.title + " (" + p.unitCount + " WE)");
  added++;
}

// Final stats
const all = await client.execute("SELECT unit_count FROM blocked_projects");
let totalUnits = 0;
for (const r of all.rows) totalUnits += Number(r[0] || 0);

const byBez = await client.execute("SELECT bezirk, count(*) FROM blocked_projects GROUP BY bezirk ORDER BY count(*) DESC");

console.log("\n" + added + " neue Projekte. Gesamt: " + all.rows.length);
console.log("Wohnungen gesamt: " + totalUnits.toLocaleString("de-DE"));
console.log("\nNach Bezirk:");
for (const r of byBez.rows) console.log("  " + String(r[0]).padEnd(30) + r[1]);
