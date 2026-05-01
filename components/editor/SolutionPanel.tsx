import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { PIECE_SHAPES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import type { PieceShape } from '@/lib/types'

export function SolutionPanel() {
  const activeLevel = useEditorStore((s) => s.activeLevel)
  const setHighlightedCells = useEditorStore((s) => s.setHighlightedCells)
  const [isOpen, setIsOpen] = useState(false)
  const [persistentHighlight, setPersistentHighlight] = useState<number | null>(null)

  if (!activeLevel) return null

  const moves = activeLevel.solution_moves || []

  const getMoveCells = (move: any): [number, number][] => {
    const shape = move.shape as PieceShape
    const offsets = PIECE_SHAPES[shape] || []
    return offsets.map(([dr, dc]) => [move.row + dr, move.col + dc])
  }

  const handleMouseEnter = (move: any, index: number) => {
    if (persistentHighlight === null) {
      setHighlightedCells(getMoveCells(move))
    }
  }

  const handleMouseLeave = () => {
    if (persistentHighlight === null) {
      setHighlightedCells(null)
    }
  }

  const handleClick = (move: any, index: number) => {
    if (persistentHighlight === index) {
      setPersistentHighlight(null)
      setHighlightedCells(null)
    } else {
      setPersistentHighlight(index)
      setHighlightedCells(getMoveCells(move))
    }
  }

  return (
    <div className='rounded border border-editor-border bg-editor-panel overflow-hidden'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex w-full items-center justify-between p-3 text-sm font-semibold hover:bg-white/5 transition-colors'
      >
        <span>Solution ({moves.length} steps)</span>
        <span className='text-zinc-500'>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className='border-t border-editor-border p-3 space-y-2'>
          {moves.length === 0 ? (
            <div className='text-xs text-zinc-500 italic text-center py-2'>[No solution recorded]</div>
          ) : (
            <div className='space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar'>
              {moves.map((move, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => handleMouseEnter(move, idx)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleClick(move, idx)}
                  className={`flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 text-xs transition-colors ${
                    persistentHighlight === idx ? 'bg-amber-500/20 text-amber-200' : 'hover:bg-white/5 text-zinc-300'
                  }`}
                >
                  <span className='font-mono text-[10px] bg-zinc-800 px-1 rounded text-zinc-400'>{move.step}</span>
                  <span className='font-medium'>{move.shape}</span>
                  <span className='ml-auto text-zinc-500 font-mono'>
                    ({move.row},{move.col})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

