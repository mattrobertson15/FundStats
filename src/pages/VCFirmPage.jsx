import React, { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Building2, Calendar, Network } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts'
import { RoundBadge } from '../components/Badge'
import { useData } from '../context/DataContext'
import { computeVCStats } from '../utils/vcStats'
import { ROUNDS, ROUND_COLORS, SECTOR_COLORS } from '../data/sampleData'
import { toSlug } from '../utils/slugify'

function formatAmount(n) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`
  return `$${n}M`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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

export default function VCFirmPage() {
  const { firmId } = useParams()
  const navigate = useNavigate()
  const { raises, vcFirms } = useData()

  const firm = vcFirms.find(f => f.id === firmId)

  const stats = useMemo(
    () => firm ? computeVCStats(firm, raises) : null,
    [firm, raises]
  )

  if (!firm || !stats) {
    return (
      <div className="py-24 text-center text-[#52525b]">
        <p className="text-lg font-semibold text-[#fafafa] mb-2">Firm not found</p>
        <button onClick={() => navigate('/vc')} className="text-sm text-[#6366f1] hover:underline">
          ← Back to VC Tracker
        </button>
      </div>
    )
  }

  const sectorBreakdown = Object.entries(
    stats.portfolio.reduce((acc, r) => { acc[r.sector] = (acc[r.sector] || 0) + 1; return acc }, {})
  ).sort((a, b) => b[1] - a[1])

  const maxSectorCount = sectorBreakdown[0]?.[1] || 1
  const maxStageCount = Math.max(...Object.values(stats.stageCounts), 1)
  const sortedPortfolio = [...stats.portfolio].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-[#52525b]">
          <Link to="/vc" className="hover:text-[#a1a1aa] transition-colors flex items-center gap-1.5">
            <ArrowLeft size={14} /> VC Tracker
          </Link>
          <span>/</span>
          <span className="text-[#fafafa]">{firm.shortName}</span>
        </div>
        <Link
          to="/vc/network"
          className="flex items-center gap-1.5 text-xs text-[#52525b] hover:text-[#818cf8] transition-colors"
        >
          <Network size={13} /> Co-Investor Network
        </Link>
      </div>

      {/* Firm header */}
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
          style={{ background: `${firm.color}18`, color: firm.color, border: `1px solid ${firm.color}30` }}
        >
          {firm.shortName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-[#fafafa]">{firm.name}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[#71717a]">
            <span className="flex items-center gap-1"><Building2 size={12} />{firm.hq}</span>
            <span className="flex items-center gap-1"><Calendar size={12} />Est. {firm.founded}</span>
            <span>AUM {firm.aum}</span>
          </div>
          {firm.description && (
            <p className="text-sm text-[#71717a] mt-2 max-w-2xl leading-relaxed">{firm.description}</p>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Deployed',        value: formatAmount(stats.totalDeployed) },
          { label: 'Investments',     value: stats.investmentCount },
          { label: 'Total Valuation', value: formatAmount(stats.totalValuation) },
          { label: 'Top Sector',      value: stats.topSectors[0] || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-[#18181b] border border-[#27272a] p-4">
            <p className="text-xs text-[#52525b] mb-1">{label}</p>
            <p className="text-lg font-bold text-[#fafafa] truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Investment Activity chart */}
      {stats.quarterlyData.length > 0 && (
        <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-5">
          <h2 className="text-sm font-semibold text-[#fafafa] mb-4">Investment Activity</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.quarterlyData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="period" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a55' }} />
              <Bar dataKey="amount" fill={firm.color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Analysis + Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sector + Stage analysis */}
        <div className="space-y-6">
          {sectorBreakdown.length > 0 && (
            <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-5">
              <h2 className="text-sm font-semibold text-[#fafafa] mb-4">Sector Breakdown</h2>
              <div className="space-y-3">
                {sectorBreakdown.map(([sector, count]) => (
                  <div key={sector} className="flex items-center gap-3">
                    <span className="text-xs text-[#71717a] w-28 flex-shrink-0 truncate">{sector}</span>
                    <div className="flex-1 h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(count / maxSectorCount) * 100}%`, background: SECTOR_COLORS[sector] || '#6366f1', opacity: 0.85 }}
                      />
                    </div>
                    <span className="text-xs text-[#52525b] w-3 text-right flex-shrink-0">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.investmentCount > 0 && (
            <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-5">
              <h2 className="text-sm font-semibold text-[#fafafa] mb-4">Stage Mix</h2>
              <div className="space-y-3">
                {ROUNDS.map(round => {
                  const count = stats.stageCounts[round]
                  if (!count) return null
                  return (
                    <div key={round} className="flex items-center gap-3">
                      <span className="text-xs text-[#71717a] w-16 flex-shrink-0">{round}</span>
                      <div className="flex-1 h-2 bg-[#27272a] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(count / maxStageCount) * 100}%`, background: ROUND_COLORS[round] }}
                        />
                      </div>
                      <span className="text-xs text-[#52525b] w-3 text-right flex-shrink-0">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Portfolio companies list */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-5">
            <h2 className="text-sm font-semibold text-[#fafafa] mb-4">
              Portfolio Companies
              <span className="ml-2 text-xs font-normal text-[#52525b]">{sortedPortfolio.length}</span>
            </h2>
            {sortedPortfolio.length === 0 ? (
              <p className="text-sm text-[#52525b]">No tracked investments.</p>
            ) : (
              <div className="space-y-2">
                {sortedPortfolio.map(raise => (
                  <Link
                    key={raise.id}
                    to={`/company/${toSlug(raise.company)}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#27272a] hover:border-[#3f3f46] hover:bg-[#1c1c1f] transition-all group"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: `${firm.color}18`, color: firm.color, border: `1px solid ${firm.color}28` }}
                    >
                      {raise.company.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[#fafafa] group-hover:text-white truncate">
                          {raise.company}
                        </span>
                        <RoundBadge round={raise.round} small />
                      </div>
                      <span className="text-xs text-[#52525b]">{raise.sector} · {formatDate(raise.date)}</span>
                    </div>
                    <span className="text-sm font-bold text-[#fafafa] flex-shrink-0">{formatAmount(raise.amount)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
