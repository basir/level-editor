'use client'

import { PIECE_CELLS } from '@/lib/constants'
import { useEditorStore } from '@/lib/store'
import type { PieceShape } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const SHAPES = Object.keys(PIECE_CELLS) as PieceShape[]

function PiecePreview({ shape }: { shape: PieceShape }) {
  const offsets = PIECE_CELLS[shape]
  const minR = Math.min(...offsets.map(([r]) => r))
  const minC = Math.min(...offsets.map(([, c]) => c))
  const maxR = Math.max(...offsets.map(([r]) => r))
  const maxC = Math.max(...offsets.map(([, c]) => c))

  const rows = maxR - minR + 1
  const cols = maxC - minC + 1
  const cellSize = 4
  const gap = 1

  const filled = new Set(offsets.map(([r, c]) => `${r - minR},${c - minC}`))
  const isMirror = shape.startsWith('mirror_')
  if (isMirror)
    return (
      <div className='text-amber-400/50'>
        {shape === 'mirror_dr'
          ? '◢'
          : shape === 'mirror_ur'
          ? '◤'
          : shape === 'mirror_dl'
          ? '◣'
          : shape === 'mirror_ul'
          ? '◥'
          : ''}
      </div>
    )
  const zoom = 1.5
  return (
    <div
      className='grid items-center justify-center'
      style={{
        gridTemplateColumns: `repeat(${cols * zoom}, ${cellSize * zoom}px)`,
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
              style={{ width: cellSize * zoom, height: cellSize * zoom }}
              className={
                on
                  ? isMirror
                    ? // Mirrors are 1-cell previews; keep them high-contrast so they stay visible.
                      'rounded-[1px] bg-editor-mirror/45 border border-editor-mirror'
                    : 'rounded-[1px] bg-amber-300/20 border border-amber-400/50'
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
  const playQueue = useEditorStore((s) => s.playQueue)
  const selectedPlayPieceId = useEditorStore((s) => s.selectedPlayPieceId)
  const selectPlayPiece = useEditorStore((s) => s.selectPlayPiece)
  const addPieceToQueue = useEditorStore((s) => s.addPieceToQueue)
  const updatePieceCount = useEditorStore((s) => s.updatePieceCount)
  const removePieceFromQueue = useEditorStore((s) => s.removePieceFromQueue)

  if (!activeLevel) return null

  if (playMode) {
    return (
      <div className='space-y-2 rounded border border-editor-border bg-editor-panel p-3'>
        <div className='text-sm font-semibold'>Play Tray</div>
        <div className='flex flex-wrap gap-2'>
          {playQueue.map((piece) => (
            <Button
              key={piece.id}
              variant='secondary'
              onClick={() => selectPlayPiece(piece.id)}
              className={`flex items-center justify-center px-2 py-1 ${
                selectedPlayPieceId === piece.id
                  ? 'border border-amber-500 bg-amber-500/20'
                  : ''
              }`}
            >
              <PiecePreview shape={piece.shape} />
            </Button>
          ))}
          {playQueue.length === 0 ? (
            <div className='text-xs text-zinc-400'>No pieces left.</div>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-2 rounded border border-editor-border bg-editor-panel p-3'>
      <div className='text-sm font-semibold'>Piece Queue</div>
      <div className='grid grid-cols-5 gap-2'>
        {SHAPES.map((shape) => (
          <Button
            key={shape}
            variant='secondary'
            onClick={() =>
              addPieceToQueue(shape, shape.startsWith('mirror_') ? 1 : 1)
            }
            className='flex items-center justify-center p-0 h-10 w-10'
            title={shape}
          >
            <PiecePreview shape={shape} />
          </Button>
        ))}
      </div>
      <div className='space-y-2'>
        {activeLevel.pieceQueue.map((item) => (
          <div
            key={item.id}
            className='flex items-center justify-between rounded border border-editor-border p-2'
          >
            <div className='flex items-center gap-2'>
              <div title={item.shape}>
                <PiecePreview shape={item.shape} />
              </div>
            </div>
            <Input
              type='number'
              min={1}
              value={item.count}
              onChange={(e) =>
                updatePieceCount(item.id, Number(e.target.value))
              }
              className='w-16 px-2 py-1 text-xs'
            />
            <Button
              variant='ghost'
              className='px-2 py-1 text-xs text-red-300'
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
