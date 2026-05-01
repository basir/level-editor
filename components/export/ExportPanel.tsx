"use client"

import { useRef } from "react"

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
      <Button onClick={() => fileRef.current?.click()} className="w-full">
        Import
      </Button>
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
