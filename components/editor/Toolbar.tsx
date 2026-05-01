"use client"

import { MIRROR_SYMBOL } from "@/lib/constants"
import { useEditorStore } from "@/lib/store"
import type { MirrorType, ToolType } from "@/lib/types"
import { Button } from "@/components/ui/button"

const tools: ToolType[] = ["stone", "hole", "frozen", "fog", "erase"]
const mirrorTools: MirrorType[] = ["dr", "ur", "dl", "ul"]


export function Toolbar() {
  const activeTool = useEditorStore((s) => s.activeTool)
  const activeMirrorType = useEditorStore((s) => s.activeMirrorType)
  const setTool = useEditorStore((s) => s.setTool)
  const setMirrorType = useEditorStore((s) => s.setMirrorType)
  const togglePlayMode = useEditorStore((s) => s.togglePlayMode)
  const resetPlay = useEditorStore((s) => s.resetPlay)
  const toggleSolutionMode = useEditorStore((s) => s.toggleSolutionMode)
  const toggleSolutionDrawPath = useEditorStore((s) => s.toggleSolutionDrawPath)
  const solutionMode = useEditorStore((s) => s.solutionMode)
  const solutionDrawPath = useEditorStore((s) => s.solutionDrawPath)
  const playMode = useEditorStore((s) => s.playMode)
  const playMovesLeft = useEditorStore((s) => s.playMovesLeft)

  if (playMode) {
    return (
      <div className="rounded border border-editor-border bg-editor-panel p-3">
        <div className="mb-2 text-sm">Moves left: {playMovesLeft}</div>
        <div className="flex gap-2">
          <Button onClick={resetPlay}>Reset</Button>
          <Button onClick={togglePlayMode}>Exit Play</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded border border-editor-border bg-editor-panel p-3">
      <div className="grid grid-cols-4 gap-2">
        {tools.map((tool) => (
          <button
            key={tool}
            onClick={() => setTool(tool)}
            className={`rounded border px-2 py-1 text-xs capitalize ${activeTool === tool ? "border-amber-500 bg-amber-500/20" : "border-editor-border"}`}
          >
            {tool}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {mirrorTools.map((m) => (
          <button
            key={m}
            onClick={() => setMirrorType(m)}
            className={`rounded border p-2 text-lg ${activeTool === "mirror" && activeMirrorType === m ? "border-amber-500 bg-amber-500/20" : "border-editor-border"}`}
          >
            {MIRROR_SYMBOL[m]}
          </button>
        ))}
      </div>
      <Button onClick={togglePlayMode} className="w-full">
        Play
      </Button>
      <Button onClick={toggleSolutionMode} className={`w-full ${solutionMode ? "bg-purple-700 hover:bg-purple-600" : ""}`}>
        {solutionMode ? "Exit Solution Mode" : "Record Solution"}
      </Button>
      {solutionMode ? (
        <Button onClick={toggleSolutionDrawPath} className={`w-full ${solutionDrawPath ? "bg-purple-600 hover:bg-purple-500" : ""}`}>
          {solutionDrawPath ? "Path Draw: ON" : "Mirror Mark: ON"}
        </Button>
      ) : null}
    </div>
  )
}
