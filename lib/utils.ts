import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"



import md5 from 'js-md5'
import { GridCell, PieceShape, SolutionMove } from './types'
import { PIECE_SHAPES } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Mimics Python's str(tuple) for deterministic hashing.
 */
function pythonTupleStr(elems: any[]): string {
  if (elems.length === 0) return '()'
  if (elems.length === 1) {
    const val = elems[0];
    return `(${val},)`
  }
  return `(${elems.join(', ')})`
}

export function levelFingerprint(grid: GridCell[][], solutionMoves: SolutionMove[]): string {
  const prefilled: [number, number][] = []
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] !== null) {
        prefilled.push([r, c])
      }
    }
  }

  // prefilled_key = tuple(sorted((c["row"], c["col"]) for c in prefilled))
  const prefilledSorted = [...prefilled].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const prefilledKey = pythonTupleStr(prefilledSorted.map(p => pythonTupleStr(p)))

  // shapes_key = tuple(sorted(tuple(tuple(cell) for cell in s) for s in solution_shapes))
  const solutionShapes = solutionMoves.map(move => {
    const relativeCells = PIECE_SHAPES[move.piece_name as PieceShape] || []
    const absoluteCells = relativeCells.map(([dr, dc]) => [move.row + dr, move.col + dc] as [number, number])
    const sortedCells = [...absoluteCells].sort((a, b) => a[0] - b[0] || a[1] - b[1])
    return pythonTupleStr(sortedCells.map(c => pythonTupleStr(c)))
  })

  const shapesKey = pythonTupleStr([...solutionShapes].sort())

  const raw = prefilledKey + shapesKey
  return md5(raw)
}
