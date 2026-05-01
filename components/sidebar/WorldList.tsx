"use client"

import { useEffect, useState } from "react"

import { useEditorStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

export function WorldList() {
  const worlds = useEditorStore((s) => s.worlds)
  const createWorld = useEditorStore((s) => s.createWorld)
  const setActiveWorld = useEditorStore((s) => s.setActiveWorld)
  const createLevel = useEditorStore((s) => s.createLevel)
  const duplicateLevel = useEditorStore((s) => s.duplicateLevel)
  const renameLevel = useEditorStore((s) => s.renameLevel)
  const deleteLevel = useEditorStore((s) => s.deleteLevel)
  const loadLevel = useEditorStore((s) => s.loadLevel)
  const activeLevelId = useEditorStore((s) => s.activeLevelId)
  const [menu, setMenu] = useState<{ x: number; y: number; levelId: string; levelName: string } | null>(null)

  useEffect(() => {
    const close = () => setMenu(null)
    window.addEventListener("click", close)
    return () => window.removeEventListener("click", close)
  }, [])

  return (
    <aside className="h-full overflow-auto rounded border border-editor-border bg-editor-panel p-3">
      <div className="mb-2 text-sm font-semibold">Worlds</div>
      <div className="space-y-2">
        {worlds.map((world) => (
          <div key={world.id} className="rounded border border-editor-border p-2">
            <div className="mb-1 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setActiveWorld(world.id)}
                className="w-auto text-left text-sm font-medium"
              >
                World {world.id} - {world.name}
              </Button>
              <Button variant="ghost" onClick={() => createLevel(world.id)} className="text-xs text-blue-300">
                +
              </Button>
            </div>
            <div className="space-y-1">
              {world.levels.map((level) => (
                <div
                  key={level.id}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    setMenu({ x: e.clientX, y: e.clientY, levelId: level.id, levelName: level.name })
                  }}
                  className={`rounded px-2 py-1 text-xs ${activeLevelId === level.id ? "bg-zinc-700" : "bg-zinc-900"}`}
                >
                  <Button variant="ghost" onClick={() => loadLevel(level.id)} className="w-full justify-start text-left">
                    {level.id} {level.name}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Button onClick={createWorld} className="mt-3 w-full">+ Add World</Button>
      {menu ? (
        <div
          className="fixed z-50 min-w-40 rounded border border-editor-border bg-zinc-900 p-1 shadow-xl"
          style={{ left: menu.x, top: menu.y }}
        >
          <Button
            variant="ghost"
            className="w-full justify-start px-2 py-1 text-left text-xs hover:bg-zinc-800"
            onClick={() => {
              const name = window.prompt("Rename level", menu.levelName)
              if (name && name.trim()) renameLevel(menu.levelId, name.trim())
              setMenu(null)
            }}
          >
            Rename
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start px-2 py-1 text-left text-xs hover:bg-zinc-800"
            onClick={() => {
              duplicateLevel(menu.levelId)
              setMenu(null)
            }}
          >
            Duplicate
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start px-2 py-1 text-left text-xs text-red-300 hover:bg-zinc-800"
            onClick={() => {
              if (window.confirm(`Delete ${menu.levelId}?`)) deleteLevel(menu.levelId)
              setMenu(null)
            }}
          >
            Delete
          </Button>
        </div>
      ) : null}
    </aside>
  )
}
