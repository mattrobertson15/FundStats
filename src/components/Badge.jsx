import React from 'react'
import { ROUND_COLORS, SECTOR_COLORS } from '../data/sampleData'

export function RoundBadge({ round, small }) {
  const color = ROUND_COLORS[round] || '#6366f1'
  return (
    <span
      style={{ background: color + '22', color, border: `1px solid ${color}44` }}
      className={`inline-flex items-center rounded-full font-medium tracking-wide ${small ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
    >
      {round}
    </span>
  )
}

export function SectorBadge({ sector }) {
  const color = SECTOR_COLORS[sector] || '#a1a1aa'
  return (
    <span
      style={{ background: color + '18', color, border: `1px solid ${color}33` }}
      className="inline-flex items-center rounded-full text-[10px] font-medium px-2 py-0.5 tracking-wide"
    >
      {sector}
    </span>
  )
}
