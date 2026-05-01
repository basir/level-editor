import { GRID_SIZE } from '@/lib/constants'
import type { BeamSegment, Dir, GridCell } from '@/lib/types'

type Vec = [number, number]

const DIR_VEC: Record<Dir, Vec> = {
  right: [0, 1],
  down: [1, 0],
  left: [0, -1],
  up: [-1, 0],
}

// Reflection rules for each mirror type.
// Important: the incoming direction names in the rules (left/right/up/down)
// refer to the side the beam ENTERS the mirror from, not the beam's travel
// direction through the grid.
//
// The tracer's `Dir` represents the beam's travel direction at the mirror.
// Therefore we map prompt directions to travel directions like this:
//   enter-from left  -> travel right
//   enter-from right -> travel left
//   enter-from up    -> travel down
//   enter-from down  -> travel up
//
// If an incoming travel direction is not present for a mirror, the beam
// is blocked/stops at the mirror.
const MIRROR_REFLECT: Record<string, Partial<Record<Dir, Dir>>> = {
  // ◢ (dr)
  // left>up  means: enter from left  -> travel right -> exits up
  // up>left  means: enter from up    -> travel down  -> exits left
  // right or down are blocked
  dr: { right: 'up', down: 'left' },

  // ◣ (dl)
  // up>right   : enter from up    -> travel down  -> exits right
  // right>up  : enter from right -> travel left  -> exits up
  // left or down are blocked
  dl: { down: 'right', left: 'up' },

  // ◥ (ul)
  // left>down  : enter from left -> travel right -> exits down
  // down>left  : enter from down -> travel up    -> exits left
  // right or up are blocked
  ul: { right: 'down', up: 'left' },

  // ◤ (ur)
  // right>down : enter from right -> travel left -> exits down
  // down>right : enter from down  -> travel up   -> exits right
  // left or up are blocked
  ur: { left: 'down', up: 'right' },
}

function dirFromVec(dr: number, dc: number): Dir {
  if (dr === 0 && dc === 1) return 'right'
  if (dr === 1 && dc === 0) return 'down'
  if (dr === 0 && dc === -1) return 'left'
  return 'up'
}

export function traceLaser(
  grid: GridCell[][],
  source: [number, number],
  startDir: Dir = 'right'
): { beams: BeamSegment[]; reached: boolean } {
  const beams: BeamSegment[] = []
  const seen = new Set<string>()
  let [r, c] = source
  let [dr, dc] = DIR_VEC[startDir]
  let reached = false

  for (let i = 0; i < 300; i++) {
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) break
    const key = `${r},${c},${dr},${dc}`
    if (seen.has(key)) break
    seen.add(key)

    const cell = grid[r][c]
    const type = typeof cell === 'object' && cell !== null ? cell.type : cell

    if (type === 'stone' || type === 'prefill' || type === 'hole') break

    beams.push({ r, c, dr, dc })

    if (cell && typeof cell === 'object' && cell.type === 'target') {
      reached = true
      break
    }

    if (cell && typeof cell === 'object' && cell.type === 'mirror') {
      const dirIn = dirFromVec(dr, dc)
      const reflect = MIRROR_REFLECT[cell.mirror]
      const dirOut = reflect?.[dirIn]
      if (!dirOut) break
      ;[dr, dc] = DIR_VEC[dirOut]
    }

    r += dr
    c += dc
  }

  return { beams, reached }
}

export function findTrapMirrors(grid: GridCell[][]): Set<string> {
  const danger = new Set<string>()

  for (let r = 0; r < GRID_SIZE; r++) {
    const mirrors: string[] = []
    let empty = 0
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = grid[r][c]
      const type = typeof cell === 'object' && cell ? cell.type : cell
      if (type === 'mirror') mirrors.push(`${r},${c}`)
      if (!cell) empty++
    }
    if (mirrors.length > 0 && empty === 1) mirrors.forEach((k) => danger.add(k))
  }

  for (let c = 0; c < GRID_SIZE; c++) {
    const mirrors: string[] = []
    let empty = 0
    for (let r = 0; r < GRID_SIZE; r++) {
      const cell = grid[r][c]
      const type = typeof cell === 'object' && cell ? cell.type : cell
      if (type === 'mirror') mirrors.push(`${r},${c}`)
      if (!cell) empty++
    }
    if (mirrors.length > 0 && empty === 1) mirrors.forEach((k) => danger.add(k))
  }

  return danger
}

export function runLineClear(grid: GridCell[][]): {
  grid: GridCell[][]
  clearedMirrors: number
  clearedLines: number
} {
  const newGrid = grid.map((row) => [...row])
  let clearedMirrors = 0
  let clearedLines = 0
  const isBoundary = (cell: GridCell) =>
    cell === 'hole' ||
    (cell &&
      typeof cell === 'object' &&
      (cell.type === 'source' || cell.type === 'target'))

  for (let r = 0; r < GRID_SIZE; r++) {
    let segmentStart = 0
    for (let c = 0; c <= GRID_SIZE; c++) {
      const atEdge = c === GRID_SIZE
      const cell = atEdge ? null : newGrid[r][c]
      if (!atEdge && !isBoundary(cell)) continue
      const segment = newGrid[r].slice(segmentStart, c)
      const full = segment.length > 0 && segment.every((item) => item !== null)
      if (full) {
        for (let cc = segmentStart; cc < c; cc++) {
          const item = newGrid[r][cc]
          if (item && typeof item === 'object' && item.type === 'mirror')
            clearedMirrors++
          newGrid[r][cc] = null
        }
        clearedLines++
      }
      segmentStart = c + 1
    }
  }

  for (let c = 0; c < GRID_SIZE; c++) {
    let segmentStart = 0
    for (let r = 0; r <= GRID_SIZE; r++) {
      const atEdge = r === GRID_SIZE
      const cell = atEdge ? null : newGrid[r][c]
      if (!atEdge && !isBoundary(cell)) continue
      let full = r > segmentStart
      for (let rr = segmentStart; rr < r; rr++) {
        if (newGrid[rr][c] === null) {
          full = false
          break
        }
      }
      if (full) {
        for (let rr = segmentStart; rr < r; rr++) {
          const item = newGrid[rr][c]
          if (item && typeof item === 'object' && item.type === 'mirror') {
            clearedMirrors++
          }
          newGrid[rr][c] = null
        }
        clearedLines++
      }
      segmentStart = r + 1
    }
  }

  return { grid: newGrid, clearedMirrors, clearedLines }
}

export function runLineClearCascade(grid: GridCell[][]) {
  let current = grid
  let totalClearedMirrors = 0
  let totalClearedLines = 0

  while (true) {
    const result = runLineClear(current)
    if (result.clearedLines === 0) break
    current = result.grid
    totalClearedMirrors += result.clearedMirrors
    totalClearedLines += result.clearedLines
  }

  return {
    grid: current,
    clearedMirrors: totalClearedMirrors,
    clearedLines: totalClearedLines,
  }
}
