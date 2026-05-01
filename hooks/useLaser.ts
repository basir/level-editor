"use client"

import { useMemo } from "react"

import { traceLaser } from "@/lib/laser"
import { useEditorStore } from "@/lib/store"

export function useLaser() {
  const grid = useEditorStore((s) => s.grid)
  const playGrid = useEditorStore((s) => s.playGrid)
  const playMode = useEditorStore((s) => s.playMode)
  const activeLevel = useEditorStore((s) => s.activeLevel)

  return useMemo(() => {
    if (!activeLevel) return { beams: [], reached: false }
    const activeGrid = playMode ? playGrid : grid
    return traceLaser(activeGrid, [0, 0])
  }, [grid, playGrid, playMode, activeLevel])
}

