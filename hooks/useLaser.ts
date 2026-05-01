"use client"

import { useMemo } from "react"

import { traceLaser } from "@/lib/laser"
import { useEditorStore } from "@/lib/store"

export function useLaser() {
  const grid = useEditorStore((s) => s.grid)
  const playGrid = useEditorStore((s) => s.playGrid)
  const playMode = useEditorStore((s) => s.playMode)
  const solutionMode = useEditorStore((s) => s.solutionMode)
  const activeLevel = useEditorStore((s) => s.activeLevel)

  return useMemo(() => {
    if (!activeLevel) return { beams: [], reached: false }
    const activeGrid = (playMode || solutionMode) ? playGrid : grid
    const sourcePos = findSource(activeGrid)
    if (!sourcePos) return { beams: [], reached: false }
    const sourceCell = activeGrid[sourcePos[0]][sourcePos[1]] as any
    return traceLaser(activeGrid, sourcePos, sourceCell?.dir || 'right')
  }, [grid, playGrid, playMode, solutionMode, activeLevel])
}

function findSource(grid: any[][]): [number, number] | null {
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const cell = grid[r][c]
      if (cell && typeof cell === 'object' && cell.type === 'source') return [r, c]
    }
  }
  return null
}

