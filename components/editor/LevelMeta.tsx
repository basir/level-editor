import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function LevelMeta() {
  const activeLevel = useEditorStore((s) => s.activeLevel)
  const setLevelName = useEditorStore((s) => s.setLevelName)
  const setMoveLimit = useEditorStore((s) => s.setMoveLimit)
  const setLevelNotes = useEditorStore((s) => s.setLevelNotes)
  const saveLevel = useEditorStore((s) => s.saveLevel)
  const [showLog, setShowLog] = useState(false)

  if (!activeLevel) return null

  return (
    <div className='space-y-2 rounded border border-editor-border bg-editor-panel p-3'>
      <div className='text-sm font-semibold'>Level Meta</div>
      <div className='space-y-1'>
        <label className='text-[10px] uppercase text-zinc-500 font-bold'>Name</label>
        <Input value={activeLevel.name} onChange={(e) => setLevelName(e.target.value)} />
      </div>
      <div className='space-y-1'>
        <label className='text-[10px] uppercase text-zinc-500 font-bold'>Move Limit</label>
        <Input type='number' value={activeLevel.move_limit} onChange={(e) => setMoveLimit(Number(e.target.value))} />
      </div>
      <div className='space-y-1'>
        <label className='text-[10px] uppercase text-zinc-500 font-bold'>Notes</label>
        <Textarea value={activeLevel.notes} onChange={(e) => setLevelNotes(e.target.value)} className='h-20 text-xs' />
      </div>

      {activeLevel.generation_log && Object.keys(activeLevel.generation_log).length > 0 && (
        <div className='border-t border-editor-border pt-2 mt-2'>
          <button
            onClick={() => setShowLog(!showLog)}
            className='text-[10px] uppercase text-zinc-500 font-bold hover:text-zinc-300 transition-colors flex items-center justify-between w-full'
          >
            Generation Info {showLog ? '▲' : '▼'}
          </button>
          {showLog && (
            <pre className='mt-2 max-h-40 overflow-auto rounded bg-black/40 p-2 text-[10px] font-mono text-zinc-400 custom-scrollbar'>
              {JSON.stringify(activeLevel.generation_log, null, 2)}
            </pre>
          )}
        </div>
      )}

      <Button onClick={saveLevel} className='w-full bg-blue-700 hover:bg-blue-600 mt-2'>
        Save Level
      </Button>
    </div>
  )
}

