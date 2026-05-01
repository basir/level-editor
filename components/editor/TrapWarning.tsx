"use client"

import { useMemo } from "react"

import { findTrapMirrors } from "@/lib/laser"
import { useEditorStore } from "@/lib/store"

export function TrapWarning() {
  const grid = useEditorStore((s) => s.grid)
  const traps = useMemo(() => Array.from(findTrapMirrors(grid)), [grid])
  if (traps.length === 0) return <div className="rounded border border-editor-border bg-editor-panel p-3 text-xs text-zinc-300">No trap mirrors.</div>

  return (
    <div className="rounded border border-red-700 bg-red-950/30 p-3">
      <div className="text-sm font-semibold text-red-300">Trap Mirrors: {traps.length}</div>
      <div className="mt-1 space-y-1 text-xs text-red-200">
        {traps.map((key) => (
          <div key={key}>Mirror at ({key}) is in a near-full line</div>
        ))}
      </div>
    </div>
  )
}
