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
  dr: { right: 'down', down: 'right' },
  dl: { left: 'down', down: 'left' },
  ur: { right: 'up', up: 'right' },
  ul: { left: 'up', up: 'left' },
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

    if (type === 'stone' || type === 'hole' || type === 'frozen' || type === 'fog') break


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

const PERMANENT = new Set(['mirror', 'hole', 'source', 'target'])

export function getSegments(lineCells: [number, number][], grid: GridCell[][]): [number, number][][] {
  const segments: [number, number][][] = []
  let current: [number, number][] = []

  for (const [r, c] of lineCells) {
    const cell = grid[r][c]
    const ctype = typeof cell === 'object' && cell ? cell.type : (cell ?? 'empty')
    if (PERMANENT.has(ctype as string)) {
      if (current.length) {
        segments.push(current)
        current = []
      }
    } else {
      current.push([r, c])
    }
  }
  if (current.length) segments.push(current)
  return segments.filter((s) => s.length > 0)
}

export function segmentIsComplete(segment: [number, number][], grid: GridCell[][]): boolean {
  return segment.every(([r, c]) => grid[r][c] !== null && grid[r][c] !== undefined)
}

export function getBorderingMirrors(
  segment: [number, number][],
  lineCells: [number, number][],
  grid: GridCell[][]
): [number, number][] {
  const segSet = new Set(segment.map(([r, c]) => `${r},${c}`))
  const result: [number, number][] = []
  const added = new Set<string>()

  for (let i = 0; i < lineCells.length; i++) {
    const [r, c] = lineCells[i]
    if (!segSet.has(`${r},${c}`)) continue
    for (const ni of [i - 1, i + 1]) {
      if (ni < 0 || ni >= lineCells.length) continue
      const [nr, nc] = lineCells[ni]
      const key = `${nr},${nc}`
      if (!segSet.has(key) && !added.has(key)) {
        const ncell = grid[nr][nc]
        const nctype = typeof ncell === 'object' && ncell ? ncell.type : ncell
        if (nctype === 'mirror') {
          result.push([nr, nc])
          added.add(key)
        }
      }
    }
  }
  return result
}

export function findTrapMirrors(grid: GridCell[][]): Set<string> {
  const danger = new Set<string>()

  for (let r = 0; r < 10; r++) {
    const line = Array.from({ length: 10 }, (_, c): [number, number] => [r, c])
    const segs = getSegments(line, grid)
    for (const seg of segs) {
      const empty = seg.filter(([r2, c2]) => grid[r2][c2] === null).length
      if (empty !== 1) continue
      // This segment is a trap — find bordering mirrors
      for (const [mr, mc] of getBorderingMirrors(seg, line, grid)) {
        danger.add(`${mr},${mc}`)
      }
    }
  }

  for (let c = 0; c < 10; c++) {
    const line = Array.from({ length: 10 }, (_, r): [number, number] => [r, c])
    const segs = getSegments(line, grid)
    for (const seg of segs) {
      const empty = seg.filter(([r2, c2]) => grid[r2][c2] === null).length
      if (empty !== 1) continue
      for (const [mr, mc] of getBorderingMirrors(seg, line, grid)) {
        danger.add(`${mr},${mc}`)
      }
    }
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

  // Check rows
  for (let r = 0; r < GRID_SIZE; r++) {
    const lineCells = Array.from({ length: GRID_SIZE }, (_, c): [number, number] => [r, c])
    const segments = getSegments(lineCells, newGrid)
    for (const seg of segments) {
      if (segmentIsComplete(seg, newGrid)) {
        // Clear mirrors bordering this segment
        const mirrors = getBorderingMirrors(seg, lineCells, newGrid)
        for (const [mr, mc] of mirrors) {
          newGrid[mr][mc] = null
          clearedMirrors++
        }
        // Clear segment cells
        for (const [sr, sc] of seg) {
          newGrid[sr][sc] = null
        }
        clearedLines++
      }
    }
  }

  // Check columns
  for (let c = 0; c < GRID_SIZE; c++) {
    const lineCells = Array.from({ length: GRID_SIZE }, (_, r): [number, number] => [r, c])
    const segments = getSegments(lineCells, newGrid)
    for (const seg of segments) {
      if (segmentIsComplete(seg, newGrid)) {
        // Clear mirrors bordering this segment
        const mirrors = getBorderingMirrors(seg, lineCells, newGrid)
        for (const [mr, mc] of mirrors) {
          newGrid[mr][mc] = null
          clearedMirrors++
        }
        // Clear segment cells
        for (const [sr, sc] of seg) {
          newGrid[sr][sc] = null
        }
        clearedLines++
      }
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

