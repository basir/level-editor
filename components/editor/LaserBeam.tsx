"use client"

import type { BeamSegment } from "@/lib/types"

export function LaserBeam({ beams }: { beams: BeamSegment[] }) {
  if (beams.length < 1) return null

  // Ensure points are centered in each 52px cell
  const points = beams.map((b) => `${b.c * 52 + 26 + 8},${b.r * 52 + 26 + 8}`).join(' ')

  return (
    <svg className='pointer-events-none absolute left-0 top-0 overflow-visible' width={520} height={520}>
      <defs>
        <filter id='laser-glow' x='-20%' y='-20%' width='140%' height='140%'>
          <feGaussianBlur stdDeviation='3' result='blur' />
          <feComposite in='SourceGraphic' in2='blur' operator='over' />
        </filter>
      </defs>

      {/* Outer Glow */}
      <polyline
        points={points}
        fill='none'
        stroke='#f59e0b'
        strokeWidth={12}
        strokeLinecap='round'
        strokeLinejoin='round'
        className='opacity-20'
        filter='url(#laser-glow)'
      />

      {/* Mid Glow */}
      <polyline
        points={points}
        fill='none'
        stroke='#fbbf24'
        strokeWidth={6}
        strokeLinecap='round'
        strokeLinejoin='round'
        className='opacity-40'
      />

      {/* Core Beam */}
      <polyline
        points={points}
        fill='none'
        stroke='#fffbeb'
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
        className='opacity-90'
      />
    </svg>
  )
}

