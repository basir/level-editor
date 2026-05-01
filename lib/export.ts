import JSZip from "jszip"

import type { Level, World } from "@/lib/types"

export function exportWorldsIndex(worlds: World[]): string {
  return JSON.stringify(
    {
      version: '1.0',
      worlds: worlds.map((w) => ({
        id: w.id,
        name: w.name,
        levelCount: w.levels.length,
        levels: w.levels.map((l) => ({
          id: l.id,
          name: l.name,
          difficulty: l.difficulty > 20 ? 'hard' : l.difficulty > 10 ? 'medium' : 'easy',
          fingerprint: l.fingerprint,
        })),
      })),
    },
    null,
    2
  )
}

export function exportWorldJSON(world: World): string {
  return JSON.stringify(
    {
      worldId: world.id,
      worldName: world.name,
      levels: world.levels.map((level) => serializeLevel(level)),
    },
    null,
    2
  )
}

function serializeLevel(level: Level) {
  const {
    id,
    worldId,
    levelIndex,
    name,
    grid,
    solution_mirrors,
    solution_path,
    solution_moves,
    alt_paths,
    piece_queue,
    move_limit,
    difficulty,
    generation_log,
    optic_unsolved,
    notes,
    fingerprint,
    difficulty_score,
    ...rest
  } = level

  return {
    id,
    worldId,
    levelIndex,
    name,
    grid,
    solution_mirrors,
    solution_path,
    solution_moves,
    alt_paths,
    piece_queue,
    move_limit,
    difficulty,
    generation_log,
    optic_unsolved,
    notes,
    fingerprint,
    ...rest,
  }
}


export async function exportAllToZip(worlds: World[]): Promise<Blob> {
  const zip = new JSZip()
  zip.file("worlds.json", exportWorldsIndex(worlds))
  worlds.forEach((world) => {
    zip.file(`world-${world.id}.json`, exportWorldJSON(world))
  })
  return zip.generateAsync({ type: "blob" })
}

export function downloadTextFile(name: string, content: string) {
  const blob = new Blob([content], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

export function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}
