import React, { useState, useMemo } from 'react'
import { X, Building2, Calendar, DollarSign, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { RoundBadge } from './Badge'
import { ROUNDS, ROUND_COLORS, SECTOR_COLORS } from '../data/sampleData'
import DetailModal from './DetailModal'

function formatAmount(n) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`
  return `$${n}M`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[#27272a] bg-[#18181b] px-3 py-2 shadow-xl">
      <p className="text-xs text-[#71717a] mb-1">{label}</p>
      <p className="text-sm font-semibold text-[#fafafa]">{formatAmount(payload[0].value)}</p>
    </div>
  )
}

export default function VCDetailPanel({ vcData, onClose }) {
  const [selectedRaise, setSelectedRaise] = useState(null)
  const isOpen = !!vcData

  const quarterlyData = useMemo(() => {
    if (!vcData) return []
    const buckets = {}
    vcData.portfolio.forEach(r => {
      const d = new Date(r.date)
      const q = Math.floor(d.getMonth() / 3) + 1
      const key = `${d.getFullYear()} Q${q}`
      if (!buckets[key]) buckets[key] = { period: key, amount: 0 }
      buckets[key].amount += r.amount
    })
    return Object.values(buckets).sort((a, b) => a.period.localeCompare(b.period))
  }, [vcData])

  const sectorBreakdown = useMemo(() => {
    if (!vcData) return []
    const counts = {}
    vcData.portfolio.forEach(r => { counts[r.sector] = (counts[r.sector] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [vcData])

  const maxSectorCount = sectorBreakdown[0]?.[1] || 1

  const stageCounts = useMemo(() => {
    const counts = {}
    ROUNDS.forEach(r => { counts[r] = 0 })
    if (vcData) vcData.portfolio.forEach(r => { counts[r.round]++ })
    return counts
  }, [vcData])

  const maxStageCount = Math.max(...Object.values(stageCounts), 1)

  const sortedPortfolio = useMemo(() => {
    if (!vcData) return []
    return [...vcData.portfolio].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [vcData])

  return (
    <>
      <DetailModal raise={selectedRaise} onClose={() => setSelectedRaise(null)} />

      {/* Backdrop — starts below the 56px sticky header */}
      {isOpen && (
        <div
          className="fixed left-0 right-0 bottom-0 z-40"
          style={{ top: '56px', background: 'rgba(0,0,0,0.4)' }}
          onClick={onClose}
        />
      )}

      {/* Slide-in panel */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[480px] z-40 flex flex-col bg-[#0d0d0f] border-l border-[#27272a]"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {vcData && (
          <>
            {/* Panel header */}
            <div className="flex items-start justify-between p-5 border-b border-[#27272a] flex-shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: vcData.firm.color }}
                  />
                  <span className="text-sm font-semibold text-[#fafafa]">{vcData.firm.shortName}</span>
                </div>
                <p className="text-xs text-[#71717a] mt-0.5 pl-[18px]">{vcData.firm.name}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 pl-[18px] text-xs text-[#52525b]">
                  <span className="flex items-center gap-1"><Building2 size={11} />{vcData.firm.hq}</span>
                  <span className="flex items-center gap-1"><Calendar size={11} />Est. {vcData.firm.founded}</span>
                  <span>AUM {vcData.firm.aum}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-[#52525b] hover:text-[#a1a1aa] p-1.5 rounded-lg hover:bg-[#27272a] transition-colors flex-shrink-0 ml-3"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">

              {/* Summary stats */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Deployed',       value: formatAmount(vcData.totalDeployed),  icon: <DollarSign size={12} /> },
                  { label: 'Investments',    value: vcData.investmentCount,              icon: <TrendingUp size={12} /> },
                  { label: 'Total Valuation',value: formatAmount(vcData.totalValuation), icon: <TrendingUp size={12} /> },
                  { label: 'Top Sector',     value: vcData.topSectors[0] || '—',        icon: <Building2 size={12} /> },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="rounded-xl bg-[#18181b] border border-[#27272a] p-3">
                    <p className="text-[10px] text-[#52525b] flex items-center gap-1 mb-1">{icon}{label}</p>
                    <p className="text-sm font-semibold text-[#fafafa] truncate">{value}</p>
                  </div>
                ))}
              </div>

              {/* Investment Activity */}
              {quarterlyData.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest mb-3">
                    Investment Activity
                  </h3>
                  <div className="rounded-xl bg-[#18181b] border border-[#27272a] p-4">
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={quarterlyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis
                          dataKey="period"
                          tick={{ fill: '#52525b', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: '#52525b', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={v => `$${v}M`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a55' }} />
                        <Bar dataKey="amount" fill={vcData.firm.color} radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Sector Breakdown */}
              {sectorBreakdown.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest mb-3">
                    Sector Breakdown
                  </h3>
                  <div className="space-y-2.5">
                    {sectorBreakdown.map(([sector, count]) => (
                      <div key={sector} className="flex items-center gap-3">
                        <span className="text-xs text-[#71717a] w-32 flex-shrink-0 truncate">{sector}</span>
                        <div className="flex-1 h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(count / maxSectorCount) * 100}%`,
                              background: SECTOR_COLORS[sector] || '#6366f1',
                              opacity: 0.85,
                            }}
                          />
                        </div>
                        <span className="text-xs text-[#52525b] w-3 text-right flex-shrink-0">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage Mix */}
              {vcData.investmentCount > 0 && (
                <div>
                  <h3 className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest mb-3">
                    Stage Mix
                  </h3>
                  <div className="space-y-2">
                    {ROUNDS.map(round => {
                      const count = stageCounts[round]
                      if (count === 0) return null
                      return (
                        <div key={round} className="flex items-center gap-3">
                          <span className="text-xs text-[#71717a] w-16 flex-shrink-0">{round}</span>
                          <div className="flex-1 h-2 bg-[#27272a] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(count / maxStageCount) * 100}%`,
                                background: ROUND_COLORS[round],
                              }}
                            />
                          </div>
                          <span className="text-xs text-[#52525b] w-3 text-right flex-shrink-0">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Portfolio Companies */}
              <div>
                <h3 className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest mb-3">
                  Portfolio Companies
                </h3>
                {sortedPortfolio.length === 0 ? (
                  <p className="text-xs text-[#3f3f46]">No tracked investments.</p>
                ) : (
                  <div className="space-y-2">
                    {sortedPortfolio.map(raise => (
                      <div
                        key={raise.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedRaise(raise)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelectedRaise(raise)
                          }
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] hover:bg-[#1c1c1f] cursor-pointer transition-all group"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            background: `${vcData.firm.color}18`,
                            color: vcData.firm.color,
                            border: `1px solid ${vcData.firm.color}28`,
                          }}
                        >
                          {raise.company.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-[#fafafa] group-hover:text-white truncate">
                              {raise.company}
                            </span>
                            <RoundBadge round={raise.round} small />
                          </div>
                          <span className="text-[10px] text-[#52525b]">{formatDate(raise.date)}</span>
                        </div>
                        <span className="text-xs font-bold text-[#fafafa] flex-shrink-0">
                          {formatAmount(raise.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </>
  )
}
