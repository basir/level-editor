import { runLineClear } from './lib/laser'
import { GridCell } from './lib/types'

const GRID_SIZE = 10

function testFrozenClear() {
  const grid: GridCell[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null))

  // Permanent dividers to create segments
  grid[0][4] = { type: 'mirror', mirror: 'dr' }
  grid[4][0] = { type: 'mirror', mirror: 'dr' }

  // Row 1 segment (1,0) to (1,3) - need to fill up to (1,9) or add divider
  grid[1][0] = { type: 'stone' }
  grid[1][1] = { type: 'frozen', lives: 2 }
  grid[1][2] = { type: 'stone' }
  grid[1][3] = { type: 'stone' }
  grid[1][4] = 'hole' // Add divider at (1,4) to make segment (1,0)-(1,3) complete

  // Col 1 segment (0,1) to (3,1)
  grid[0][1] = { type: 'stone' }
  // (1,1) is frozen
  grid[2][1] = { type: 'stone' }
  grid[3][1] = { type: 'stone' }
  grid[4][1] = 'hole' // Add divider at (4,1) to make segment (0,1)-(3,1) complete

  // 2. Frozen cell with 1 hit at (1,5) - part of Row 1 segment (1,5) to (1,9)
  grid[1][5] = { type: 'frozen', lives: 2 }
  grid[1][6] = { type: 'stone' }
  grid[1][7] = { type: 'stone' }
  grid[1][8] = { type: 'stone' }
  grid[1][9] = { type: 'stone' }
  // (1,4) is already a hole, so (1,5)-(1,9) is a separate segment.

  console.log('Testing frozen cell clearing...')
  const result = runLineClear(grid)

  console.log('Cleared Lines:', result.clearedLines)

  // Intersection frozen cell should be cleared (2 hits, 2 lives)
  const intersectCleared = result.grid[1][1] === null
  console.log('Intersection frozen cell cleared:', intersectCleared)

  // Single-hit frozen cell should remain with 1 life
  const singleHitCell = result.grid[1][5]
  const singleHitRemains = singleHitCell !== null && typeof singleHitCell === 'object' && singleHitCell.type === 'frozen' && singleHitCell.lives === 1
  console.log('Single-hit frozen cell remains with 1 life:', singleHitRemains)

  // Regular stones should be cleared
  const stonesCleared = result.grid[1][0] === null && result.grid[0][1] === null
  console.log('Regular stones cleared:', stonesCleared)

  if (intersectCleared && singleHitRemains && stonesCleared) {
    console.log('SUCCESS: Frozen cell logic verified.')
  } else {
    console.error('FAILURE: Frozen cell logic incorrect.')
  }
}

testFrozenClear()
