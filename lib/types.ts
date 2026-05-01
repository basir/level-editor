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
  | 'dot'
  | 'domino_h'
  | 'domino_v'
  | 'i3_h'
  | 'i3_v'
  | 'i4_h'
  | 'i4_v'
  | 's_piece'
  | 'z_piece'
  | 'l_piece'
  | 'j_piece'
  | 'o_piece'
  | 't_piece'
  | 'i5_h'
  | 'u_piece'
  | 'plus_piece'
  | 'i6_h'
  | 'corner_3'

export type GridCell =
  | null // empty
  | 'hole' // permanent hole
  | { type: 'source' } // always at (0,0)
  | { type: 'stone' } // stone block
  | { type: 'frozen' } // frozen block
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

