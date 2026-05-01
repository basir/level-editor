"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { useGridActions } from "@/hooks/useGrid"
import { useLaser } from "@/hooks/useLaser"
import { findTrapMirrors } from "@/lib/laser"
import { useEditorStore } from "@/lib/store"
import { PIECE_SHAPES, SHAPE_COLORS } from "@/lib/constants"

import { Cell } from "./Cell"
import { LaserBeam } from "./LaserBeam"
import { CellColorPicker } from "./CellColorPicker"

export function Grid() {
  const grid = useEditorStore((s) => s.grid)
  const playGrid = useEditorStore((s) => s.playGrid)
  const playMode = useEditorStore((s) => s.playMode)
  const solutionMode = useEditorStore((s) => s.solutionMode)
  const solutionDrawPath = useEditorStore((s) => s.solutionDrawPath)
  const eraseCell = useEditorStore((s) => s.eraseCell)
  const addSolutionPathCell = useEditorStore((s) => s.addSolutionPathCell)
  const selectedPlayPieceId = useEditorStore((s) => s.selectedPlayPieceId)
  const playQueue = useEditorStore((s) => s.playQueue)
  const activeMirrorType = useEditorStore((s) => s.activeMirrorType)
  const placePlayPiece = useEditorStore((s) => s.placePlayPiece)
  const activeLevel = useEditorStore((s) => s.activeLevel)
  const setEditingCell = useEditorStore((s) => s.setEditingCell)
  const { applyAt } = useGridActions()
  const { beams } = useLaser()
  const [isPainting, setIsPainting] = useState(false)
  const [hover, setHover] = useState<[number, number] | null>(null)

  useEffect(() => {
    const stopPaint = () => setIsPainting(false)
    window.addEventListener("mouseup", stopPaint)
    return () => window.removeEventListener("mouseup", stopPaint)
  }, [])

  const activeGrid = (playMode || solutionMode) ? playGrid : grid
  const litSet = useMemo(() => new Set(beams.map((b) => `${b.r},${b.c}`)), [beams])
  const traps = useMemo(() => findTrapMirrors(activeGrid), [activeGrid])
  const selectedPiece = useMemo(
    () => playQueue.find((p) => p.id === selectedPlayPieceId) ?? null,
    [playQueue, selectedPlayPieceId]
  )
  const ghostCells = useMemo(() => {
    if (!(playMode || solutionMode) || !hover || !selectedPiece) return []
    const [r, c] = hover
    return PIECE_SHAPES[selectedPiece.shape]
      .map(([dr, dc]) => [r + dr, c + dc] as [number, number])
      .filter(([rr, cc]) => rr >= 0 && rr < 10 && cc >= 0 && cc < 10)
  }, [playMode, hover, selectedPiece])
  const highlightedCells = useEditorStore((s) => s.highlightedCells)

  return (
    <div className='relative rounded border border-editor-border bg-editor-panel p-2'>
      {activeLevel?.optic_unsolved && (
        <div className='mb-2 rounded bg-red-500/20 border border-red-500 p-2 text-center text-xs font-bold text-red-200 animate-pulse'>
          ⚠ This level has no valid laser solution. Edit to fix.
        </div>
      )}
      <div className='grid grid-cols-10 gap-0' onMouseLeave={() => setHover(null)}>
        {activeGrid.map((row, r) =>
          row.map((cell, c) => (
            <Cell
              key={`${r}-${c}`}
              cell={cell}
              lit={litSet.has(`${r},${c}`)}
              trap={traps.has(`${r},${c}`)}
              onDown={() => {
                if (playMode || solutionMode) {
                  if (!selectedPlayPieceId) return
                  const result = placePlayPiece(r, c)
                  if (result.ok && result.clearedMirrors > 0) toast.warning('Mirror destroyed')
                  if (result.ok && result.win) toast.success('Level Complete')
                  if (result.ok && result.lose) toast.error('Out of moves')
                  return
                }
                setIsPainting(true)
                applyAt(r, c)
              }}
              onEnter={() => {
                if (playMode || solutionMode) {
                  setHover([r, c])
                  return
                }
                if (solutionMode) return
                if (isPainting) applyAt(r, c)
              }}
              onErase={() => {
                if (playMode || solutionMode) return
                eraseCell(r, c)
              }}
              onDoubleClick={() => {
                if (!playMode && !solutionMode) {
                  setEditingCell({ row: r, col: c })
                }
              }}
            />
          ))
        )}
      </div>

      {(ghostCells.length > 0 || (highlightedCells && highlightedCells.length > 0)) && (
        <div className='pointer-events-none absolute left-2 top-2 grid grid-cols-10'>
          {Array.from({ length: 100 }, (_, i) => {
            const r = Math.floor(i / 10)
            const c = i % 10
            const ghost = ghostCells.some(([gr, gc]) => gr === r && gc === c)
            const highlighted = highlightedCells?.some(([hr, hc]) => hr === r && hc === c)
            return (
              <div
                key={i}
                style={{
                  backgroundColor: ghost ? `${SHAPE_COLORS[selectedPiece?.shape || 'Single']}40` : highlighted ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  borderColor: ghost ? `${SHAPE_COLORS[selectedPiece?.shape || 'Single']}80` : highlighted ? 'rgba(255, 255, 255, 0.5)' : 'transparent'
                }}
                className={`h-[52px] w-[52px] border`}
              />
            )
          })}
        </div>
      )}

      <LaserBeam beams={beams} />
      <CellColorPicker />
    </div>
  )
}
