"use client"

import { useRef } from "react"

import { toast } from "sonner"

import { downloadBlob, downloadTextFile, exportAllToZip } from "@/lib/export"
import { useEditorStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

export function ExportPanel() {
  const worlds = useEditorStore((s) => s.worlds)
  const activeWorldId = useEditorStore((s) => s.activeWorldId)
  const exportWorldJSON = useEditorStore((s) => s.exportWorldJSON)
  const exportWorldsIndex = useEditorStore((s) => s.exportWorldsIndex)
  const importJSON = useEditorStore((s) => s.importJSON)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleResetAll = async () => {
    const confirm = window.confirm("Are you sure you want to reset all worlds and levels? This will replace your current data with the generator output.")
    if (!confirm) return

    const t = toast.loading("Importing levels from generator...")
    try {
      const res = await fetch('/api/import')
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      importJSON(JSON.stringify(data))
      toast.success("Successfully imported all worlds and levels", { id: t })
    } catch (e) {
      console.error(e)
      toast.error("Failed to import levels: " + (e as Error).message, { id: t })
    }
  }

  const handleApplyAll = async () => {
    const confirm = window.confirm("Are you sure you want to apply all changes to the game assets? This will overwrite the game's data files.")
    if (!confirm) return

    const t = toast.loading("Applying changes to game assets...")
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worlds }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Successfully applied changes to game assets", { id: t })
    } catch (e) {
      console.error(e)
      toast.error("Failed to apply changes: " + (e as Error).message, { id: t })
    }
  }

  return (
    <div className="space-y-2 rounded border border-editor-border bg-editor-panel p-3">
      <div className="text-sm font-semibold">Export / Import</div>
      <Button
        onClick={() => downloadTextFile(`world-${activeWorldId}.json`, exportWorldJSON(activeWorldId))}
        className="w-full"
      >
        Export World
      </Button>
      <Button onClick={() => downloadTextFile("worlds.json", exportWorldsIndex())} className="w-full">
        Export Index
      </Button>
      <Button
        onClick={async () => {
          const blob = await exportAllToZip(worlds)
          downloadBlob("optical-grid-levels.zip", blob)
        }}
        className="w-full"
      >
        Export All Zip
      </Button>
      <div className="pt-2 border-t border-editor-border mt-2 space-y-2">
        <Button onClick={() => fileRef.current?.click()} variant="secondary" className="w-full">
          Import JSON
        </Button>
        <Button onClick={handleResetAll} variant="destructive" className="w-full">
          Reset All
        </Button>
        <Button onClick={handleApplyAll} variant="default" className="w-full bg-green-600 hover:bg-green-700">
          Apply All
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept=".json"
        onChange={async (e) => {
          const f = e.target.files?.[0]
          if (!f) return
          const content = await f.text()
          importJSON(content)
        }}
      />
    </div>
  )
}

