/**
 * Absolute Adresse der Seite.
 *
 * Open-Graph-Bilder und -URLs müssen absolut sein — relative Pfade ignorieren
 * alle Crawler. Anpassbar über VITE_SITE_URL (Build-Zeit), sonst der aktuelle
 * Live-Host.
 */
const roh = (import.meta.env?.VITE_SITE_URL as string | undefined) ?? 'https://wohnungsbautracker.de'

export const SITE_URL = roh.replace(/\/+$/, '')
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '')

/** Macht aus einem Pfad eine absolute URL für meta-Tags. */
export function absolut(pfad: string): string {
  return `${SITE_URL}${pfad.startsWith('/') ? pfad : `/${pfad}`}`
}
