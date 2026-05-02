"use client"

import { useMemo } from "react"

import { useLaser } from "@/hooks/useLaser"
import { findTrapMirrors } from "@/lib/laser"
import { useEditorStore } from "@/lib/store"

export function ValidationPanel() {
  const grid = useEditorStore((s) => s.grid)
  const playGrid = useEditorStore((s) => s.playGrid)
  const playMode = useEditorStore((s) => s.playMode)
  const playMovesLeft = useEditorStore((s) => s.playMovesLeft)
  const activeLevel = useEditorStore((s) => s.activeLevel)
  const { beams, reached } = useLaser()
  const activeGrid = playMode ? playGrid : grid
  const trapCount = useMemo(() => findTrapMirrors(activeGrid).size, [activeGrid])
  const mirrorCount = useMemo(
    () => activeGrid.flat().filter((c) => c && typeof c === 'object' && c.type === 'mirror').length,
    [activeGrid]
  )

  const lastBeam = beams[beams.length - 1]
  const blockedAt = reached ? null : lastBeam ? `(${lastBeam.r}, ${lastBeam.c})` : '(0, 0)'

  const traps = useMemo(() => Array.from(findTrapMirrors(grid)), [grid])
  return (
    <div className='space-y-1 rounded border border-editor-border bg-editor-panel p-3 text-xs'>
      <div className='flex items-center gap-2'>
        <span className='font-semibold'>Laser:</span>
        {reached ? (
          <span className='text-green-400'>● REACHES TARGET</span>
        ) : (
          <span className='text-red-400'>○ BLOCKED AT {blockedAt}</span>
        )}
      </div>
      <div>
        <span className='font-semibold'>Mirrors placed:</span> {mirrorCount}
      </div>
      <div className='flex items-center gap-2'>
        <span className='font-semibold'>Trap segments:</span> {trapCount}
        {trapCount > 0 && <span className='text-amber-500'>⚠</span>}
      </div>
      <div className='mt-1 space-y-1 text-xs text-red-200'>
        {traps.map((key) => (
          <div key={key}>Mirror at ({key}) — adjacent segment has 1 empty cell</div>
        ))}
      </div>
      <div>
        <span className='font-semibold'>Alt paths:</span> {activeLevel?.alt_paths?.length ?? 0}
      </div>
      <div>
        <span className='font-semibold'>Queue size:</span> {activeLevel?.piece_queue?.length ?? 0} / 6
      </div>
      <div>
        <span className='font-semibold'>Move limit:</span> {activeLevel?.move_limit ?? 0}
      </div>
      <div>
        <span className='font-semibold'>Difficulty:</span> {activeLevel?.difficulty ?? 0}
      </div>
      {activeLevel?.optic_unsolved && <div className='mt-2 font-bold text-red-500'>⚠ optic_unsolved: TRUE</div>}
      {playMode && (
        <div className='mt-2 border-t border-editor-border pt-2 font-semibold text-amber-400'>
          Play moves left: {playMovesLeft}
        </div>
      )}
    </div>
  )
}

