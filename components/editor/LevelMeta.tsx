"use client"

import { useEditorStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function LevelMeta() {
  const activeLevel = useEditorStore((s) => s.activeLevel)
  const setLevelName = useEditorStore((s) => s.setLevelName)
  const setMoveLimit = useEditorStore((s) => s.setMoveLimit)
  const setLevelNotes = useEditorStore((s) => s.setLevelNotes)
  const saveLevel = useEditorStore((s) => s.saveLevel)

  if (!activeLevel) return null

  return (
    <div className="space-y-2 rounded border border-editor-border bg-editor-panel p-3">
      <div className="text-sm font-semibold">Level Meta</div>
      <Input value={activeLevel.name} onChange={(e) => setLevelName(e.target.value)} />
      <Input type="number" value={activeLevel.moveLimit} onChange={(e) => setMoveLimit(Number(e.target.value))} />
      <Textarea value={activeLevel.notes} onChange={(e) => setLevelNotes(e.target.value)} className="h-20" />
      <Button onClick={saveLevel} className="w-full bg-blue-700 hover:bg-blue-600">Save</Button>
    </div>
  )
}
