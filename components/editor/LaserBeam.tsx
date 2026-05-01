"use client"

import type { BeamSegment } from "@/lib/types"

export function LaserBeam({ beams }: { beams: BeamSegment[] }) {
  if (beams.length < 2) return null

  const points = beams.map((b) => `${b.c * 52 + 26},${b.r * 52 + 26}`).join(" ")

  return (
    <svg className="pointer-events-none absolute left-0 top-0" width={520} height={520}>
      <polyline
        className="beam-line"
        points={points}
        fill="none"
        stroke="#F59E0B"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
