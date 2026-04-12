import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { blockedProjects } from "../db/schema";
import { eq } from "drizzle-orm";

const client = createClient({ url: "file:./sqlite.db" });
const db = drizzle(client);

const projects = [
  {
    title: "B-Plan Hubertusallee 1 – Bürohochhaus statt Wohnungen",
    description:
      'Geplantes Bürohochhaus in Halensee. DIE LINKE fordert per BVV-Beschluss "B-Plan stoppen" und stattdessen Wohnungsbau. SPD verzögert mit Anforderungen für Wind- und Bodengutachten (Drucksachen 0782/6, 0823/6, 0820/6).',
    lat: 52.4942,
    lng: 13.2948,
    party: "Linke",
    bezirk: "Charlottenburg-Wilmersdorf",
    status: "blockiert",
    date: "20.02.2025",
    sourceUrl:
      "https://bvv-charlottenburg-wilmersdorf.berlin.de/pi-r/vo020_r.asp?VOLFDNR=8876",
  },
  {
    title: "Signa-Bauvorhaben am Kurfürstendamm",
    description:
      'Signa-Bauprojekt am Kurfürstendamm. DIE LINKE fordert per zwei Beschlüssen den Stopp des Bebauungsplans: "Bebauungsplan von Signa am Kurfürstendamm stoppen!" (0698/6) und "Arbeit am Bebauungsplan sofort einstellen!" (0373/6).',
    lat: 52.5025,
    lng: 13.3325,
    party: "Linke",
    bezirk: "Charlottenburg-Wilmersdorf",
    status: "blockiert",
    date: "16.01.2024",
    sourceUrl:
      "https://bvv-charlottenburg-wilmersdorf.berlin.de/pi-r/vo020_r.asp?VOLFDNR=8792",
  },
  {
    title: "Veränderungssperre Wiesbadener Straße 51",
    description:
      "Verlängerung der Veränderungssperre (Bau-Freeze) für das Grundstück Wiesbadener Straße 51 in Wilmersdorf (0461/6). SPD-Fraktion versucht den Bebauungsplan voranzutreiben (0830/6), wird aber durch die Sperre blockiert.",
    lat: 52.4875,
    lng: 13.3155,
    party: "Grüne",
    bezirk: "Charlottenburg-Wilmersdorf",
    status: "verzögert",
    date: "29.06.2023",
    sourceUrl:
      "https://bvv-charlottenburg-wilmersdorf.berlin.de/pi-r/vo020_r.asp?VOLFDNR=8555",
  },
  {
    title: "Kommerzieller Stadionneubau im Olympiapark",
    description:
      'DIE LINKE lehnt kommerziellen Stadionneubau im Olympiapark per BVV-Beschluss ab: "Kein kommerzieller Stadionneubau im Olympiapark!" (0106/6). Stadtentwicklungsprojekt blockiert.',
    lat: 52.5164,
    lng: 13.2392,
    party: "Linke",
    bezirk: "Charlottenburg-Wilmersdorf",
    status: "abgelehnt",
    date: "07.09.2023",
    sourceUrl:
      "https://bvv-charlottenburg-wilmersdorf.berlin.de/pi-r/vo020_r.asp?VOLFDNR=8202",
  },
];

async function importProjects() {
  console.log("Importiere BVV-Projekte nach Charlottenburg-Wilmersdorf...\n");

  for (const project of projects) {
    // Check for duplicates by title
    const existing = await db
      .select()
      .from(blockedProjects)
      .where(eq(blockedProjects.title, project.title));

    if (existing.length > 0) {
      console.log(`  SKIP: "${project.title}" (existiert bereits)`);
      continue;
    }

    await db.insert(blockedProjects).values(project);
    console.log(`  OK: "${project.title}" (${project.status})`);
  }

  console.log("\nImport abgeschlossen!");

  // Show all projects in Charlottenburg-Wilmersdorf
  const allCW = await db
    .select()
    .from(blockedProjects)
    .where(eq(blockedProjects.bezirk, "Charlottenburg-Wilmersdorf"));
  console.log(
    `\nGesamt in Charlottenburg-Wilmersdorf: ${allCW.length} Projekte`
  );
  for (const p of allCW) {
    console.log(`  [${p.status}] ${p.title} (${p.party})`);
  }
}

importProjects().catch((err) => {
  console.error("Import fehlgeschlagen:", err);
  process.exit(1);
});
