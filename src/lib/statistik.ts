// GoatCounter-Events für Klicks auf externe Belege. Gezählt wird ausschließlich
// die Kategorie — welche Adresse genau, von welcher Projektseite aus oder wer
// geklickt hat, wird nicht erfasst. Das deckt sich mit der Zusage auf
// /datenschutz („nur Summen“); wer die Kategorien erweitert, muss auch den
// Text dort nachziehen.
//
// count.js kommt aus dem Root-Layout. Fehlt window.goatcounter (Adblocker,
// /admin, Script noch nicht geladen), verpufft der Aufruf folgenlos; auf
// localhost filtert count.js selbst. Der Zähltreffer geht per sendBeacon raus
// und übersteht damit auch den sofortigen Tab-Wechsel durch target="_blank".
export type BelegKategorie = 'drucksache' | 'beleg' | 'quelle'

export function zaehleBelegKlick(kategorie: BelegKategorie) {
  ;(window as any).goatcounter?.count?.({ path: `out/${kategorie}`, event: true })
}
