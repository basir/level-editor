"use client"

import React from "react"

import { MIRROR_SYMBOL } from "@/lib/constants"
import type { GridCell } from "@/lib/types"

interface CellProps {
  cell: GridCell
  lit: boolean
  trap: boolean
  onDown: () => void
  onEnter: () => void
  onErase: () => void
}

function getVisual(cell: GridCell) {
  if (!cell) return { bg: "bg-editor-cell", text: "" }
  if (cell === "stone") return { bg: "bg-editor-stone", text: "▪" }
  if (cell === "hole") return { bg: "bg-editor-hole", text: "○" }
  if (cell === "prefill") return { bg: "bg-editor-prefill", text: "·" }
  if (typeof cell === "object" && cell.type === "source") return { bg: "bg-blue-900", text: "◉" }
  if (typeof cell === "object" && cell.type === "target") return { bg: "bg-green-900", text: "★" }
  if (typeof cell === "object" && cell.type === "mirror") return { bg: "bg-editor-mirror", text: MIRROR_SYMBOL[cell.mirror] }
  if (typeof cell === "object" && cell.type === "fog") return { bg: "bg-editor-fog", text: "?" }
  return { bg: "bg-editor-cell", text: "" }
}

export const Cell = React.memo(function Cell({ cell, lit, trap, onDown, onEnter, onErase }: CellProps) {
  const { bg, text } = getVisual(cell)

  return (
    <button
      type="button"
      onMouseDown={(e) => {
        if (e.button === 2) return
        onDown()
      }}
      onMouseEnter={onEnter}
      onContextMenu={(e) => {
        e.preventDefault()
        onErase()
      }}
      className={`relative h-[52px] w-[52px] border border-editor-border text-lg ${bg} ${trap ? "trap-pulse ring-1 ring-editor-trap" : ""}`}
    >
      <span className="pointer-events-none">{text}</span>
      {lit ? <span className="pointer-events-none absolute inset-0 bg-amber-400/30" /> : null}
    </button>
  )
})
