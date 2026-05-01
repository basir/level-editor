"use client"

import { useEditorStore } from "@/lib/store"

export function useGridActions() {
  const paintCell = useEditorStore((s) => s.paintCell)
  const eraseCell = useEditorStore((s) => s.eraseCell)
  const activeTool = useEditorStore((s) => s.activeTool)

  const applyAt = (row: number, col: number) => {
    if (activeTool === "erase") eraseCell(row, col)
    else paintCell(row, col)
  }

  return { applyAt }
}
