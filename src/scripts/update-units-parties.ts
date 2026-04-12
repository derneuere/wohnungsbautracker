import { createClient } from "@libsql/client";
const client = createClient({ url: "file:./sqlite.db" });

// Consolidated results from 8 Haiku agents
const updates: { id: number; unitCount: number | null; parties: string }[] = [
  // Batch 1
  { id: 1, unitCount: null, parties: "Grüne,Linke,SPD" }, // Tempelhofer Feld — Volksentscheid, Grüne/Linke verteidigen Bauverbot
  { id: 2, unitCount: 450, parties: "Linke,Grüne" }, // Michelangelostraße
  { id: 5, unitCount: 6000, parties: "SPD,Grüne,Linke" }, // Blankenburger Süden — Rot-Rot-Grün reduzierte
  { id: 6, unitCount: null, parties: "Linke,SPD" }, // Hubertusallee — kein Wohnungsbau, Büroturm
  { id: 7, unitCount: null, parties: "Linke" }, // Signa Ku'damm — Insolvenz + Linke-Stopp

  // Batch 2
  { id: 8, unitCount: null, parties: "Grüne" }, // Wiesbadener Str — keine genaue Zahl
  { id: 9, unitCount: null, parties: "Linke" }, // Olympiapark — kein Wohnungsbau
  { id: 10, unitCount: 103, parties: "Linke,CDU,Grüne" }, // Schlosspark-Kiez — 103 WE blockiert
  { id: 11, unitCount: 3900, parties: "CDU" }, // Alte Schäferei — 3.900 WE
  { id: 12, unitCount: 99, parties: "Linke,Grüne" }, // GESOBAU Grüner Kiez

  // Batch 3
  { id: 14, unitCount: null, parties: "Linke,Grüne" }, // Signa Hermannplatz Xberg
  { id: 15, unitCount: 62, parties: "Grüne" }, // Mühlenstraße/Spreeufer
  { id: 16, unitCount: 105, parties: "Linke" }, // Habersaathstraße
  { id: 17, unitCount: 140, parties: "Linke" }, // Bayer-Campus
  { id: 18, unitCount: null, parties: "Linke" }, // Signa Mitte

  // Batch 4
  { id: 19, unitCount: null, parties: "Linke,Grüne" }, // Karstadt Hermannplatz Neukölln
  { id: 20, unitCount: 200, parties: "CDU" }, // Blockdammweg
  { id: 21, unitCount: null, parties: "SPD,CDU" }, // Hauptstraße/Willmanndamm
  { id: 22, unitCount: null, parties: "AfD" }, // §34 Treptow — keine konkreten WE
  { id: 23, unitCount: 154, parties: "Linke" }, // Lily-Braun-Straße

  // Batch 5
  { id: 24, unitCount: 63, parties: "Linke" }, // Schlossstraße 23
  { id: 25, unitCount: null, parties: "SPD" }, // Bernauer Str 138
  { id: 26, unitCount: 2500, parties: "Grüne,Linke" }, // Lichterfelde-Süd
  { id: 27, unitCount: 330, parties: "CDU" }, // Steglitzer Kreisel — Adler Group gestoppt
  { id: 28, unitCount: null, parties: "CDU" }, // Frankfurter Allee Süd

  // Batch 6
  { id: 29, unitCount: 375, parties: "Linke" }, // Hohensaatener Str
  { id: 30, unitCount: 292, parties: "Linke,Grüne" }, // Luckeweg Marienfelde
  { id: 31, unitCount: 700, parties: "SPD" }, // Alte Nervenklinik
  { id: 32, unitCount: 13250, parties: "SPD,Grüne" }, // Wasserstadt Oberhavel
  { id: 33, unitCount: 2000, parties: "Grüne" }, // Pankower Tor

  // Batch 7
  { id: 34, unitCount: 5000, parties: "Grüne,Linke" }, // Elisabeth-Aue
  { id: 35, unitCount: 237, parties: "Grüne" }, // Ilsekiez — Artenschutz/BUND
  { id: 36, unitCount: 700, parties: "SPD" }, // Ringbahnhöfe — Insolvenz
  { id: 37, unitCount: 1000, parties: "Grüne,Linke" }, // Warschauer Brücke
  { id: 38, unitCount: 450, parties: "SPD,Grüne,Linke" }, // Molkenmarkt

  // Batch 8
  { id: 39, unitCount: 600, parties: "CDU" }, // Karl-Bonhoeffer
  { id: 40, unitCount: 515, parties: "CDU" }, // Biesdorf
  { id: 41, unitCount: 225, parties: "Grüne" }, // Pallasstraße
  { id: 42, unitCount: 259, parties: "CDU" }, // Lankwitz
  { id: 43, unitCount: 450, parties: "SPD,Grüne,Linke" }, // Kaserne Hessenwinkel
];

console.log("Aktualisiere unitCount + parties für 40 Projekte...\n");

for (const u of updates) {
  await client.execute({
    sql: "UPDATE blocked_projects SET unit_count = ?, party = ? WHERE id = ?",
    args: [u.unitCount, u.parties, u.id],
  });
}
console.log(`${updates.length} Projekte aktualisiert.`);

// Stats
const all = await client.execute(
  "SELECT party, unit_count, title FROM blocked_projects ORDER BY unit_count DESC"
);
let totalUnits = 0;
let withUnits = 0;
for (const r of all.rows) {
  if (r[1]) {
    totalUnits += Number(r[1]);
    withUnits++;
  }
}
console.log(
  `\nWohnungen gesamt: ${totalUnits.toLocaleString("de-DE")} (${withUnits}/${all.rows.length} Projekte mit Angabe)`
);

// Top 10 by units
console.log("\nTop 10 nach Wohnungsanzahl:");
for (const r of all.rows.slice(0, 10)) {
  console.log(
    `  ${String(r[1] || "?").padStart(6)} WE  ${r[2]}  (${r[0]})`
  );
}

// Party stats (count each party in comma-separated lists)
const partyCount = new Map<string, number>();
const partyUnits = new Map<string, number>();
for (const r of all.rows) {
  const parties = String(r[0]).split(",");
  for (const p of parties) {
    const party = p.trim();
    partyCount.set(party, (partyCount.get(party) || 0) + 1);
    partyUnits.set(party, (partyUnits.get(party) || 0) + Number(r[1] || 0));
  }
}
console.log("\nPartei-Beteiligung (Projekte / Wohnungen):");
for (const [p, c] of [...partyCount.entries()].sort(
  (a, b) => (partyUnits.get(b[0]) || 0) - (partyUnits.get(a[0]) || 0)
)) {
  console.log(
    `  ${p.padEnd(10)} ${String(c).padStart(3)} Projekte  ${(partyUnits.get(p) || 0).toLocaleString("de-DE").padStart(7)} WE`
  );
}
