import { PIECE_SHAPES, SHAPE_COLORS } from "@/lib/constants"
import type { PieceShape } from "@/lib/types"

// export function PieceColorPreview({ shape }: { shape: PieceShape }) {
//   const color = SHAPE_COLORS[shape]
//   return (
//     <div className='flex flex-col items-center gap-1'>
//       <div 
//         className='h-8 w-8 rounded-sm border border-white/10 shadow-sm' 
//         style={{ backgroundColor: color }} 
//       />
//       <div className='text-[8px] text-zinc-500 text-center leading-tight truncate w-full max-w-[48px]'>
//         {shape}
//       </div>
//     </div>
//   )
// }



export function PieceColorPreview({ shape }: { shape: PieceShape }) {
  const offsets = PIECE_SHAPES[shape]
  const minR = Math.min(...offsets.map(([r]) => r))
  const minC = Math.min(...offsets.map(([, c]) => c))
  const maxR = Math.max(...offsets.map(([r]) => r))
  const maxC = Math.max(...offsets.map(([, c]) => c))

  const rows = maxR - minR + 1
  const cols = maxC - minC + 1
  const cellSize = 4
  const gap = 1

  const filled = new Set(offsets.map(([r, c]) => `${r - minR},${c - minC}`))
  const zoom = 4

  return (
    <div
      className='grid items-center justify-center'
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellSize * zoom}px)`,
        gridAutoRows: `${cellSize * zoom}px`,
        gap: `${gap}px`,
      }}
      aria-hidden='true'
    >
      {Array.from({ length: rows }).flatMap((_, r) =>
        Array.from({ length: cols }).map((__, c) => {
          const key = `${r}-${c}`
          const on = filled.has(`${r},${c}`)

          return (
            <div
              key={key}
              style={{
                width: cellSize * zoom,
                height: cellSize * zoom,
                backgroundColor: on ? SHAPE_COLORS[shape] : 'transparent',
                borderColor: on ? `${SHAPE_COLORS[shape]}80` : 'transparent'
              }}
              className={
                on
                  ? 'rounded-[1px] border'
                  : 'rounded-[1px] border border-transparent'
              }
            />
          )
        })
      )}
    </div>
  )
}
