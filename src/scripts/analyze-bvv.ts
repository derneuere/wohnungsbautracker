import { join } from "node:path";

interface Drucksache {
  nummer: string;
  titel: string;
  art: string;
  datum: string;
  abschluss: string;
  initiator: string;
  link: string;
  suchbegriffe: string[];
}

const DATA_PATH = join(import.meta.dir, "../../data/bvv-charlottenburg.json");

function parseDate(dateStr: string): Date | null {
  const [day, month, year] = dateStr.split(".");
  if (!day || !month || !year) return null;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

function getWahlperiode(nummer: string): string {
  const match = nummer.match(/\/(\d+)$/);
  return match ? match[1] : "?";
}

function normalizeParty(initiator: string): string {
  const i = initiator.toLowerCase();
  if (i.includes("grün") || i.includes("grüne") || i.includes("gr�ne") || i.includes("b'90")) return "Grüne";
  if (i.includes("spd")) return "SPD";
  if (i.includes("cdu")) return "CDU";
  if (i.includes("linke")) return "Linke";
  if (i.includes("fdp")) return "FDP";
  if (i.includes("afd")) return "AfD";
  if (i.includes("piraten")) return "Piraten";
  if (i.includes("abteilung") || i.includes("bezirksamt") || i.includes("bezirksbürgermeister") || i.includes("bezirksb")) return "Verwaltung";
  if (i.includes("ausschuss")) return "Ausschuss";
  if (i.includes("bezirksverordnetenvorsteher")) return "BVV-Vorsteher";
  return "Sonstige";
}

function getInvolvedParties(initiator: string): string[] {
  const parties: string[] = [];
  const i = initiator.toLowerCase();
  if (i.includes("grün") || i.includes("grüne") || i.includes("gr�ne") || i.includes("b'90")) parties.push("Grüne");
  if (i.includes("spd")) parties.push("SPD");
  if (i.includes("cdu")) parties.push("CDU");
  if (i.includes("linke") || i.includes("pds")) parties.push("Linke");
  if (i.includes("fdp")) parties.push("FDP");
  if (i.includes("afd")) parties.push("AfD");
  if (i.includes("piraten")) parties.push("Piraten");
  return parties;
}

// ============ MAIN ============

const allData: Drucksache[] = JSON.parse(
  await Bun.file(DATA_PATH).text()
);

console.log("╔═════════════════════════════════════════════���════════╗");
console.log("║  BVV Charlottenburg-Wilmersdorf — Auswertung        ║");
console.log("║  Thema: Wohnungsbau & Stadtentwicklung              ║");
console.log("╚══════════════════════════════════════════════════════╝\n");

// Filter: only current Wahlperiode (6)
const currentPeriod = allData.filter((d) => getWahlperiode(d.nummer) === "6");
const olderPeriods = allData.filter((d) => getWahlperiode(d.nummer) !== "6");

console.log(`Gesamt: ${allData.length} Drucksachen`);
console.log(`  Aktuelle Wahlperiode (6.): ${currentPeriod.length}`);
console.log(`  Ältere Wahlperioden: ${olderPeriods.length}\n`);

const data = currentPeriod;

// ── 1. Nach Drucksachenart ──
console.log("─── Drucksachenart ───");
const byArt = new Map<string, number>();
for (const d of data) byArt.set(d.art, (byArt.get(d.art) || 0) + 1);
for (const [art, count] of [...byArt.entries()].sort((a, b) => b[1] - a[1])) {
  const bar = "█".repeat(Math.ceil(count / 2));
  console.log(`  ${art.padEnd(35)} ${String(count).padStart(3)}  ${bar}`);
}

// ── 2. Nach Initiator (roh) ──
console.log("\n─── Initiator (Originaltext) ───");
const byInitiator = new Map<string, number>();
for (const d of data) byInitiator.set(d.initiator, (byInitiator.get(d.initiator) || 0) + 1);
for (const [init, count] of [...byInitiator.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  const bar = "█".repeat(Math.ceil(count / 2));
  console.log(`  ${init.padEnd(55)} ${String(count).padStart(3)}  ${bar}`);
}
if (byInitiator.size > 15) console.log(`  ... und ${byInitiator.size - 15} weitere`);

// ── 3. Nach Partei (normalisiert) ──
console.log("\n─── Partei (normalisiert) ───");
const byParty = new Map<string, number>();
for (const d of data) {
  const party = normalizeParty(d.initiator);
  byParty.set(party, (byParty.get(party) || 0) + 1);
}
for (const [party, count] of [...byParty.entries()].sort((a, b) => b[1] - a[1])) {
  const pct = ((count / data.length) * 100).toFixed(1);
  const bar = "█".repeat(Math.ceil(count / 2));
  console.log(`  ${party.padEnd(20)} ${String(count).padStart(3)} (${pct.padStart(5)}%)  ${bar}`);
}

// ── 4. Partei-Beteiligung (auch bei gemeinsamen Anträgen) ──
console.log("\n─── Partei-Beteiligung (inkl. gemeinsame Anträge) ───");
const involvement = new Map<string, number>();
for (const d of data) {
  for (const p of getInvolvedParties(d.initiator)) {
    involvement.set(p, (involvement.get(p) || 0) + 1);
  }
}
for (const [party, count] of [...involvement.entries()].sort((a, b) => b[1] - a[1])) {
  const bar = "█".repeat(Math.ceil(count / 2));
  console.log(`  ${party.padEnd(20)} ${String(count).padStart(3)}  ${bar}`);
}

// ── 5. Zeitliche Verteilung ──
console.log("\n─── Zeitliche Verteilung (pro Jahr) ───");
const byYear = new Map<string, number>();
for (const d of data) {
  const year = d.datum.split(".")[2];
  if (year) byYear.set(year, (byYear.get(year) || 0) + 1);
}
for (const [year, count] of [...byYear.entries()].sort()) {
  const bar = "█".repeat(Math.ceil(count / 2));
  console.log(`  ${year}  ${String(count).padStart(3)}  ${bar}`);
}

// ── 6. Partei × Art Kreuzanalyse ──
console.log("\n─── Partei × Drucksachenart (nur politische Fraktionen) ───");
const partyArt = new Map<string, Map<string, number>>();
for (const d of data) {
  const party = normalizeParty(d.initiator);
  if (["Verwaltung", "Ausschuss", "BVV-Vorsteher", "Sonstige"].includes(party)) continue;
  if (!partyArt.has(party)) partyArt.set(party, new Map());
  const arts = partyArt.get(party)!;
  arts.set(d.art, (arts.get(d.art) || 0) + 1);
}
for (const [party, arts] of [...partyArt.entries()].sort()) {
  console.log(`  ${party}:`);
  for (const [art, count] of [...arts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${art.padEnd(35)} ${count}`);
  }
}

// ── 7. Neueste Drucksachen ──
console.log("\n─── 10 Neueste Drucksachen ───");
for (const d of data.slice(0, 10)) {
  console.log(`  ${d.datum}  ${d.nummer.padEnd(10)} ${d.art.padEnd(30)} ${d.initiator}`);
  console.log(`           ${d.titel}`);
  console.log(`           ${d.link}\n`);
}

// ── 8. Anträge mit Blockade-/Ablehnungsindikator ──
console.log("─── Drucksachen mit Hinweis auf Blockade/Ablehnung ───");
const blockadeKeywords = [
  "ablehnung", "abgelehnt", "blockier", "verhinder", "stopp", "gegen ",
  "kein ", "keine ", "nicht ", "verweiger", "zurückweis", "zurücknahme",
];
const blockadeResults = data.filter((d) => {
  const text = (d.titel + " " + d.art).toLowerCase();
  return blockadeKeywords.some((kw) => text.includes(kw));
});
if (blockadeResults.length > 0) {
  for (const d of blockadeResults) {
    console.log(`  ${d.datum}  ${d.nummer}  ${d.initiator}`);
    console.log(`    ${d.titel}`);
    console.log(`    ${d.link}\n`);
  }
} else {
  console.log("  Keine expliziten Blockade-Hinweise in Titeln gefunden.");
  console.log("  (Hinweis: Blockaden sind oft im Dokumentinhalt verborgen, nicht im Titel)\n");
}

// ── 9. Suchbegriff-Überlappung ──
console.log("─── Suchbegriff-Verteilung ───");
const bySearch = new Map<string, number>();
for (const d of data) {
  for (const s of d.suchbegriffe) {
    bySearch.set(s, (bySearch.get(s) || 0) + 1);
  }
}
for (const [term, count] of [...bySearch.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${term.padEnd(25)} ${count}`);
}

const multiMatch = data.filter((d) => d.suchbegriffe.length > 1);
console.log(`\n  Mehrfach-Treffer (multiple Suchbegriffe): ${multiMatch.length}`);

console.log("\n═══════════════════════════════════════════════════════");
console.log("Fertig. Alle Daten basieren auf: data/bvv-charlottenburg.json");
