"use client"

import { useEditorStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

export function SolutionPanel() {
  const activeLevel = useEditorStore((s) => s.activeLevel)
  const clearSolutionPath = useEditorStore((s) => s.clearSolutionPath)

  if (!activeLevel) return null

  return (
    <div className="space-y-2 rounded border border-editor-border bg-editor-panel p-3 text-sm">
      <div className="font-semibold">Solution Data</div>
      <div>Mirrors: {activeLevel.solutionMirrors.length}</div>
      <div>Path points: {activeLevel.solutionPath.length}</div>
      <Button variant="secondary" className="text-xs" onClick={clearSolutionPath}>
        Clear Path
      </Button>
    </div>
  )
}
