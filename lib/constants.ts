import type { MirrorType, PieceShape, World } from "@/lib/types"

export const GRID_SIZE = 10

export const PIECE_SHAPES: Record<PieceShape, [number, number][]> = {
  "Single": [[0, 0]],
  "Horizontal2": [[0, 0], [0, 1]],
  "Vertical2": [[0, 0], [1, 0]],
  "Square": [[0, 0], [0, 1], [1, 0], [1, 1]],
  "CornerNE": [[0, 1], [1, 0], [1, 1]],
  "CornerNW": [[0, 0], [1, 0], [1, 1]],
  "CornerSE": [[0, 0], [0, 1], [1, 1]],
  "CornerSW": [[0, 0], [0, 1], [1, 0]],
  "Diagonal_main": [[0, 0], [1, 1]],
  "Diagonal_anti": [[0, 1], [1, 0]],
  "Vertical3": [[0, 0], [1, 0], [2, 0]],
  "L": [[0, 0], [1, 0], [2, 0], [2, 1]],
  "L_reversed": [[0, 0], [0, 1], [1, 0], [2, 0]],
  "J": [[0, 1], [1, 1], [2, 1], [2, 0]],
  "J_reversed": [[0, 0], [0, 1], [1, 1], [2, 1]],
  "T_vertical": [[0, 0], [1, 0], [1, 1], [2, 0]],
  "T_vertical_flipped": [[0, 1], [1, 0], [1, 1], [2, 1]],
  "S_vertical": [[0, 0], [1, 0], [1, 1], [2, 1]],
  "Z_vertical": [[0, 1], [1, 0], [1, 1], [2, 0]],
  "V_vertical": [[0, 1], [1, 0], [2, 1]],
  "V_vertical_flipped": [[0, 0], [1, 1], [2, 0]],
  "Horizontal3": [[0, 0], [0, 1], [0, 2]],
  "T": [[0, 0], [0, 1], [0, 2], [1, 1]],
  "T_reversed": [[0, 1], [1, 0], [1, 1], [1, 2]],
  "S": [[0, 1], [0, 2], [1, 0], [1, 1]],
  "Z": [[0, 0], [0, 1], [1, 1], [1, 2]],
  "L_horizontal": [[0, 0], [1, 0], [1, 1], [1, 2]],
  "L_horizontal_reversed": [[0, 0], [0, 1], [0, 2], [1, 0]],
  "J_horizontal": [[0, 2], [1, 0], [1, 1], [1, 2]],
  "J_horizontal_reversed": [[0, 0], [0, 1], [0, 2], [1, 2]],
  "V": [[0, 0], [1, 1], [0, 2]],
  "V_reversed": [[0, 1], [1, 0], [2, 1]],
}

export const PIECE_COLORS = [
  "#FF595E", "#FF924C", "#FFCA3A", "#8AC926",
  "#1982C4", "#6A4C93", "#F72585", "#4CC9F0",
  "#FF6F91", "#FF9671", "#FFC75F", "#F9F871",
  "#845EC2", "#2C73D2", "#008F7A",
  "#00D2FF", "#9D50BB", "#6E48AA", "#3A1C71",
  "#D76D77", "#FFAF7B", "#5433FF", "#20BDFF",
  "#A5FECB", "#7028E4", "#00F2FE", "#43E97B"
]

export const SHAPE_COLORS: Record<PieceShape, string> = {
  "Single": PIECE_COLORS[0],
  "Horizontal2": PIECE_COLORS[1],
  "Vertical2": PIECE_COLORS[1],
  "Square": PIECE_COLORS[2],
  "CornerNE": PIECE_COLORS[3],
  "CornerNW": PIECE_COLORS[3],
  "CornerSE": PIECE_COLORS[3],
  "CornerSW": PIECE_COLORS[3],
  "Horizontal3": PIECE_COLORS[4],
  "Vertical3": PIECE_COLORS[4],
  "Diagonal_main": PIECE_COLORS[15],
  "Diagonal_anti": PIECE_COLORS[15],
  "L": PIECE_COLORS[5],
  "L_reversed": PIECE_COLORS[5],
  "L_horizontal": PIECE_COLORS[5],
  "L_horizontal_reversed": PIECE_COLORS[5],
  "J": PIECE_COLORS[6],
  "J_reversed": PIECE_COLORS[6],
  "J_horizontal": PIECE_COLORS[6],
  "J_horizontal_reversed": PIECE_COLORS[6],
  "T": PIECE_COLORS[7],
  "T_reversed": PIECE_COLORS[7],
  "T_vertical": PIECE_COLORS[7],
  "T_vertical_flipped": PIECE_COLORS[7],
  "S": PIECE_COLORS[8],
  "S_vertical": PIECE_COLORS[8],
  "Z": PIECE_COLORS[9],
  "Z_vertical": PIECE_COLORS[9],
  "V": PIECE_COLORS[10],
  "V_reversed": PIECE_COLORS[10],
  "V_vertical": PIECE_COLORS[10],
  "V_vertical_flipped": PIECE_COLORS[10],
}


export const MIRROR_SYMBOL: Record<MirrorType, string> = {
  dr: "◤",
  dl: "◥",
  ur: "◣",
  ul: "◢"
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

