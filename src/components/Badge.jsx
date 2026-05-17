import React from 'react'
import { ROUND_COLORS } from '../data/sampleData'

const sectorColors = {
  'AI/ML':         '#6366f1',
  'CleanTech':     '#22c55e',
  'HealthTech':    '#38bdf8',
  'Robotics':      '#f59e0b',
  'FinTech':       '#a78bfa',
  'DevTools':      '#818cf8',
  'Quantum':       '#c084fc',
  'Logistics':     '#fb923c',
  'Semiconductors':'#facc15',
  'Biotech':       '#34d399',
  'EdTech':        '#f472b6',
  'SpaceTech':     '#67e8f9',
  'Cybersecurity': '#f87171',
  'AgriTech':      '#86efac',
  'Materials':     '#fcd34d',
  'Analytics':     '#a5b4fc',
  'Cloud':         '#93c5fd',
  'Computer Vision':'#fb7185',
  'Data Privacy':  '#c4b5fd',
  'Mobility':      '#fdba74',
  'InsurTech':     '#6ee7b7',
  'Energy':        '#fde68a',
  'DefenseTech':   '#fca5a5',
}

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
  const color = sectorColors[sector] || '#a1a1aa'
  return (
    <span
      style={{ background: color + '18', color, border: `1px solid ${color}33` }}
      className="inline-flex items-center rounded-full text-[10px] font-medium px-2 py-0.5 tracking-wide"
    >
      {sector}
    </span>
  )
}
