"use client"

import { PIECE_SHAPES, SHAPE_COLORS } from "@/lib/constants"
import { useEditorStore } from "@/lib/store"
import { PieceShape } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { PieceColorPreview } from "./PieceColorPreview"

export function CellColorPicker() {
  const editingCell = useEditorStore((s) => s.editingCell)
  const setEditingCell = useEditorStore((s) => s.setEditingCell)
  const updateCellColor = useEditorStore((s) => s.updateCellColor)

  if (!editingCell) return null

  const shapes = Object.keys(PIECE_SHAPES) as PieceShape[]

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
      <div className='w-full max-w-xl rounded-lg border border-editor-border bg-editor-panel p-6 shadow-2xl'>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-lg font-bold'>Pick Cell Color</h2>
          <Button variant='secondary' size='sm' onClick={() => setEditingCell(null)}>
            Close
          </Button>
        </div>
        
        <div className='grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 max-h-[60vh] overflow-y-auto p-2'>
          {shapes.map((shape) => (
            <button
              key={shape}
              onClick={() => {
                updateCellColor(editingCell.row, editingCell.col, SHAPE_COLORS[shape])
                setEditingCell(null)
              }}
              className='group flex flex-col items-center gap-2 rounded-md p-2 transition-colors hover:bg-white/5'
            >
              <PieceColorPreview shape={shape} />
            </button>
          ))}
        </div>
        
        <div className='mt-8 flex justify-end gap-3 border-t border-editor-border pt-4'>
          <Button variant='secondary' onClick={() => setEditingCell(null)}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
