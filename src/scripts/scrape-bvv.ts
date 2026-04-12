import * as cheerio from "cheerio";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE_URL =
  "https://bvv-charlottenburg-wilmersdorf.berlin.de/pi-r/vo040_r.asp";
const DOC_BASE_URL =
  "https://bvv-charlottenburg-wilmersdorf.berlin.de/pi-r/";
const RAW_DIR = join(import.meta.dir, "../../data/raw");
const DATA_DIR = join(import.meta.dir, "../../data");

const SEARCH_TERMS = [
  "Wohnungsbau",
  "Bebauungsplan",
  "Neubau",
  "Wohnungen",
  "Verdichtung",
  "Nachverdichtung",
  "Bauvorhaben",
  "Stadtentwicklung",
];

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

type Session = {
  cookie: string;
  selrName: string;
  selrValue: string;
};

async function getSession(): Promise<Session> {
  const resp = await fetch(BASE_URL);
  const html = await resp.text();
  const cookies = resp.headers.getSetCookie();
  const cookie = cookies.map((c) => c.split(";")[0]).join("; ");

  const nameMatch = html.match(/name="(SELR_[^"]+)"/);
  const valueMatch = html.match(/name="SELR_[^"]+"\s*value="([^"]+)"/);

  if (!nameMatch || !valueMatch) {
    throw new Error("Could not extract SELR token from landing page");
  }

  return { cookie, selrName: nameMatch[1], selrValue: valueMatch[1] };
}

async function fetchSearchPage(
  term: string,
  session: Session
): Promise<string> {
  const params = new URLSearchParams();
  params.append(session.selrName, session.selrValue);
  params.append("SELRFORM", "1");
  params.append("SORT", "");
  params.append("fulltext1", "");
  params.append("fulltext2", term);
  params.append("beginDateField", "");
  params.append("endDateField", "");
  params.append("beginDateField2", "");
  params.append("endDateField2", "");
  params.append("p::submit", "Suchen");

  const resp = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: session.cookie,
      Referer: BASE_URL,
    },
    body: params.toString(),
  });

  return resp.text();
}

async function fetchNextPage(session: Session): Promise<string> {
  const resp = await fetch(BASE_URL + "?shownext=true", {
    headers: {
      Cookie: session.cookie,
      Referer: BASE_URL,
    },
  });
  return resp.text();
}

function parseResultsFromHtml(html: string): Omit<Drucksache, "suchbegriffe">[] {
  const $ = cheerio.load(html);
  const results: Omit<Drucksache, "suchbegriffe">[] = [];

  $("table.dataTable tbody tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 6) return;

    const nummerLink = $(cells[0]).find("a");
    const nummer = nummerLink.text().trim();
    const titel = $(cells[1]).find("a").text().trim() || $(cells[1]).text().trim();
    const href = nummerLink.attr("href") || "";
    const art = $(cells[2]).find("div").text().trim();
    const datum = $(cells[3]).find("div").text().trim();
    const abschluss = $(cells[4]).find("div").text().trim();
    const initiator = $(cells[5]).find("div").text().trim();

    if (nummer) {
      results.push({
        nummer,
        titel,
        art,
        datum,
        abschluss,
        initiator,
        link: href.startsWith("http") ? href : DOC_BASE_URL + href,
      });
    }
  });

  return results;
}

function extractResultInfo(html: string): { total: number; hasMore: boolean } {
  // Matches "17 Ergebnisse" or "Ergebnisse 1-50 von ungefähr 100"
  const singleMatch = html.match(/^(\d+)\s*Ergebnis/m);
  const rangeMatch = html.match(
    /Ergebnisse\s+\d+-\d+\s+von\s+(?:ungef[äa]hr\s+)?(\d+)/
  );
  const hasMore = html.includes('href="?shownext=true"');

  if (rangeMatch) return { total: parseInt(rangeMatch[1]), hasMore };
  if (singleMatch) return { total: parseInt(singleMatch[1]), hasMore };
  return { total: 0, hasMore };
}

// ============ MAIN ============

console.log("=== BVV Charlottenburg-Wilmersdorf Scraper ===\n");

await mkdir(RAW_DIR, { recursive: true });
await mkdir(DATA_DIR, { recursive: true });

// Phase A: Fetch and save raw HTML for all search terms
console.log("Phase A: Fetching raw HTML...\n");

const allRawPages: { term: string; filename: string }[] = [];

for (const term of SEARCH_TERMS) {
  // Fresh session per search term to avoid stale results
  const session = await getSession();
  await new Promise((r) => setTimeout(r, 300));

  try {
    const html = await fetchSearchPage(term, session);
    const slug = term.toLowerCase().replace(/[^a-z0-9äöü]/g, "-");
    const filename = `${slug}-page1.html`;
    await Bun.write(join(RAW_DIR, filename), html);
    allRawPages.push({ term, filename });

    const info = extractResultInfo(html);
    const parsed = parseResultsFromHtml(html);
    console.log(
      `  "${term}": ~${info.total} Ergebnisse, ${parsed.length} auf Seite 1${info.hasMore ? " (weitere Seiten vorhanden)" : ""}`
    );

    // Fetch additional pages if pagination exists
    let pageNum = 2;
    let currentSession = session;
    let hasMore = info.hasMore;

    while (hasMore) {
      await new Promise((r) => setTimeout(r, 300));
      const nextHtml = await fetchNextPage(currentSession);
      const nextFilename = `${slug}-page${pageNum}.html`;
      await Bun.write(join(RAW_DIR, nextFilename), nextHtml);
      allRawPages.push({ term, filename: nextFilename });

      const nextInfo = extractResultInfo(nextHtml);
      const nextParsed = parseResultsFromHtml(nextHtml);
      console.log(
        `    Seite ${pageNum}: ${nextParsed.length} Ergebnisse${nextInfo.hasMore ? " (weitere...)" : ""}`
      );

      hasMore = nextInfo.hasMore;
      pageNum++;

      if (pageNum > 10) {
        console.log(`    WARNUNG: Mehr als 10 Seiten, stoppe bei Seite ${pageNum}`);
        break;
      }
    }
  } catch (err) {
    console.error(`  "${term}": FEHLER -`, err);
  }
}

// Phase B: Parse all raw HTML and deduplicate
console.log(`\nPhase B: Parsing & Deduplizierung...\n`);

const drucksachenMap = new Map<string, Drucksache>();

for (const { term, filename } of allRawPages) {
  const html = await Bun.file(join(RAW_DIR, filename)).text();
  const results = parseResultsFromHtml(html);

  for (const r of results) {
    const existing = drucksachenMap.get(r.nummer);
    if (existing) {
      if (!existing.suchbegriffe.includes(term)) {
        existing.suchbegriffe.push(term);
      }
    } else {
      drucksachenMap.set(r.nummer, { ...r, suchbegriffe: [term] });
    }
  }
}

const allResults = [...drucksachenMap.values()].sort((a, b) => {
  // Sort by date descending
  const dateA = a.datum.split(".").reverse().join("-");
  const dateB = b.datum.split(".").reverse().join("-");
  return dateB.localeCompare(dateA);
});

// Save structured data
const outputPath = join(DATA_DIR, "bvv-charlottenburg.json");
await Bun.write(outputPath, JSON.stringify(allResults, null, 2));

// Summary
console.log(`=== Zusammenfassung ===`);
console.log(`Gesamt: ${allResults.length} einzigartige Drucksachen\n`);

const byInitiator = new Map<string, number>();
for (const r of allResults) {
  byInitiator.set(r.initiator, (byInitiator.get(r.initiator) || 0) + 1);
}
console.log(`Nach Initiator:`);
for (const [init, count] of [...byInitiator.entries()].sort(
  (a, b) => b[1] - a[1]
)) {
  console.log(`  ${init}: ${count}`);
}

const byArt = new Map<string, number>();
for (const r of allResults) {
  byArt.set(r.art, (byArt.get(r.art) || 0) + 1);
}
console.log(`\nNach Art:`);
for (const [art, count] of [...byArt.entries()].sort(
  (a, b) => b[1] - a[1]
)) {
  console.log(`  ${art}: ${count}`);
}

console.log(`\nRoh-HTML: ${RAW_DIR} (${allRawPages.length} Dateien)`);
console.log(`Strukturierte Daten: ${outputPath}`);
