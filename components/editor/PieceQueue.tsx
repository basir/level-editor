'use client'

import { PIECE_SHAPES, SHAPE_COLORS } from '@/lib/constants'
import { useEditorStore } from '@/lib/store'
import type { PieceShape } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const SHAPES = Object.keys(PIECE_SHAPES) as PieceShape[]

function PiecePreview({ shape }: { shape: PieceShape }) {
  const offsets = PIECE_SHAPES[shape]
  const minR = Math.min(...offsets.map(([r]) => r))
  const minC = Math.min(...offsets.map(([, c]) => c))
  const maxR = Math.max(...offsets.map(([r]) => r))
  const maxC = Math.max(...offsets.map(([, c]) => c))

  const rows = maxR - minR + 1
  const cols = maxC - minC + 1
  const cellSize = 4
  const gap = 1

  const filled = new Set(offsets.map(([r, c]) => `${r - minR},${c - minC}`))
  const zoom = 1.5

  return (
    <div
      className='grid items-center justify-center'
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellSize * zoom}px)`,
        gridAutoRows: `${cellSize * zoom}px`,
        gap: `${gap}px`,
      }}
      aria-hidden='true'
    >
      {Array.from({ length: rows }).flatMap((_, r) =>
        Array.from({ length: cols }).map((__, c) => {
          const key = `${r}-${c}`
          const on = filled.has(`${r},${c}`)

          return (
            <div
              key={key}
              style={{
                width: cellSize * zoom,
                height: cellSize * zoom,
                backgroundColor: on ? SHAPE_COLORS[shape] : 'transparent',
                borderColor: on ? `${SHAPE_COLORS[shape]}80` : 'transparent'
              }}
              className={
                on
                  ? 'rounded-[1px] border'
                  : 'rounded-[1px] border border-transparent'
              }
            />
          )
        })
      )}
    </div>
  )
}

export function PieceQueue() {
  const activeLevel = useEditorStore((s) => s.activeLevel)
  const playMode = useEditorStore((s) => s.playMode)
  const solutionMode = useEditorStore((s) => s.solutionMode)
  const playQueue = useEditorStore((s) => s.playQueue)
  const selectedPlayPieceId = useEditorStore((s) => s.selectedPlayPieceId)
  const selectPlayPiece = useEditorStore((s) => s.selectPlayPiece)
  const addPieceToQueue = useEditorStore((s) => s.addPieceToQueue)
  const updatePieceCount = useEditorStore((s) => s.updatePieceCount)
  const togglePieceDistractor = useEditorStore((s) => s.togglePieceDistractor)
  const removePieceFromQueue = useEditorStore((s) => s.removePieceFromQueue)

  if (!activeLevel) return null

  const currentQueueCount = activeLevel.piece_queue.length
  const isAtLimit = currentQueueCount >= 6

  if (playMode || solutionMode) {
    return (
      <div className='space-y-2 rounded border border-editor-border bg-editor-panel p-3'>
        <div className='text-sm font-semibold'>Play Tray</div>
        <div className='flex flex-wrap gap-2'>
          {playQueue.map((piece) => (
            <Button
              key={piece.id}
              variant='secondary'
              onClick={() => selectPlayPiece(piece.id)}
              className={`flex items-center justify-center px-2 py-1 ${selectedPlayPieceId === piece.id ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''
                }`}
            >
              <PiecePreview shape={piece.name} />
            </Button>
          ))}
          {playQueue.length === 0 ? <div className='text-xs text-zinc-400'>No pieces left.</div> : null}
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-2 rounded border border-editor-border bg-editor-panel p-3'>
      <div className='flex items-center justify-between'>
        <div className='text-sm font-semibold'>Piece Queue</div>
        <div className={`text-xs ${isAtLimit ? 'text-amber-500 font-bold' : 'text-zinc-400'}`}>
          {currentQueueCount} / 6 pieces
        </div>
      </div>
      <div className='grid grid-cols-5 gap-2'>
        {SHAPES.map((shape) => (
          <div key={shape} className='flex flex-col items-center gap-1'>
            <Button
              variant='secondary'
              disabled={isAtLimit}
              onClick={() => addPieceToQueue(shape, 1)}
              className='flex items-center justify-center p-0 h-12 w-12 disabled:opacity-30'
              title={isAtLimit ? 'Maximum 6 pieces per level' : shape}
            >
              <PiecePreview shape={shape} />
            </Button>
            {/* <div className='text-[9px] text-zinc-500 text-center leading-tight truncate w-full'>{shape}</div> */}
          </div>
        ))}
      </div>
      <div className='space-y-2'>
        {activeLevel.piece_queue.map((item) => (
          <div key={item.id} className='flex items-center justify-between rounded border border-editor-border p-2 gap-2'>
            <div className='flex items-center gap-2 min-w-[60px]'>
              <div className='text-[10px] font-mono text-zinc-500 w-5'>{item.id}</div>
              <div title={item.name}>
                <PiecePreview shape={item.name} />
              </div>
            </div>

            <Button
              variant='ghost'
              size='sm'
              onClick={() => togglePieceDistractor(item.id)}
              className={`text-[10px] px-2 py-0 h-7 border border-white/5 rounded-full ${item.isDistractor ? 'bg-amber-500/20 text-amber-200 border-amber-500/30' : 'text-zinc-400 hover:text-white'}`}
            >
              {item.isDistractor ? 'Distractor' : 'Real'}
            </Button>

            <Input
              type='number'
              min={1}
              value={item.count}
              onChange={(e) => updatePieceCount(item.id, Number(e.target.value))}
              className='w-12 px-2 py-1 text-[10px] h-7 bg-zinc-900 border-zinc-700'
            />

            <Button
              variant='ghost'
              className='px-2 py-1 text-[10px] h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10'
              onClick={() => removePieceFromQueue(item.id)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

