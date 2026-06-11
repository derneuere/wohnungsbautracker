// Kampagnen-Logo „Lichter an": Wohnblock, in dem erst drei Fenster leuchten.
const BLUE = '#0B2B6B'
const YELLOW = '#FFED00'

const display = { fontFamily: "'Archivo Black', 'Arial Black', sans-serif" }

const COLS = [7, 17, 27]
const ROWS = [6, 15, 24, 33]
const LIT = new Set(['0-1', '1-3', '2-0'])

export default function WbtLogo({ height = 32 }: { height?: number }) {
  const vb = { w: 152, h: 44 }
  return (
    <svg
      height={height}
      width={height * (vb.w / vb.h)}
      viewBox={`0 0 ${vb.w} ${vb.h}`}
      role="img"
      aria-label="Wohnungsbau-Tracker Berlin"
    >
      <title>Wohnungsbau-Tracker Berlin</title>
      <rect x="0" y="0" width="40" height="44" rx="3" fill={BLUE} />
      {COLS.map((cx, ci) =>
        ROWS.map((ry, ri) => (
          <rect
            key={`${ci}-${ri}`}
            x={cx}
            y={ry}
            width="6"
            height="6"
            fill={LIT.has(`${ci}-${ri}`) ? YELLOW : '#23448C'}
          />
        )),
      )}
      <text x="52" y="35" fontSize="32" textLength="84" lengthAdjust="spacingAndGlyphs" fill={BLUE} style={display}>
        WBT
      </text>
    </svg>
  )
}
