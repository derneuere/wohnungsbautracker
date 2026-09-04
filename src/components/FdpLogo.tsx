// FDP-Logo: Wortmarke „FDP" in Dunkelblau (auf dunklem Grund per color-Prop in Weiß).
const BLUE = '#0B2B6B'

// Wortmarke „FDP" (Pfade aus fdp.de), Original-viewBox 83 318.646 767.92 295.354
const FDP_PATHS = [
  'M300.586 318.646V380.281H159.941V440.676H281.558V500.242H159.941V614H83V318.646H300.586Z',
  'M443.59 318.646H316.182V614H445.244C532.113 614 587.958 561.879 587.958 465.081C587.958 372.421 532.113 318.646 443.59 318.646ZM423.227 552.366H393.123V380.281H426.722C478.695 380.281 511.017 406.049 511.017 465.012C511.017 530.09 482.628 552.366 423.227 552.366Z',
  'M745.022 318.646C807.486 318.646 850.92 350.497 850.92 414.201C850.92 481.215 816.172 515.548 744.196 515.548H680.905V614H603.964V318.646H745.022ZM733.854 455.982C758.26 455.982 773.979 444.812 773.979 419.165C773.979 393.104 757.847 380.281 733.854 380.281H680.905V455.982H733.854Z',
]

export default function FdpLogo({ height = 32, color = BLUE }: { height?: number; color?: string }) {
  const vb = { x: 83, y: 318.646, w: 767.92, h: 295.354 }
  return (
    <svg
      height={height}
      width={height * (vb.w / vb.h)}
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      role="img"
      aria-label="FDP"
    >
      <title>FDP</title>
      <g fill={color}>
        {FDP_PATHS.map((d) => (
          <path key={d.slice(0, 12)} d={d} />
        ))}
      </g>
    </svg>
  )
}
