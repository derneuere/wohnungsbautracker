import { createClient } from "@libsql/client";
const client = createClient({ url: "file:./sqlite.db" });

const pressData: Record<number, { title: string; url: string }[]> = {
  // Charlottenburg-Wilmersdorf
  6: [
    { title: "Tagesspiegel: Neubau eines Büroturms nahe dem Ku'damm gescheitert", url: "https://www.tagesspiegel.de/berlin/bezirke/berlin-halensee-der-neubau-eines-buroturms-nahe-dem-kudamm-ist-vorerst-gescheitert-12874231.html" },
  ],
  7: [
    { title: "Tagesspiegel: Hochhauspläne für den Ku'damm – Signa drängte Kritiker aus Jury", url: "https://www.tagesspiegel.de/berlin/hochhausplane-fur-den-kudamm-so-drangte-der-signa-konzern-einen-kritiker-aus-der-jury-9865481.html" },
    { title: "taz: Immobilienkonzern in der Krise – Senat glaubt an Signa", url: "https://taz.de/Immobilienkonzern-in-der-Krise/!5968520/" },
  ],
  9: [
    { title: "Tagesspiegel: Kein neues Stadion im Olympiapark", url: "https://www.tagesspiegel.de/berlin/wo-konnte-hertha-stattdessen-bauen-5936674.html" },
  ],
  // Friedrichshain-Kreuzberg
  14: [
    { title: "Tagesspiegel: Signa-Neubau Karstadt – Koalition streitet über Hermannplatz", url: "https://www.tagesspiegel.de/berlin/signa-neubau-von-karstadt--berliner-koalition-streitet-uber-hermannplatz-4784749.html" },
    { title: "taz: Umstrittener Umbau – Signa mauert am Hermannplatz", url: "https://taz.de/Umstrittener-Umbau-von-Karstadt/!5834943/" },
  ],
  15: [
    { title: "Berliner Zeitung: Spreeufer Mediaspree – Protest gegen Bebauung", url: "https://www.berliner-zeitung.de/berlin/spreeufer-mediaspree-protest-gegen-bebauung-des-spreeufers-4463710" },
  ],
  // Lichtenberg
  20: [
    { title: "Tagesspiegel: Warum in Lichtenberg 1800 Wohnungen nicht gebaut werden können", url: "https://www.tagesspiegel.de/wirtschaft/immobilien/warum-in-lichtenberg-1800-wohnungen-nicht-gebaut-werden-konnen-4086817.html" },
  ],
  28: [
    { title: "Tagesspiegel: Protest gegen 240 Wohnungen in Berliner Höfen", url: "https://www.tagesspiegel.de/berlin/bezirke/lichtenberg/protest-gegen-240-wohnungen-in-berliner-hofen-hier-wollen-nachbarn-die-nachverdichtung-im-berliner-osten-stoppen-14860412.html" },
  ],
  // Marzahn-Hellersdorf
  23: [
    { title: "Tagesspiegel: Anwohner wehren sich gegen Bebauung grüner Innenhöfe", url: "https://www.tagesspiegel.de/berlin/sie-machen-7000-menschen-unglucklich-anwohner-im-osten-berlins-wehren-sich-gegen-bebauung-von-grunen-innenhofen-301756.html" },
  ],
  29: [
    { title: "Tagesspiegel: Nachbarn in Marzahn protestieren gegen Wohnungsbau", url: "https://www.tagesspiegel.de/berlin/bezirke/marzahn-hellersdorf/diese-massive-verdichtung-im-bezirk-ist-respektlos-warum-nachbarn-in-berlin-marzahn-gegen-wohnungsbau-protestieren-14881349.html" },
    { title: "Berliner Zeitung: Das ist Marzahn, nicht Manhattan!", url: "https://www.berliner-zeitung.de/mensch-metropole/berliner-laufen-sturm-gegen-sozialwohnungsbau-das-ist-marzahn-nicht-manhattan-li.2322067" },
  ],
  // Mitte
  16: [
    { title: "taz: Immobilienspekulation – Räumungsversuch in Wild-West-Manier", url: "https://taz.de/Immobilienspekulation-in-Berlin/!5949416/" },
    { title: "Tagesspiegel: Eigentümer scheitert mit Mieter-Kündigungen vor Gericht", url: "https://www.tagesspiegel.de/berlin/problemhaus-in-der-habersaathstrasse-in-berlin-mitte-eigentumer-scheitert-mit-mieter-kundigungen-vor-gericht-10812559.html" },
  ],
  17: [
    { title: "Entwicklungsstadt: Wohnhäuser im Wedding vor dem Abriss", url: "https://www.entwicklungsstadt.de/wohnhaeuser-im-wedding-vor-dem-abriss-bayer-ag-haelt-an-bauplaenen-fest/" },
    { title: "Tagesspiegel: Bayer hält an Abrissplänen fest", url: "https://www.tagesspiegel.de/berlin/pharma-riese-bayer-halt-an-abrissplanen-fest-wohnhauser-in-berlin-wedding-sollen-einer-werksfeuerwache-weichen-13038742.html" },
  ],
  18: [
    { title: "Entwicklungsstadt: Baustopp für alle Signa-Projekte in Berlin?", url: "https://www.entwicklungsstadt.de/immobilienkrise-baustopp-fuer-alle-signa-projekte-in-berlin/" },
  ],
  // Neukölln
  19: [
    { title: "Entwicklungsstadt: Karstadt Hermannplatz – Wie geht es weiter?", url: "https://www.entwicklungsstadt.de/karstadt-hermannplatz-wie-geht-es-mit-dem-kaufhaus-weiter/" },
    { title: "Entwicklungsstadt: Signa-Projekte – Senat stoppt Planung", url: "https://www.entwicklungsstadt.de/signa-projekte-hermannplatz-und-kudamm-senat-stoppt-planung/" },
  ],
  // Pankow
  2: [
    { title: "Entwicklungsstadt: Michelangelostraße – Streit gefährdet Neubauprojekt", url: "https://entwicklungsstadt.de/michelangelostrasse-streit-um-grundstuecke-gefaehrdet-neubauprojekt/" },
    { title: "Tagesspiegel: 1200 Wohnungen in Prenzlauer Berg vom Tisch?", url: "https://www.tagesspiegel.de/berlin/bezirke/pankow/keine-einigung-mit-judischer-gemeinde-ist-der-plan-fur-1200-neue-wohnungen-in-prenzlauer-berg-vom-tisch-14768405.html" },
  ],
  5: [
    { title: "Berliner Zeitung: 6000 neue Wohnungen im Blankenburger Süden", url: "https://www.berliner-zeitung.de/mensch-metropole/bis-zu-6000-wohnungen-im-blankenburger-sueden-li.110991" },
    { title: "Entwicklungsstadt: Quartier Blankenburger Süden", url: "https://entwicklungsstadt.de/in-pankows-osten-soll-das-quartier-blankenburger-sueden-entstehen/" },
  ],
  10: [
    { title: "Berliner Zeitung: Showdown im Pankower Schlosspark-Kiez", url: "https://www.berliner-zeitung.de/mensch-metropole/streit-um-nachverdichtung-showdown-im-pankower-schlosspark-kiez-li.160157" },
  ],
  11: [
    { title: "Berliner Zeitung: CDU äußert Bedenken gegenüber Alte Schäferei", url: "https://www.berliner-zeitung.de/news/ueberschrift-cdu-fraktion-pankow-aeussert-bedenken-gegenueber-planungen-fuer-die-alte-schaeferei-li.2211909" },
    { title: "Tagesspiegel: Klimaneutraler Kiez der Zukunft", url: "https://www.tagesspiegel.de/berlin/berliner-wirtschaft/streit-um-ambitioniertes-wohnbauprojekt-in-pankow-auf-dieser-wiese-soll-der-klimaneutrale-kiez-der-zukunft-entstehen-11607998.html" },
  ],
  12: [
    { title: "taz: Umstrittenes Bauprojekt in Berlin-Pankow", url: "https://taz.de/Umstrittenes-Bauprojekt-in-Berlin-Pankow/!6094017/" },
    { title: "Berliner Zeitung: Pankow setzt sich im Streit um Nachverdichtung durch", url: "https://www.berliner-zeitung.de/mensch-metropole/bezirk-pankow-setzt-sich-im-streit-um-nachverdichtung-durch-li.184558" },
  ],
  // Reinickendorf
  24: [
    { title: "Berliner Zeitung: Wohnungsbau in der Schlossstraße startet", url: "https://www.berliner-zeitung.de/news/berlin-reinickendorf-wohnungsbau-in-der-schlossstrasse-startet-li.2279014" },
  ],
  // Steglitz-Zehlendorf
  26: [
    { title: "Berliner Zeitung: Neulichterfelde B-Plan verabschiedet, Linke übt Kritik", url: "https://www.berliner-zeitung.de/news/neulichterfelde-bebauungsplan-verabschiedet-linke-uebt-massive-kritik-li.2199244" },
  ],
  27: [
    { title: "Tagesspiegel: Adler Group will Wohnungen im Kreisel nicht fertigstellen", url: "https://www.tagesspiegel.de/berlin/berliner-wirtschaft/nach-dem-stillstand-jetzt-das-ende-adler-group-will-wohnungen-im-hochhaus-am-steglitzer-kreisel-nicht-fertigstellen-15132532.html" },
    { title: "Entwicklungsstadt: Steglitzer Kreisel – Wohnungen 2025 bezugsfertig?", url: "https://www.entwicklungsstadt.de/steglitzer-kreisel-wohnungen-sollen-2025-bezugsfertig-sein/" },
  ],
  // Tempelhof-Schöneberg
  1: [
    { title: "Tagesspiegel: Alles zum Volksentscheid Tempelhofer Feld", url: "https://www.tagesspiegel.de/berlin/alles-was-sie-zum-volksentscheid-wissen-mussen-5165089.html" },
    { title: "Berliner Zeitung: Randbebauung wohl akzeptieren müssen", url: "https://www.berliner-zeitung.de/mensch-metropole/tempelhofer-feld-wir-werden-eine-randbebauung-wohl-akzeptieren-muessen-li.380038" },
  ],
  30: [
    { title: "Berliner Woche: Bewohner im Luckeweg protestieren gegen Abriss", url: "https://www.berliner-woche.de/marienfelde/c-bauen/verbliebene-bewohner-im-luckeweg-protestieren-gegen-abriss_a229939" },
  ],
};

let updated = 0;
for (const [id, urls] of Object.entries(pressData)) {
  await client.execute({
    sql: "UPDATE blocked_projects SET press_urls = ? WHERE id = ?",
    args: [JSON.stringify(urls), parseInt(id)],
  });
  updated++;
}
console.log(`${updated} Projekte mit Pressequellen aktualisiert`);

// Check coverage
const all = await client.execute(
  "SELECT id, title, press_urls FROM blocked_projects"
);
const withPress = all.rows.filter((r) => r[2] && r[2] !== "[]");
const without = all.rows.filter((r) => !r[2] || r[2] === "[]" || r[2] === "null");
console.log(`\nMit Pressequellen: ${withPress.length}/${all.rows.length}`);
if (without.length) {
  console.log("Ohne Pressequellen:");
  for (const r of without) console.log(`  ID:${r[0]} ${r[1]}`);
}
