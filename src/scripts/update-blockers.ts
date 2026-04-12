import { createClient } from "@libsql/client";
const client = createClient({ url: "file:./sqlite.db" });

type Blocker = { name: string; type: "partei" | "bürgerinitiative" | "behörde" | "gericht" | "umwelt" | "investor" };

const data: Record<number, Blocker[]> = {
  1: [
    { name: "Grüne", type: "partei" }, { name: "Linke", type: "partei" }, { name: "SPD", type: "partei" },
    { name: "BI 100% Tempelhofer Feld", type: "bürgerinitiative" }, { name: "Volksentscheid 2014", type: "bürgerinitiative" },
    { name: "BUND", type: "umwelt" },
  ],
  2: [
    { name: "Linke", type: "partei" }, { name: "Grüne", type: "partei" },
    { name: "Anwohnerinitiative Michelangelostraße", type: "bürgerinitiative" },
    { name: "Jüdische Gemeinde (Restitution)", type: "bürgerinitiative" },
    { name: "Verwaltungsgericht Berlin", type: "gericht" },
  ],
  5: [
    { name: "SPD", type: "partei" }, { name: "Grüne", type: "partei" }, { name: "Linke", type: "partei" },
    { name: "BI Rettet Blankenburg", type: "bürgerinitiative" },
    { name: "BI Wir sind Blankenburger", type: "bürgerinitiative" },
  ],
  6: [
    { name: "Linke", type: "partei" }, { name: "SPD", type: "partei" },
    { name: "Spree Group (Insolvenz)", type: "investor" },
  ],
  7: [
    { name: "Linke", type: "partei" }, { name: "Grüne", type: "partei" },
    { name: "Signa (Insolvenz)", type: "investor" }, { name: "Senat Berlin", type: "behörde" },
  ],
  8: [
    { name: "Grüne", type: "partei" },
    { name: "Bezirksamt Charlottenburg-Wilmersdorf", type: "behörde" },
    { name: "Denkmalschutz", type: "behörde" },
  ],
  9: [
    { name: "Linke", type: "partei" }, { name: "SPD", type: "partei" },
    { name: "Denkmalschutz Olympiapark", type: "behörde" },
    { name: "BUND/NABU", type: "umwelt" },
  ],
  10: [
    { name: "Linke", type: "partei" }, { name: "CDU", type: "partei" }, { name: "Grüne", type: "partei" },
    { name: "BI Grüner Kiez Pankow", type: "bürgerinitiative" },
    { name: "Bezirksamt Pankow", type: "behörde" },
    { name: "BUND Berlin", type: "umwelt" },
  ],
  11: [
    { name: "CDU", type: "partei" },
  ],
  12: [
    { name: "Linke", type: "partei" }, { name: "Grüne", type: "partei" },
    { name: "BI Grüner Kiez Pankow", type: "bürgerinitiative" },
    { name: "BUND Berlin", type: "umwelt" }, { name: "NaturFreunde Berlin", type: "umwelt" },
    { name: "Verwaltungsgericht", type: "gericht" },
  ],
  14: [
    { name: "Linke", type: "partei" }, { name: "Grüne", type: "partei" },
    { name: "Signa (Insolvenz)", type: "investor" },
    { name: "Bezirksamt Friedrichshain-Kreuzberg", type: "behörde" },
    { name: "Initiative Hermannplatz", type: "bürgerinitiative" },
    { name: "Denkmalschutz", type: "behörde" },
  ],
  15: [
    { name: "Grüne", type: "partei" },
    { name: "Mediaspree Versenken", type: "bürgerinitiative" },
    { name: "BVV Friedrichshain-Kreuzberg", type: "behörde" },
  ],
  16: [
    { name: "Linke", type: "partei" },
    { name: "Arcadia Estates (Spekulation)", type: "investor" },
    { name: "Bezirksamt Mitte", type: "behörde" },
    { name: "Kammergericht Berlin", type: "gericht" },
  ],
  17: [
    { name: "Linke", type: "partei" },
    { name: "Bayer AG (Abriss für Fabrik)", type: "investor" },
    { name: "Anwohnerinitiative Mettmannkiez", type: "bürgerinitiative" },
  ],
  18: [
    { name: "Linke", type: "partei" },
    { name: "Signa (Insolvenz)", type: "investor" },
    { name: "Senat Berlin", type: "behörde" },
  ],
  19: [
    { name: "Linke", type: "partei" }, { name: "Grüne", type: "partei" },
    { name: "Signa (Insolvenz)", type: "investor" },
    { name: "Initiative Hermannplatz", type: "bürgerinitiative" },
    { name: "Senat Berlin", type: "behörde" },
  ],
  20: [
    { name: "CDU", type: "partei" },
    { name: "Bezirksamt Lichtenberg", type: "behörde" },
  ],
  21: [
    { name: "SPD", type: "partei" }, { name: "CDU", type: "partei" },
    { name: "Grüne", type: "partei" }, { name: "Linke", type: "partei" },
  ],
  22: [
    { name: "AfD", type: "partei" },
  ],
  23: [
    { name: "Linke", type: "partei" }, { name: "SPD", type: "partei" }, { name: "Grüne", type: "partei" },
    { name: "Anwohnerinitiative Lily-Braun-Str.", type: "bürgerinitiative" },
  ],
  24: [
    { name: "Linke", type: "partei" },
  ],
  25: [
    { name: "SPD", type: "partei" },
    { name: "Altlastensanierung", type: "behörde" },
  ],
  26: [
    { name: "Grüne", type: "partei" }, { name: "Linke", type: "partei" },
    { name: "Aktionsbündnis Lichterfelde Süd", type: "bürgerinitiative" },
  ],
  27: [
    { name: "CDU", type: "partei" },
    { name: "Adler Group (Baustopp)", type: "investor" },
    { name: "Landgericht Berlin", type: "gericht" },
  ],
  28: [
    { name: "CDU", type: "partei" },
    { name: "Bezirksamt Lichtenberg", type: "behörde" },
  ],
  29: [
    { name: "Linke", type: "partei" },
    { name: "Anwohnerinitiative Marzahn-Ost", type: "bürgerinitiative" },
    { name: "Gewobag", type: "investor" },
  ],
  30: [
    { name: "Linke", type: "partei" }, { name: "Grüne", type: "partei" },
    { name: "Eigentümer (Abriss verschoben)", type: "investor" },
  ],
  31: [
    { name: "SPD", type: "partei" },
    { name: "Bezirksamt Spandau", type: "behörde" },
    { name: "Degewo (zurückgezogen)", type: "investor" },
  ],
  32: [
    { name: "SPD", type: "partei" }, { name: "Grüne", type: "partei" },
    { name: "Senat Berlin (Planungsübernahme)", type: "behörde" },
  ],
  33: [
    { name: "Grüne", type: "partei" },
    { name: "NABU (Kreuzkröten)", type: "umwelt" },
    { name: "Senat Berlin", type: "behörde" },
    { name: "Verwaltungsgericht", type: "gericht" },
  ],
  34: [
    { name: "Grüne", type: "partei" }, { name: "Linke", type: "partei" },
    { name: "BI Elisabeth-Aue", type: "bürgerinitiative" },
    { name: "NABU", type: "umwelt" },
  ],
  35: [
    { name: "Grüne", type: "partei" },
    { name: "BUND", type: "umwelt" }, { name: "NABU", type: "umwelt" },
    { name: "BI Ilse-Kiez", type: "bürgerinitiative" },
    { name: "Verwaltungsgericht (Artenschutz)", type: "gericht" },
  ],
  36: [
    { name: "SPD", type: "partei" },
    { name: "Projektgesellschaft (Insolvenz)", type: "investor" },
  ],
  37: [
    { name: "Grüne", type: "partei" }, { name: "Linke", type: "partei" },
    { name: "Bezirksamt Friedrichshain-Kreuzberg", type: "behörde" },
    { name: "Senat (Planungsübernahme)", type: "behörde" },
    { name: "Artenschutz (Zauneidechsen)", type: "umwelt" },
  ],
  38: [
    { name: "SPD", type: "partei" }, { name: "Grüne", type: "partei" }, { name: "Linke", type: "partei" },
    { name: "Senatsbaudirektorin", type: "behörde" },
    { name: "Archäologie", type: "behörde" },
  ],
  39: [
    { name: "CDU", type: "partei" },
    { name: "BI Reinickendorf", type: "bürgerinitiative" },
    { name: "BUND", type: "umwelt" },
    { name: "Denkmalschutz", type: "behörde" },
  ],
  40: [
    { name: "CDU", type: "partei" },
    { name: "Anwohnerinitiative Biesdorf", type: "bürgerinitiative" },
  ],
  41: [
    { name: "Grüne", type: "partei" },
    { name: "Bezirksamt Tempelhof-Schöneberg", type: "behörde" },
    { name: "Anwohnerinitiative Winterfeldt-Kiez", type: "bürgerinitiative" },
  ],
  42: [
    { name: "CDU", type: "partei" },
    { name: "Bezirksamt Steglitz-Zehlendorf", type: "behörde" },
  ],
  43: [
    { name: "SPD", type: "partei" }, { name: "Grüne", type: "partei" }, { name: "Linke", type: "partei" },
    { name: "BI Wilhelmshagen-Rahnsdorf", type: "bürgerinitiative" },
    { name: "Altlastensanierung", type: "behörde" },
  ],
};

let count = 0;
for (const [id, blockers] of Object.entries(data)) {
  await client.execute({
    sql: "UPDATE blocked_projects SET blockers = ? WHERE id = ?",
    args: [JSON.stringify(blockers), parseInt(id)],
  });
  count++;
}
console.log(`${count} Projekte mit Blockern aktualisiert.`);

// Stats
const types = new Map<string, number>();
for (const blockers of Object.values(data)) {
  for (const b of blockers) {
    types.set(b.type, (types.get(b.type) || 0) + 1);
  }
}
console.log("\nBlocker-Typen (Gesamt-Einträge):");
for (const [t, c] of [...types.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${t.padEnd(20)} ${c}`);
}

// Count projects with each type
const projectsWithType = new Map<string, number>();
for (const blockers of Object.values(data)) {
  const projectTypes = new Set(blockers.map((b) => b.type));
  for (const t of projectTypes) {
    projectsWithType.set(t, (projectsWithType.get(t) || 0) + 1);
  }
}
console.log("\nProjekte mit Blocker-Typ:");
for (const [t, c] of [...projectsWithType.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${t.padEnd(20)} ${c}/40`);
}
