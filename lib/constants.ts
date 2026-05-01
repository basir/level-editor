import type { MirrorType, PieceShape, World } from "@/lib/types"

export const GRID_SIZE = 10

export const PIECE_CELLS: Record<PieceShape, [number, number][]> = {
  dot: [[0, 0]],
  domino_h: [[0, 0], [0, 1]],
  domino_v: [[0, 0], [1, 0]],
  i3_h: [[0, 0], [0, 1], [0, 2]],
  i3_v: [[0, 0], [1, 0], [2, 0]],
  i4_h: [[0, 0], [0, 1], [0, 2], [0, 3]],
  i4_v: [[0, 0], [1, 0], [2, 0], [3, 0]],
  o_piece: [[0, 0], [0, 1], [1, 0], [1, 1]],
  t_piece: [[0, 0], [0, 1], [0, 2], [1, 1]],
  l_piece: [[0, 0], [1, 0], [2, 0], [2, 1]],
  j_piece: [[0, 0], [1, 0], [2, 0], [2, -1]],
  s_piece: [[0, 1], [0, 2], [1, 0], [1, 1]],
  z_piece: [[0, 0], [0, 1], [1, 1], [1, 2]],
  i5_h: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
  i6_h: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5]],
  u_piece: [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]],
  plus_piece: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]],
  corner_3: [[0, 0], [1, 0], [1, 1]],
}


export const MIRROR_SYMBOL: Record<MirrorType, string> = {
  dr: "◢",
  ur: "◤",
  dl: "◣",
  ul: "◥"
}

export const TOOL_LABELS = {
  stone: 'Stone',
  hole: 'Hole',
  frozen: 'Frozen',
  fog: 'Fog',
  mirror: 'Mirror',
  erase: 'Erase',
}


export const DEFAULT_WORLD: World = {
  id: 1,
  name: 'World 1',
  levelCount: 1,
  levels: [],
}

