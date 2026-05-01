"use client"

import React from "react"

import { MIRROR_SYMBOL } from "@/lib/constants"
import type { GridCell } from "@/lib/types"

interface CellProps {
  cell: GridCell
  lit?: boolean
  trap?: boolean
  onDown: () => void
  onEnter: () => void
  onErase: () => void
  onDoubleClick: () => void
}

function getVisual(cell: GridCell) {
  if (!cell) return { bg: 'bg-editor-cell', text: '', style: {} }
  if (cell === 'hole') return { bg: 'bg-zinc-950', text: '○', style: { color: '#52525b' } }
  if (typeof cell === 'object') {
    if (cell.type === 'stone') return { bg: 'bg-zinc-800', text: '▪', style: { color: cell.color, fontSize: '5rem' } }
    if (cell.type === 'frozen') {
      if (cell.lives === 1) return { bg: 'bg-zinc-800', text: '▪', style: { color: cell.color || '#a1a1aa', fontSize: '5rem' } }
      return { bg: 'bg-cyan-900/40', text: '❄', style: { color: cell.color || '#67e8f9' } }
    }
    if (cell.type === 'source') {
      const rotation = { right: 'rotate-0', down: 'rotate-90', left: 'rotate-180', up: 'rotate-270' }[cell.dir || 'right']
      return { 
        bg: 'bg-blue-600/20', 
        text: '➤', 
        style: { color: '#60a5fa' },
        className: rotation
      }
    }
    if (cell.type === 'target') return { bg: 'bg-green-600/20', text: '★', style: { color: '#4ade80' } }
    if (cell.type === 'mirror') return { bg: 'bg-amber-500/10', text: MIRROR_SYMBOL[cell.mirror], style: { color: '#fbbf24' } }
    if (cell.type === 'fog') return { bg: 'bg-zinc-900', text: '?', style: { color: '#3f3f46' } }
  }
  return { bg: 'bg-editor-cell', text: '', style: {} }
}


export const Cell = React.memo(function Cell({ cell, lit, trap, onDown, onEnter, onErase, onDoubleClick }: CellProps) {
  const { bg, text, style, className } = getVisual(cell)

  return (
    <button
      type='button'
      onMouseDown={(e) => {
        if (e.button === 2) return
        onDown()
      }}
      onMouseEnter={onEnter}
      onContextMenu={(e) => {
        e.preventDefault()
        onErase()
      }}
      onDoubleClick={() => {
        if (cell && typeof cell === 'object' && ('type' in cell) && (cell.type === 'stone' || cell.type === 'frozen')) {
          onDoubleClick()
        }
      }}
      className={`relative h-[52px] w-[52px] border border-editor-border text-lg flex items-center justify-center transition-colors ${bg} ${trap ? 'trap-pulse ring-1 ring-editor-trap' : ''
        } hover:bg-white/5`}
    >
      <span className={`pointer-events-none select-none ${className || ''}`} style={style}>
        {text}
      </span>
      {lit ? (
        <span className='pointer-events-none absolute inset-0 bg-amber-400/20' />
      ) : null}
    </button>
  )
})

