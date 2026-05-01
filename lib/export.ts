import JSZip from "jszip"

import type { Level, World } from "@/lib/types"

export function exportWorldsIndex(worlds: World[]): string {
  return JSON.stringify(
    {
      version: "1.0",
      worlds: worlds.map((w) => ({
        id: w.id,
        name: w.name,
        theme: w.theme,
        unlockedMechanics: w.unlockedMechanics,
        levelCount: w.levels.length
      }))
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
      levels: world.levels.map((level) => serializeLevel(level))
    },
    null,
    2
  )
}

function serializeLevel(level: Level) {
  return {
    id: level.id,
    worldId: level.worldId,
    levelIndex: level.levelIndex,
    name: level.name,
    source: level.source,
    target: level.target,
    laserStartDir: level.laserStartDir,
    moveLimit: level.moveLimit,
    grid: level.grid,
    fogCells: level.fogCells,
    prefillCells: level.prefillCells,
    pieceQueue: level.pieceQueue,
    solutionMirrors: level.solutionMirrors,
    solutionPath: level.solutionPath,
    notes: level.notes
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
