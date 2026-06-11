// Design-Token des Kampagnen-Designs — von Startseite, Projektseiten und Admin geteilt.
export const BLUE = '#0B2B6B'
export const DEEP = '#02173A'
export const YELLOW = '#FFED00'
export const CYAN = '#1CB5E5'
export const BLACK = '#111111'

export const display = { fontFamily: "'Archivo Black', 'Arial Black', sans-serif" } as const
export const body = { fontFamily: "'Archivo', 'Helvetica Neue', sans-serif" } as const

export const STATUS_CHIP: Record<string, { bg: string; fg: string; label: string }> = {
  blockiert: { bg: BLACK, fg: YELLOW, label: 'BLOCKIERT' },
  'verzögert': { bg: CYAN, fg: '#fff', label: 'VERZÖGERT' },
  abgelehnt: { bg: '#fff', fg: BLUE, label: 'ABGELEHNT' },
}

export const ARCHIVO_FONT_LINKS = [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' as const },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700;800&display=swap',
  },
]
