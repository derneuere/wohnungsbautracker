import * as cheerio from "cheerio";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = join(import.meta.dir, "../../data");

const DISTRICTS = [
  { bezirk: "Charlottenburg-Wilmersdorf", slug: "charlottenburg-wilmersdorf" },
  { bezirk: "Friedrichshain-Kreuzberg", slug: "friedrichshain-kreuzberg" },
  { bezirk: "Lichtenberg", slug: "lichtenberg" },
  { bezirk: "Marzahn-Hellersdorf", slug: "marzahn-hellersdorf" },
  { bezirk: "Mitte", slug: "mitte" },
  { bezirk: "Neukölln", slug: "neukoelln" },
  { bezirk: "Pankow", slug: "pankow" },
  { bezirk: "Reinickendorf", slug: "reinickendorf" },
  { bezirk: "Spandau", slug: "spandau" },
  { bezirk: "Steglitz-Zehlendorf", slug: "steglitz-zehlendorf" },
  { bezirk: "Tempelhof-Schöneberg", slug: "tempelhof-schoeneberg" },
  { bezirk: "Treptow-Köpenick", slug: "treptow-koepenick" },
];

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
  bezirk: string;
}

async function getSession(baseUrl: string) {
  const resp = await fetch(baseUrl);
  const html = await resp.text();
  const cookies = resp.headers.getSetCookie();
  const cookie = cookies.map((c) => c.split(";")[0]).join("; ");
  const nameMatch = html.match(/name="(SELR_[^"]+)"/);
  const valueMatch = html.match(/name="SELR_[^"]+"\s*value="([^"]+)"/);
  if (!nameMatch || !valueMatch) throw new Error("No SELR token");
  return { cookie, selrName: nameMatch[1], selrValue: valueMatch[1] };
}

async function fetchSearch(
  baseUrl: string,
  term: string,
  session: { cookie: string; selrName: string; selrValue: string }
) {
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
  const resp = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: session.cookie,
      Referer: baseUrl,
    },
    body: params.toString(),
  });
  return resp.text();
}

async function fetchNext(
  baseUrl: string,
  session: { cookie: string; selrName: string; selrValue: string }
) {
  const resp = await fetch(baseUrl + "?shownext=true", {
    headers: { Cookie: session.cookie, Referer: baseUrl },
  });
  return resp.text();
}

function parseResults(html: string, docBaseUrl: string) {
  const $ = cheerio.load(html);
  const results: Omit<Drucksache, "suchbegriffe" | "bezirk">[] = [];
  $("table.dataTable tbody tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 5) return;
    const nummerLink = $(cells[0]).find("a");
    const nummer = nummerLink.text().trim();
    const titel =
      $(cells[1]).find("a").text().trim() || $(cells[1]).text().trim();
    const href = nummerLink.attr("href") || "";
    const art = $(cells[2]).find("div").text().trim();
    const datum = $(cells[3]).find("div").text().trim();
    // Some districts have 5 columns (no initiator), others have 6
    const hasInitiator = cells.length >= 6;
    const abschluss = $(cells[hasInitiator ? 4 : 3]).find("div").text().trim();
    const initiator = hasInitiator
      ? $(cells[5]).find("div").text().trim()
      : "";
    if (nummer)
      results.push({
        nummer,
        titel,
        art,
        datum,
        abschluss,
        initiator,
        link: href.startsWith("http") ? href : docBaseUrl + href,
      });
  });
  return results;
}

async function scrapeDistrict(
  bezirk: string,
  slug: string
): Promise<Drucksache[]> {
  const baseUrl = `https://bvv-${slug}.berlin.de/pi-r/vo040_r.asp`;
  const docBaseUrl = `https://bvv-${slug}.berlin.de/pi-r/`;
  const rawDir = join(DATA_DIR, `raw-${slug}`);
  await mkdir(rawDir, { recursive: true });

  const drucksachenMap = new Map<string, Drucksache>();

  for (const term of SEARCH_TERMS) {
    const session = await getSession(baseUrl);
    await new Promise((r) => setTimeout(r, 200));

    try {
      const html = await fetchSearch(baseUrl, term, session);
      const termSlug = term.toLowerCase().replace(/[^a-z0-9äöü]/g, "-");
      await Bun.write(join(rawDir, `${termSlug}-page1.html`), html);

      const results = parseResults(html, docBaseUrl);
      for (const r of results) {
        const existing = drucksachenMap.get(r.nummer);
        if (existing) {
          if (!existing.suchbegriffe.includes(term))
            existing.suchbegriffe.push(term);
        } else {
          drucksachenMap.set(r.nummer, { ...r, suchbegriffe: [term], bezirk });
        }
      }

      // Pagination
      let hasMore = html.includes("shownext=true");
      let page = 2;
      while (hasMore && page <= 10) {
        await new Promise((r) => setTimeout(r, 200));
        const nextHtml = await fetchNext(baseUrl, session);
        await Bun.write(join(rawDir, `${termSlug}-page${page}.html`), nextHtml);
        const nextResults = parseResults(nextHtml, docBaseUrl);
        for (const r of nextResults) {
          const existing = drucksachenMap.get(r.nummer);
          if (existing) {
            if (!existing.suchbegriffe.includes(term))
              existing.suchbegriffe.push(term);
          } else {
            drucksachenMap.set(r.nummer, {
              ...r,
              suchbegriffe: [term],
              bezirk,
            });
          }
        }
        hasMore = nextHtml.includes("shownext=true");
        page++;
      }

      process.stdout.write(".");
    } catch {
      process.stdout.write("x");
    }
  }

  return [...drucksachenMap.values()];
}

// ============ MAIN ============

console.log("=== BVV Gesamt-Scraper — Alle 12 Berliner Bezirke ===\n");
await mkdir(DATA_DIR, { recursive: true });

// Skip already scraped districts
const alreadyScraped = ["charlottenburg-wilmersdorf", "pankow"];
const toScrape = DISTRICTS.filter((d) => !alreadyScraped.includes(d.slug));

const allResults: Record<string, Drucksache[]> = {};

// Load existing data
for (const slug of alreadyScraped) {
  const district = DISTRICTS.find((d) => d.slug === slug)!;
  try {
    const existing = JSON.parse(
      await Bun.file(join(DATA_DIR, `bvv-${slug}.json`)).text()
    );
    // Add bezirk field if missing
    const withBezirk = existing.map((d: any) => ({
      ...d,
      bezirk: d.bezirk || district.bezirk,
    }));
    allResults[district.bezirk] = withBezirk;
    console.log(
      `  ${district.bezirk}: ${withBezirk.length} (bereits vorhanden)`
    );
  } catch {
    console.log(`  ${district.bezirk}: Datei nicht gefunden, wird neu gescraped`);
    toScrape.push(district);
  }
}

// Scrape remaining districts
for (const district of toScrape) {
  process.stdout.write(`\n  ${district.bezirk}: `);
  try {
    const results = await scrapeDistrict(district.bezirk, district.slug);
    allResults[district.bezirk] = results;

    // Save per-district
    await Bun.write(
      join(DATA_DIR, `bvv-${district.slug}.json`),
      JSON.stringify(results, null, 2)
    );
    console.log(` ${results.length} Drucksachen`);
  } catch (err: any) {
    console.log(` FEHLER: ${err.message}`);
  }
}

// Save combined file
const combined = Object.values(allResults).flat();
combined.sort((a, b) => {
  const dateA = a.datum.split(".").reverse().join("-");
  const dateB = b.datum.split(".").reverse().join("-");
  return dateB.localeCompare(dateA);
});
await Bun.write(
  join(DATA_DIR, "bvv-alle-bezirke.json"),
  JSON.stringify(combined, null, 2)
);

// Summary
console.log("\n\n═══════════════════════════════════════════════════════");
console.log("ZUSAMMENFASSUNG");
console.log("═══════════════════════════════════════════════════════\n");

let total = 0;
for (const [bezirk, results] of Object.entries(allResults).sort(
  (a, b) => b[1].length - a[1].length
)) {
  console.log(`  ${bezirk.padEnd(30)} ${String(results.length).padStart(4)}`);
  total += results.length;
}
console.log(`  ${"GESAMT".padEnd(30)} ${String(total).padStart(4)}`);

console.log(`\nGespeichert: data/bvv-alle-bezirke.json (${total} Drucksachen)`);
