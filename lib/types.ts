export type MirrorType = 'dr' | 'ur' | 'dl' | 'ul'
export type Dir = 'right' | 'down' | 'left' | 'up'
export type ToolType =
  | 'stone'
  | 'hole'
  | 'mirror'
  | 'fog'
  | 'frozen'
  | 'source'
  | 'target'
  | 'erase'

export type PieceShape =
  | "Single"
  | "Horizontal2"
  | "Vertical2"
  | "Square"
  | "CornerNE"
  | "CornerNW"
  | "CornerSE"
  | "CornerSW"
  | "Diagonal_main"
  | "Diagonal_anti"
  | "Vertical3"
  | "L"
  | "L_reversed"
  | "J"
  | "J_reversed"
  | "T_vertical"
  | "T_vertical_flipped"
  | "S_vertical"
  | "Z_vertical"
  | "V_vertical"
  | "V_vertical_flipped"
  | "Horizontal3"
  | "T"
  | "T_reversed"
  | "S"
  | "Z"
  | "L_horizontal"
  | "L_horizontal_reversed"
  | "J_horizontal"
  | "J_horizontal_reversed"
  | "V"
  | "V_reversed"

export type GridCell =
  | null // empty
  | 'hole' // permanent hole
  | { type: 'source' } // always at (0,0)
  | { type: 'stone'; color: string } // stone block
  | { type: 'frozen'; lives?: number; color?: string } // frozen block
  | { type: 'target' } // always at (9,9)
  | { type: 'mirror'; mirror: MirrorType }
  | { type: 'fog'; reveals: 'stone' | 'hole' }

export interface PieceQueueItem {
  id: string
  shape: PieceShape
  count: number
}

export interface SolutionMove {
  step: number
  piece_id: string
  shape: string
  row: number
  col: number
}

export interface AltPath {
  mirrors: { row: number; col: number; type: MirrorType }[]
  path: [number, number][]
}

export interface Level {
  id: string
  worldId: number
  levelIndex: number
  name: string
  grid: GridCell[][]
  solution_mirrors: { row: number; col: number; type: MirrorType }[]
  solution_path: [number, number][]
  solution_moves: SolutionMove[]
  alt_paths: AltPath[]
  piece_queue: PieceQueueItem[]
  move_limit: number
  difficulty: number
  generation_log: any
  optic_unsolved: boolean
  notes: string
  [key: string]: any
}


export interface World {
  id: number
  name: string
  levelCount: number
  levels: Level[]
}

export interface BeamSegment {
  r: number
  c: number
  dr: number
  dc: number
}

