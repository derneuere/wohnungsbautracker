# Wohnungsbau-Tracker Berlin

Welche Parteien blockieren Neubauprojekte in Berlin? Der Tracker sammelt Bauvorhaben,
die in Berlin nicht vorankommen, benennt die belegbaren Ursachen und rechnet zusammen,
wie viele Wohnungen dadurch nicht entstehen.

**Live: [wohnungsbautracker.de](https://wohnungsbautracker.de)**

Jede Aussage auf einer Projektseite ist mit dem Dokument verlinkt, aus dem sie stammt —
BVV-Drucksachen, Sitzungsprotokolle, amtliche Statistik, Presseberichte. Was sich nicht
belegen ließ, steht nicht in der Bilanz.

---

## Was der Tracker abbildet

**Projekte** (`blocked_projects`) sind der Kern. Jedes hat einen Status
(`blockiert`, `verzögert`, `abgelehnt`, `erledigt`), einen Bezirk, Koordinaten für die
Karte und einen redaktionellen Text mit Fußnotenapparat.

Ein paar Unterscheidungen prägen den ganzen Code:

- **Bestätigte vs. geschätzte Wohnungszahlen.** `unit_count` ist belegt, `unit_count_estimate`
  recherchiert — mit Spanne, Quellen und Konfidenz in `unit_count_estimate_meta`. Beide
  Zahlen bleiben in allen Auswertungen getrennt sichtbar.
- **Blockierer statt Partei.** Die Spalte `party` ist tot. Wer ein Vorhaben aufhält, steht
  in `blockers` als JSON-Liste mit Typ (`partei`, `bürgerinitiative`, `behörde`, `gericht`,
  `umwelt`, `investor`). Die Partei-Bilanz leitet `splitParties` daraus ab — ein Gericht
  oder eine Bürgerinitiative landet damit nicht versehentlich bei einer Partei.
- **Sichtbarkeitsfilter statt Löschen.** Projekte, bei denen die Recherche keine politische
  oder verwaltungsseitige Ursache belegen konnte, werden auf `hidden` gesetzt. Daten und
  Belege bleiben erhalten, aus der öffentlichen Ansicht und allen Summen fallen sie raus.
- **`erledigt` zählt nicht mit.** Vorhaben, die nach jahrelanger Blockade doch fertig
  wurden, bleiben im Tracker — der Verzug ist die Aussage —, gehen aber nicht in die
  Zahl der blockierten Wohnungen ein.

Daneben: `bvv_parties` (Zählgemeinschaften der zwölf Bezirke) und `construction_stats`
(Genehmigungen und Fertigstellungen je Jahr, Amt für Statistik Berlin-Brandenburg).

Stand August 2026: 80 Projekte in der Datenbank, davon 48 öffentlich sichtbar;
Baustatistik 2015–2025.

## Schnellstart

```bash
bun install
```

```bash
bun --bun run dev
```

Läuft dann auf http://localhost:3000. Die Datenbank `sqlite.db` liegt versioniert im
Repo — es braucht kein Seeding und keinen Import, um loszulegen.

Adminbereich: http://localhost:3000/admin (Standardpasswort `wohnungsbau2024`, lokal ok,
in Produktion per `ADMIN_PASSWORD` überschreiben).

## Aufbau

```
src/
  routes/            Dateibasiertes Routing (TanStack Router)
    index.tsx          Startseite: Bilanz, Karte, Projektwall
    projekt/$slug.tsx  Projektseite mit Belegapparat
    lizenzen.tsx       Quellen- und Lizenznachweis
    impressum.tsx      Impressum
    datenschutz.tsx    Datenschutzerklärung
    og/$slug[.]png.ts  Teilen-Vorschaubild pro Projekt
    admin/             Projekte, Baustatistik, BVV-Mehrheiten
  server/            Serverfunktionen — Datenzugriff, Auth, Cache, OG-Rendering
  lib/               Geteilte Ableitungen: design-data.ts (Metriken, Fußnoten,
                     Parteizerlegung), campaign.ts (Designtokens), parties.ts, site.ts
  db/                Drizzle-Schema, Client, DB-Pfad
  components/        BerlinSvgMap (Bezirkskarte), WbtLogo
  scripts/           Einmal-Skripte: BVV-Scraper, Importe, Icon-Erzeugung
public/              Schriften, Icons, Bezirksgeometrie (GeoJSON)
data/                Rohdaten der BVV-Recherche als JSON
```

Zwei Konventionen, die sonst überraschen:

- Alles, was `@tanstack/react-start/server` oder `nitro/storage` anfasst, liegt in einer
  `*.server.ts`-Datei und wird nur aus `createServerOnlyFn`-Rümpfen dynamisch geladen.
  Ein statischer Import wandert über `/admin` in den Client-Graphen und bricht den Build.
- Startseite und Projektseiten werden serverseitig gecacht (300 s, `stale-while-revalidate`).
  Jede schreibende Serverfunktion leert den Cache anschließend selbst — das TTL ist die
  Obergrenze für den Fall, dass das einmal nicht durchkommt, nicht die normale Verzögerung.

## Skripte

| Befehl | Zweck |
| --- | --- |
| `bun --bun run dev` | Entwicklungsserver auf Port 3000 |
| `bun --bun run build` | Produktionsbuild nach `.output/` |
| `bun --bun run preview` | Build lokal ausliefern |
| `bun run icons` | Favicons, App-Icons und `og/default.png` aus `public/favicon.svg` erzeugen |
| `bun run map-data` | `src/lib/berlin-map-data.ts` (SVG-Pfade der Bezirke) aus dem GeoJSON neu erzeugen |
| `bunx drizzle-kit push` | Schemaänderungen auf die lokale `sqlite.db` schreiben |
| `bun migrate.ts` | Fehlende Spalten additiv ergänzen (läuft beim Containerstart) |

Vitest ist eingerichtet (`bun --bun run test`), Testdateien gibt es bislang keine.

Die Skripte unter `src/scripts/` sind Recherchewerkzeuge aus einzelnen Durchgängen, keine
laufende Pipeline: `scrape-bvv.ts` / `scrape-all-bvv.ts` holen Drucksachen aus den
ALLRIS-Systemen der Bezirke, `analyze-bvv.ts` wertet sie aus, die `import-*`- und
`update-*`-Skripte haben ihre Ergebnisse in die Datenbank geschrieben. Sie erwarten
`./sqlite.db` und laufen mit `bun run src/scripts/<datei>.ts`.

## Datenbank

SQLite über Drizzle ORM und `@libsql/client`. Ein einziger Ort bestimmt den Pfad
([src/db/path.ts](src/db/path.ts)): lokal `./sqlite.db`, in Produktion `$DB_PATH`.

**In Produktion ist die Live-Datenbank die Wahrheit.** Sie liegt auf einem persistenten
Volume unter `/app/data/sqlite.db` und wird bei einem Deploy nicht überschrieben — die
Datei im Image dient nur der Erstbefüllung. Redaktionelle Änderungen passieren im
Adminbereich und damit direkt auf dem Volume. Wer lokal an Daten arbeitet, holt sich
den Live-Stand über Export/Import im Adminbereich, statt die Repo-Datei zu committen
und zu hoffen.

Schemaänderungen brauchen beides: `drizzle-kit push` trifft im Docker-Build nur die
Datei im Image. Damit auch die Volume-Datenbank mitkommt, gehört jede neue Spalte
zusätzlich in die Liste in [migrate.ts](migrate.ts) — additiv, idempotent, läuft bei
jedem Containerstart.

## Adminbereich

`/admin` (Projekte), `/admin/stats` (Baustatistik), `/admin/bvv` (Zählgemeinschaften).

Die Anmeldung läuft über ein versiegeltes Session-Cookie; jede schreibende und jede
nicht-öffentliche Serverfunktion ruft zuerst `requireAdmin()`. Das gilt ausdrücklich auch
für Export und Import der kompletten Datenbank — der Import überschreibt die Live-DB und
prüft vorher nur, ob die Datei überhaupt einen SQLite-Header hat.

## Deployment

Docker-Image aus dem [Dockerfile](Dockerfile), deployt über Coolify aus `main`. Der Build
läuft mit Bun, das Laufzeit-Image startet `migrate.ts` und dann den Nitro-Server.

Wichtig: ein persistentes Volume auf `/app/data` mounten, sonst ist bei jedem Deploy
jede redaktionelle Änderung weg.

| Variable | Vorgabe | Bedeutung |
| --- | --- | --- |
| `DB_PATH` | `./sqlite.db` (Image: `/app/data/sqlite.db`) | Ort der Datenbank |
| `ADMIN_PASSWORD` | `wohnungsbau2024` | Passwort des Adminbereichs — in Produktion setzen |
| `SESSION_SECRET` | aus `ADMIN_PASSWORD` abgeleitet | Siegel des Session-Cookies, ≥ 32 Zeichen |
| `VITE_SITE_URL` | `https://wohnungsbautracker.de` | Absolute Adresse für Open-Graph-Tags (Build-Zeit) |
| `HOST` / `PORT` | `0.0.0.0` / `3000` | Bindung des Servers |

Fehlen `ADMIN_PASSWORD` oder `SESSION_SECRET` in Produktion, warnt der Server beim Start —
mit dem Standardpasswort steht der Adminbereich praktisch offen.

## Technik

TanStack Start (React 19, SSR) · TanStack Router mit dateibasiertem Routing · Nitro als
Server und Cache · Drizzle ORM auf SQLite · Tailwind CSS 4 · resvg-wasm für die
Teilen-Vorschaubilder · Bun als Laufzeit und Paketmanager.

## Quellen und Lizenz

Der Tracker wertet ausschließlich öffentlich zugängliche Quellen aus. BVV-Drucksachen und
Protokolle sind amtliche Werke (§ 5 UrhG) und werden zitiert und verlinkt, nicht
gespiegelt. Baustatistik und Bezirksgrenzen stehen unter der Datenlizenz Deutschland
– Namensnennung 2.0. Aus Presseartikeln werden nur einzelne Fakten übernommen, jeweils
mit Titel, Medium und Link. Der vollständige Nachweis steht unter
[/lizenzen](https://wohnungsbautracker.de/lizenzen) und in
[src/routes/lizenzen.tsx](src/routes/lizenzen.tsx).

Der Code steht unter der MIT-Lizenz, siehe [LICENSE](LICENSE) — © 2026 Junge Liberale Berlin.

Fehlt eine Quelle oder ist eine Angabe falsch: ein Hinweis genügt, Kontakt über das
[Impressum](https://julis.berlin/impressum/).
