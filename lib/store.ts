"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

import { GRID_SIZE, PIECE_CELLS } from "@/lib/constants"
import { exportWorldJSON, exportWorldsIndex } from "@/lib/export"
import { runLineClearCascade, traceLaser } from "@/lib/laser"
import type { GridCell, Level, MirrorType, PieceShape, ToolType, World } from "@/lib/types"

function emptyGrid(): GridCell[][] {
  return Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => null))
}

function createLevel(worldId: number, levelIndex: number): Level {
  return {
    id: `${worldId}-${levelIndex}`,
    worldId,
    levelIndex,
    name: "Untitled",
    source: [0, 0],
    target: [9, 9],
    laserStartDir: "right",
    moveLimit: 20,
    grid: emptyGrid(),
    fogCells: [],
    prefillCells: [],
    pieceQueue: [],
    solutionMirrors: [],
    solutionPath: [],
    notes: ""
  }
}

function cellFromTool(tool: ToolType, mirrorType: MirrorType): GridCell {
  if (tool === "stone") return "stone"
  if (tool === "hole") return "hole"
  if (tool === "prefill") return "prefill"
  if (tool === "fog") return { type: "fog", reveals: "stone" }
  if (tool === "source") return { type: "source" }
  if (tool === "target") return { type: "target" }
  if (tool === "mirror") return { type: "mirror", mirror: mirrorType }
  return null
}

type PlayPiece = { id: string; shape: PieceShape }

interface EditorStore {
  worlds: World[]
  activeWorldId: number
  activeLevelId: string | null
  grid: GridCell[][]
  activeLevel: Level | null
  activeTool: ToolType
  activeMirrorType: MirrorType
  showTrapWarning: boolean
  showSolutionPath: boolean
  isDirty: boolean
  playMode: boolean
  playGrid: GridCell[][]
  playMovesLeft: number
  playQueue: PlayPiece[]
  selectedPlayPieceId: string | null
  solutionMode: boolean
  solutionDrawPath: boolean
  history: GridCell[][][]
  historyIndex: number

  setTool: (tool: ToolType) => void
  setMirrorType: (type: MirrorType) => void
  paintCell: (row: number, col: number) => void
  eraseCell: (row: number, col: number) => void
  addPieceToQueue: (shape: PieceShape, count: number) => void
  updatePieceCount: (id: string, count: number) => void
  removePieceFromQueue: (id: string) => void
  setMoveLimit: (n: number) => void
  setLevelName: (name: string) => void
  setLevelNotes: (notes: string) => void
  addSolutionMirror: (row: number, col: number, type: MirrorType) => void
  clearSolutionPath: () => void
  recordSolutionPath: (path: [number, number][]) => void
  addSolutionPathCell: (row: number, col: number) => void

  saveLevel: () => void
  loadLevel: (levelId: string) => void
  createLevel: (worldId: number) => void
  duplicateLevel: (levelId: string) => void
  renameLevel: (levelId: string, name: string) => void
  deleteLevel: (levelId: string) => void
  createWorld: () => void
  setActiveWorld: (worldId: number) => void
  importJSON: (json: string) => void
  exportWorldJSON: (worldId: number) => string
  exportWorldsIndex: () => string
  togglePlayMode: () => void
  resetPlay: () => void
  selectPlayPiece: (id: string | null) => void
  placePlayPiece: (row: number, col: number) => { ok: boolean; clearedMirrors: number; win: boolean; lose: boolean }
  toggleSolutionMode: () => void
  toggleSolutionDrawPath: () => void
  undo: () => void
  redo: () => void
}

const firstLevel = createLevel(1, 1)

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      worlds: [{ id: 1, name: "Straight Lines", theme: "Basics", unlockedMechanics: ["basics"], levelCount: 1, levels: [firstLevel] }],
      activeWorldId: 1,
      activeLevelId: firstLevel.id,
      grid: firstLevel.grid.map((r) => [...r]),
      activeLevel: firstLevel,
      activeTool: "stone",
      activeMirrorType: "dr",
      showTrapWarning: true,
      showSolutionPath: false,
      isDirty: false,
      playMode: false,
      playGrid: emptyGrid(),
      playMovesLeft: 0,
      playQueue: [],
      selectedPlayPieceId: null,
      solutionMode: false,
      solutionDrawPath: false,
      history: [firstLevel.grid.map((r) => [...r])],
      historyIndex: 0,

      setTool: (tool) => set({ activeTool: tool }),
      setMirrorType: (type) => set({ activeMirrorType: type, activeTool: "mirror" }),
      paintCell: (row, col) => {
        const { grid, activeTool, activeMirrorType, history, historyIndex } = get()
        const next = grid.map((r) => [...r])
        if (activeTool === "source" || activeTool === "target") {
          for (let rr = 0; rr < GRID_SIZE; rr++) {
            for (let cc = 0; cc < GRID_SIZE; cc++) {
              const cell = next[rr][cc]
              if (cell && typeof cell === "object" && cell.type === activeTool) next[rr][cc] = null
            }
          }
        }
        next[row][col] = cellFromTool(activeTool, activeMirrorType)
        set({
          grid: next,
          isDirty: true,
          history: [...history.slice(0, historyIndex + 1), next],
          historyIndex: historyIndex + 1
        })
      },
      eraseCell: (row, col) => {
        const { grid, history, historyIndex } = get()
        const next = grid.map((r) => [...r])
        next[row][col] = null
        set({
          grid: next,
          isDirty: true,
          history: [...history.slice(0, historyIndex + 1), next],
          historyIndex: historyIndex + 1
        })
      },
      addPieceToQueue: (shape, count) =>
        set((state) => {
          if (!state.activeLevel) return state
          return {
            activeLevel: {
              ...state.activeLevel,
              pieceQueue: [...state.activeLevel.pieceQueue, { id: crypto.randomUUID(), shape, count }]
            },
            isDirty: true
          }
        }),
      updatePieceCount: (id, count) =>
        set((state) => {
          if (!state.activeLevel) return state
          return {
            activeLevel: {
              ...state.activeLevel,
              pieceQueue: state.activeLevel.pieceQueue.map((p) => (p.id === id ? { ...p, count: Math.max(1, count) } : p))
            },
            isDirty: true
          }
        }),
      removePieceFromQueue: (id) =>
        set((state) => {
          if (!state.activeLevel) return state
          return {
            activeLevel: {
              ...state.activeLevel,
              pieceQueue: state.activeLevel.pieceQueue.filter((p) => p.id !== id)
            },
            isDirty: true
          }
        }),
      setMoveLimit: (n) =>
        set((state) => (state.activeLevel ? { activeLevel: { ...state.activeLevel, moveLimit: n }, isDirty: true } : state)),
      setLevelName: (name) =>
        set((state) => (state.activeLevel ? { activeLevel: { ...state.activeLevel, name }, isDirty: true } : state)),
      setLevelNotes: (notes) =>
        set((state) => (state.activeLevel ? { activeLevel: { ...state.activeLevel, notes }, isDirty: true } : state)),
      addSolutionMirror: (row, col, type) =>
        set((state) =>
          state.activeLevel
            ? { activeLevel: { ...state.activeLevel, solutionMirrors: [...state.activeLevel.solutionMirrors, { row, col, type }] }, isDirty: true }
            : state
        ),
      clearSolutionPath: () =>
        set((state) => (state.activeLevel ? { activeLevel: { ...state.activeLevel, solutionPath: [] }, isDirty: true } : state)),
      recordSolutionPath: (path) =>
        set((state) => (state.activeLevel ? { activeLevel: { ...state.activeLevel, solutionPath: path }, isDirty: true } : state)),
      addSolutionPathCell: (row, col) =>
        set((state) => {
          if (!state.activeLevel) return state
          const last = state.activeLevel.solutionPath.at(-1)
          if (last?.[0] === row && last?.[1] === col) return state
          return {
            activeLevel: { ...state.activeLevel, solutionPath: [...state.activeLevel.solutionPath, [row, col]] },
            isDirty: true
          }
        }),

      saveLevel: () =>
        set((state) => {
          if (!state.activeLevelId || !state.activeLevel) return state
          const nextLevel = {
            ...state.activeLevel,
            grid: state.grid,
            source: findCell(state.grid, "source") ?? state.activeLevel.source,
            target: findCell(state.grid, "target") ?? state.activeLevel.target
          }
          return {
            worlds: state.worlds.map((world) =>
              world.id === state.activeWorldId
                ? { ...world, levels: world.levels.map((l) => (l.id === state.activeLevelId ? nextLevel : l)) }
                : world
            ),
            activeLevel: nextLevel,
            isDirty: false
          }
        }),
      loadLevel: (levelId) =>
        set((state) => {
          for (const world of state.worlds) {
            const level = world.levels.find((l) => l.id === levelId)
            if (!level) continue
            const grid = level.grid.map((r) => [...r])
            return {
              activeWorldId: world.id,
              activeLevelId: level.id,
              activeLevel: level,
              grid,
              history: [grid],
              historyIndex: 0,
              isDirty: false
            }
          }
          return state
        }),
      createLevel: (worldId) =>
        set((state) => {
          const world = state.worlds.find((w) => w.id === worldId)
          if (!world) return state
          const level = createLevel(worldId, world.levels.length + 1)
          return {
            worlds: state.worlds.map((w) => (w.id === worldId ? { ...w, levels: [...w.levels, level], levelCount: w.levels.length + 1 } : w)),
            activeWorldId: worldId,
            activeLevelId: level.id,
            activeLevel: level,
            grid: level.grid.map((r) => [...r]),
            history: [level.grid.map((r) => [...r])],
            historyIndex: 0,
            isDirty: false
          }
        }),
      duplicateLevel: (levelId) =>
        set((state) => {
          for (const world of state.worlds) {
            const source = world.levels.find((l) => l.id === levelId)
            if (!source) continue
            const nextIndex = world.levels.length + 1
            const clone: Level = {
              ...source,
              id: `${world.id}-${nextIndex}`,
              levelIndex: nextIndex,
              name: `${source.name} Copy`,
              grid: source.grid.map((r) => [...r]),
              pieceQueue: source.pieceQueue.map((p) => ({ ...p, id: crypto.randomUUID() })),
              solutionMirrors: source.solutionMirrors.map((m) => ({ ...m })),
              solutionPath: source.solutionPath.map((p) => [...p] as [number, number])
            }
            return {
              worlds: state.worlds.map((w) =>
                w.id === world.id ? { ...w, levels: [...w.levels, clone], levelCount: w.levels.length + 1 } : w
              )
            }
          }
          return state
        }),
      renameLevel: (levelId, name) =>
        set((state) => ({
          worlds: state.worlds.map((w) => ({
            ...w,
            levels: w.levels.map((l) => (l.id === levelId ? { ...l, name } : l))
          })),
          activeLevel: state.activeLevel?.id === levelId ? { ...state.activeLevel, name } : state.activeLevel
        })),
      deleteLevel: (levelId) =>
        set((state) => ({ worlds: state.worlds.map((w) => ({ ...w, levels: w.levels.filter((l) => l.id !== levelId) })) })),
      createWorld: () =>
        set((state) => {
          const id = Math.max(...state.worlds.map((w) => w.id)) + 1
          const level = createLevel(id, 1)
          return {
            worlds: [...state.worlds, { id, name: `World ${id}`, theme: "", unlockedMechanics: [], levelCount: 1, levels: [level] }],
            activeWorldId: id,
            activeLevelId: level.id,
            activeLevel: level,
            grid: level.grid.map((r) => [...r]),
            history: [level.grid.map((r) => [...r])],
            historyIndex: 0
          }
        }),
      setActiveWorld: (worldId) => set({ activeWorldId: worldId }),
      importJSON: (json) => {
        const parsed = JSON.parse(json) as { worlds?: World[]; worldId?: number; worldName?: string; levels?: Level[] }
        if (parsed.worlds) set({ worlds: parsed.worlds })
        if (parsed.worldId && parsed.levels) {
          set((state) => ({
            worlds: state.worlds.some((w) => w.id === parsed.worldId)
              ? state.worlds.map((w) =>
                  w.id === parsed.worldId
                    ? { ...w, name: parsed.worldName ?? w.name, levels: parsed.levels ?? w.levels, levelCount: parsed.levels?.length ?? w.levels.length }
                    : w
                )
              : [
                  ...state.worlds,
                  {
                    id: parsed.worldId!,
                    name: parsed.worldName ?? `World ${parsed.worldId}`,
                    theme: "",
                    unlockedMechanics: [],
                    levels: parsed.levels!,
                    levelCount: parsed.levels!.length
                  }
                ]
          }))
        }
      },
      exportWorldJSON: (worldId) => {
        const world = get().worlds.find((w) => w.id === worldId)
        return world ? exportWorldJSON(world) : "{}"
      },
      exportWorldsIndex: () => exportWorldsIndex(get().worlds),
      togglePlayMode: () =>
        set((state) =>
          state.playMode
            ? { playMode: false, playGrid: emptyGrid(), playMovesLeft: 0, playQueue: [], selectedPlayPieceId: null }
            : {
                playMode: true,
                playGrid: state.grid.map((r) => [...r]),
                playMovesLeft: state.activeLevel?.moveLimit ?? 0,
                playQueue: flattenQueue(state.activeLevel?.pieceQueue ?? []),
                selectedPlayPieceId: null
              }
        ),
      resetPlay: () =>
        set((state) => ({
          playGrid: state.grid.map((r) => [...r]),
          playMovesLeft: state.activeLevel?.moveLimit ?? 0,
          playQueue: flattenQueue(state.activeLevel?.pieceQueue ?? []),
          selectedPlayPieceId: null
        })),
      selectPlayPiece: (id) => set({ selectedPlayPieceId: id }),
      placePlayPiece: (row, col) => {
        const state = get()
        if (!state.playMode || !state.selectedPlayPieceId || state.playMovesLeft <= 0) {
          return { ok: false, clearedMirrors: 0, win: false, lose: false }
        }
        const piece = state.playQueue.find((p) => p.id === state.selectedPlayPieceId)
        if (!piece) return { ok: false, clearedMirrors: 0, win: false, lose: false }
        const cells: [number, number][] = []
        const nextGrid = state.playGrid.map((r) => [...r])
        for (const [dr, dc] of PIECE_CELLS[piece.shape]) {
          const rr = row + dr
          const cc = col + dc
          if (rr < 0 || rr >= GRID_SIZE || cc < 0 || cc >= GRID_SIZE || nextGrid[rr][cc] !== null) {
            return { ok: false, clearedMirrors: 0, win: false, lose: false }
          }
          cells.push([rr, cc])
        }
        for (const [rr, cc] of cells) {
          nextGrid[rr][cc] = piece.shape.startsWith("mirror_")
            ? { type: "mirror", mirror: piece.shape.replace("mirror_", "") as MirrorType }
            : "prefill"
        }
        const clearResult = runLineClearCascade(nextGrid)
        const source = findCell(clearResult.grid, "source") ?? state.activeLevel?.source ?? [0, 0]
        const win = traceLaser(clearResult.grid, source).reached
        const moves = state.playMovesLeft - 1
        set({
          playGrid: clearResult.grid,
          playMovesLeft: moves,
          playQueue: state.playQueue.filter((p) => p.id !== piece.id),
          selectedPlayPieceId: null
        })
        return { ok: true, clearedMirrors: clearResult.clearedMirrors, win, lose: !win && moves <= 0 }
      },
      toggleSolutionMode: () => set((state) => ({ solutionMode: !state.solutionMode })),
      toggleSolutionDrawPath: () => set((state) => ({ solutionDrawPath: !state.solutionDrawPath })),
      undo: () => {
        const { history, historyIndex } = get()
        if (historyIndex <= 0) return
        set({ historyIndex: historyIndex - 1, grid: history[historyIndex - 1], isDirty: true })
      },
      redo: () => {
        const { history, historyIndex } = get()
        if (historyIndex >= history.length - 1) return
        set({ historyIndex: historyIndex + 1, grid: history[historyIndex + 1], isDirty: true })
      }
    }),
    { name: "optical-grid-editor" }
  )
)

function flattenQueue(queue: Level["pieceQueue"]): PlayPiece[] {
  return queue.flatMap((item, idx) =>
    Array.from({ length: item.count }, (_, i) => ({ id: `${item.id}-${idx}-${i}`, shape: item.shape }))
  )
}

function findCell(grid: GridCell[][], type: "source" | "target"): [number, number] | null {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = grid[r][c]
      if (cell && typeof cell === "object" && cell.type === type) return [r, c]
    }
  }
  return null
}
