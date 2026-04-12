export const PARTY_COLORS: Record<string, string> = {
  CDU: '#000000',
  SPD: '#E3000F',
  'Grüne': '#46962B',
  Linke: '#BE3075',
  FDP: '#FFED00',
  AfD: '#009EE0',
  BSW: '#8B0000',
}

export const PARTY_TEXT_COLORS: Record<string, string> = {
  CDU: '#FFFFFF',
  SPD: '#FFFFFF',
  'Grüne': '#FFFFFF',
  Linke: '#FFFFFF',
  FDP: '#000000',
  AfD: '#FFFFFF',
  BSW: '#FFFFFF',
}

export const PARTIES = Object.keys(PARTY_COLORS)

export const BEZIRKE = [
  'Charlottenburg-Wilmersdorf',
  'Friedrichshain-Kreuzberg',
  'Lichtenberg',
  'Marzahn-Hellersdorf',
  'Mitte',
  'Neukölln',
  'Pankow',
  'Reinickendorf',
  'Spandau',
  'Steglitz-Zehlendorf',
  'Tempelhof-Schöneberg',
  'Treptow-Köpenick',
] as const

export const STATUS_OPTIONS = ['blockiert', 'verzögert', 'abgelehnt'] as const
