"use client"

import { useEffect } from "react"

import { Grid } from "@/components/editor/Grid"
import { LevelMeta } from "@/components/editor/LevelMeta"
import { PieceQueue } from "@/components/editor/PieceQueue"
import { Toolbar } from "@/components/editor/Toolbar"
import { TrapWarning } from "@/components/editor/TrapWarning"
import { ValidationPanel } from "@/components/editor/ValidationPanel"
import { SolutionPanel } from "@/components/editor/SolutionPanel"
import { ExportPanel } from "@/components/export/ExportPanel"
import { WorldList } from "@/components/sidebar/WorldList"
import { downloadTextFile } from "@/lib/export"
import { useEditorStore } from "@/lib/store"

export default function Page() {
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const saveLevel = useEditorStore((s) => s.saveLevel)
  const setTool = useEditorStore((s) => s.setTool)
  const setMirrorType = useEditorStore((s) => s.setMirrorType)
  const exportWorldJSON = useEditorStore((s) => s.exportWorldJSON)
  const activeWorldId = useEditorStore((s) => s.activeWorldId)
  const playMode = useEditorStore((s) => s.playMode)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        saveLevel()
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && e.shiftKey) {
        e.preventDefault()
        redo()
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "e") {
        e.preventDefault()
        downloadTextFile(`world-${activeWorldId}.json`, exportWorldJSON(activeWorldId))
      }
      if (playMode) return
      if (e.key === "1") setTool("stone")
      if (e.key === "2") setTool("hole")
      if (e.key === "3") {
        setMirrorType("dr")
      }
      if (e.key === "4") {
        setMirrorType("ur")
      }
      if (e.key === "5") {
        setMirrorType("dl")
      }
      if (e.key === "6") {
        setMirrorType("ul")
      }
      if (e.key === "7") setTool("fog")
      if (e.key === "8") setTool("prefill")
      if (e.key.toLowerCase() === "s") setTool("source")
      if (e.key.toLowerCase() === "t") setTool("target")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [activeWorldId, exportWorldJSON, playMode, redo, saveLevel, setMirrorType, setTool, undo])

  return (
    <main className="h-screen bg-editor-bg p-3 text-zinc-100">
      <div className="grid h-full grid-cols-[240px_1fr_320px] gap-3">
        <WorldList />
        <section className="flex items-center justify-center rounded border border-editor-border bg-editor-panel p-3">
          <Grid />
        </section>
        <section className="space-y-3 overflow-auto">
          <Toolbar />
          <TrapWarning />
          <ValidationPanel />
          <SolutionPanel />
          <PieceQueue />
          <LevelMeta />
          <ExportPanel />
        </section>
      </div>
    </main>
  )
}
