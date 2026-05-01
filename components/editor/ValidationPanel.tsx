"use client"

import { useMemo } from "react"

import { useLaser } from "@/hooks/useLaser"
import { findTrapMirrors } from "@/lib/laser"
import { useEditorStore } from "@/lib/store"

export function ValidationPanel() {
  const grid = useEditorStore((s) => s.grid)
  const playGrid = useEditorStore((s) => s.playGrid)
  const playMode = useEditorStore((s) => s.playMode)
  const playMovesLeft = useEditorStore((s) => s.playMovesLeft)
  const activeLevel = useEditorStore((s) => s.activeLevel)
  const { beams, reached } = useLaser()
  const activeGrid = playMode ? playGrid : grid
  const trapCount = useMemo(() => findTrapMirrors(activeGrid).size, [activeGrid])
  const mirrorCount = useMemo(
    () => activeGrid.flat().filter((c) => c && typeof c === "object" && c.type === "mirror").length,
    [activeGrid]
  )

  return (
    <div className="rounded border border-editor-border bg-editor-panel p-3 text-sm">
      <div>Laser Status: {reached ? "REACHES TARGET" : "BLOCKED"}</div>
      <div>Path cells: {beams.length}</div>
      <div>Mirrors placed: {mirrorCount}</div>
      <div>Trap mirrors: {trapCount}</div>
      <div>Move limit: {activeLevel?.moveLimit ?? 0}</div>
      {playMode ? <div>Play moves left: {playMovesLeft}</div> : null}
    </div>
  )
}
