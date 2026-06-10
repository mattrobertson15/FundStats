import React from 'react'
import { ChevronRight } from 'lucide-react'
import { SectorBadge } from './Badge'
import { ROUNDS, ROUND_COLORS } from '../data/sampleData'

function formatAmount(n) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`
  return `$${n}M`
}

export default function VCCard({ firm, totalDeployed, investmentCount, topSectors, stageCounts, onClick }) {
  const totalStages = investmentCount || 1

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      className="cursor-pointer group flex flex-col gap-3.5 p-4 rounded-xl border border-[#27272a] bg-[#18181b] transition-all hover:bg-[#1c1c1f] hover:border-[#3f3f46]"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
            style={{ background: firm.color }}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#fafafa] leading-tight">{firm.shortName}</p>
            <p className="text-[11px] text-[#52525b] truncate">{firm.name}</p>
          </div>
        </div>
        <ChevronRight
          size={14}
          className="text-[#3f3f46] group-hover:text-[#6366f1] transition-colors flex-shrink-0 mt-0.5"
        />
      </div>

      {/* Key metrics */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-[#fafafa]">{formatAmount(totalDeployed)}</span>
        <span className="text-[#3f3f46]">·</span>
        <span className="text-[#71717a]">{investmentCount} investment{investmentCount !== 1 ? 's' : ''}</span>
      </div>

      {/* Top sectors */}
      {topSectors.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {topSectors.map(s => <SectorBadge key={s} sector={s} />)}
        </div>
      )}

      {/* Stage distribution bar */}
      {investmentCount > 0 && (
        <div className="flex h-1.5 rounded-full overflow-hidden gap-[2px]">
          {ROUNDS.map(round => {
            const pct = (stageCounts[round] / totalStages) * 100
            if (pct === 0) return null
            return (
              <div
                key={round}
                title={`${round}: ${stageCounts[round]}`}
                style={{ width: `${pct}%`, background: ROUND_COLORS[round] }}
                className="rounded-full"
              />
            )
          })}
        </div>
      )}

      {investmentCount === 0 && (
        <p className="text-xs text-[#3f3f46]">No tracked investments</p>
      )}
    </div>
  )
}
