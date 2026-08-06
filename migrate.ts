// Ergänzt beim Start fehlende Spalten auf der Live-Datenbank.
//
// Hintergrund: `drizzle-kit push` läuft nur im Docker-Build und trifft dort die
// DB im Image — nicht die Datei auf dem persistenten Volume unter $DB_PATH.
// Ohne diesen Schritt liefe neuer Code gegen ein altes Schema und jede Abfrage
// würde mit "no such column" scheitern.
//
// Additiv und idempotent: legt nur nullable Spalten an, die noch fehlen, und
// rührt vorhandene Daten nicht an.

import { Database } from 'bun:sqlite'

const DB_PATH = process.env.DB_PATH ?? './sqlite.db'

const SPALTEN: Array<{ tabelle: string; name: string; typ: string }> = [
  { tabelle: 'blocked_projects', name: 'hidden', typ: 'integer default 0' },
  { tabelle: 'blocked_projects', name: 'political_responsibility', typ: 'text' },
  { tabelle: 'blocked_projects', name: 'political_responsibility_meta', typ: 'text' },
]

const db = new Database(DB_PATH)
let ergaenzt = 0

for (const { tabelle, name, typ } of SPALTEN) {
  const vorhanden = db
    .query(`pragma table_info(${tabelle})`)
    .all()
    .some((c: any) => c.name === name)
  if (vorhanden) continue
  db.run(`alter table ${tabelle} add column ${name} ${typ}`)
  console.log(`[migrate] Spalte ${tabelle}.${name} ergänzt`)
  ergaenzt++
}

// Alte Zeilen haben nach dem ALTER noch NULL — auf den Vorgabewert setzen,
// damit der Sichtbarkeitsfilter nicht auf NULL-Vergleiche angewiesen ist.
if (SPALTEN.some((s) => s.name === 'hidden')) {
  db.run(`update blocked_projects set hidden = 0 where hidden is null`)
}

console.log(ergaenzt ? `[migrate] ${ergaenzt} Spalte(n) ergänzt.` : '[migrate] Schema aktuell.')
db.close()
