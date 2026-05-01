export type MirrorType = "dr" | "ur" | "dl" | "ul"
export type Dir = "right" | "down" | "left" | "up"
export type ToolType =
  | "stone"
  | "hole"
  | "mirror"
  | "fog"
  | "prefill"
  | "source"
  | "target"
  | "erase"

export type PieceShape =
  | "dot"
  | "domino_h"
  | "domino_v"
  | "i3_h"
  | "i3_v"
  | "i4_h"
  | "i4_v"
  | "s_piece"
  | "z_piece"
  | "l_piece"
  | "j_piece"
  | "o_piece"
  | "t_piece"
  | "i5_h"
  | "u_piece"
  | "plus_piece"
  | "i6_h"
  | "corner_3"
  | "mirror_dr"
  | "mirror_ur"
  | "mirror_dl"
  | "mirror_ul"

export type GridCell =
  | null
  | "stone"
  | "hole"
  | "prefill"
  | { type: "source" }
  | { type: "target" }
  | { type: "mirror"; mirror: MirrorType }
  | { type: "fog"; reveals: "stone" | "hole" }

export interface PieceQueueItem {
  id: string
  shape: PieceShape
  count: number
}

export interface SolutionMirror {
  row: number
  col: number
  type: MirrorType
}

export interface Level {
  id: string
  worldId: number
  levelIndex: number
  name: string
  source: [number, number]
  target: [number, number]
  laserStartDir: Dir
  moveLimit: number
  grid: GridCell[][]
  fogCells: [number, number][]
  prefillCells: [number, number][]
  pieceQueue: PieceQueueItem[]
  solutionMirrors: SolutionMirror[]
  solutionPath: [number, number][]
  notes: string
}

export interface World {
  id: number
  name: string
  theme: string
  unlockedMechanics: string[]
  levelCount: number
  levels: Level[]
}

export interface BeamSegment {
  r: number
  c: number
  dr: number
  dc: number
}
