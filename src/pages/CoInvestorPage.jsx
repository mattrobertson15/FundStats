import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { useData } from '../context/DataContext'
import { computeCoInvestments, getPairKey } from '../utils/coInvestor'
import { RoundBadge } from '../components/Badge'
import { toSlug } from '../utils/slugify'

function formatAmount(n) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`
  return `$${n}M`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

// Abbreviated labels for the heatmap columns (max ~4 chars)
const ABBREV = {
  'a16z':          'a16z',
  'sequoia':       'SEQ',
  'founders-fund': 'FF',
  'yc':            'YC',
  'benchmark':     'BNCH',
  'lightspeed':    'LSP',
  'tiger-global':  'TGR',
  'accel':         'ACCL',
  'gv':            'GV',
  'kleiner':       'KP',
}

function cellBg(count, maxCount) {
  if (count === 0) return null
  const t = Math.sqrt(count / maxCount) // sqrt for nicer color spread
  const alpha = 0.18 + t * 0.72
  return `rgba(99, 102, 241, ${alpha.toFixed(2)})`
}

export default function CoInvestorPage() {
  const { raises, vcFirms } = useData()
  const [selected, setSelected]   = useState(null) // { key, nameA, nameB }
  const [hoverInfo, setHoverInfo] = useState(null)  // { nameA, nameB, count }

  const { pairCounts, sharedDeals, firmTotals } = useMemo(
    () => computeCoInvestments(raises, vcFirms),
    [raises, vcFirms]
  )

  const maxCount = Math.max(...Object.values(pairCounts), 1)

  // Summary stats
  const [strongestKey, strongestCount] = useMemo(
    () => Object.entries(pairCounts).sort((a, b) => b[1] - a[1])[0] || ['', 0],
    [pairCounts]
  )
  const strongestNames = strongestKey
    ? strongestKey.split('|').map(n => vcFirms.find(f => f.shortName === n)?.shortName ?? n)
    : []

  const mostConnected = useMemo(
    () => Object.entries(firmTotals).sort((a, b) => b[1] - a[1])[0] || ['—', 0],
    [firmTotals]
  )

  const activeRelationships = Object.keys(pairCounts).length

  const selectedDeals = selected ? (sharedDeals[selected.key] || []) : []
  const selectedFirmA  = selected ? vcFirms.find(f => f.shortName === selected.nameA) : null
  const selectedFirmB  = selected ? vcFirms.find(f => f.shortName === selected.nameB) : null

  function handleCellClick(firmA, firmB, count) {
    if (count === 0) return
    const key = getPairKey(firmA.shortName, firmB.shortName)
    if (selected?.key === key) {
      setSelected(null)
    } else {
      setSelected({ key, nameA: firmA.shortName, nameB: firmB.shortName })
    }
  }

  const rankedFirms = useMemo(
    () => [...vcFirms]
      .map(f => ({ firm: f, total: firmTotals[f.shortName] || 0 }))
      .sort((a, b) => b.total - a.total),
    [vcFirms, firmTotals]
  )
  const maxFirmTotal = rankedFirms[0]?.total || 1

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#52525b]">
        <Link to="/vc" className="hover:text-[#a1a1aa] transition-colors flex items-center gap-1.5">
          <ArrowLeft size={14} /> VC Tracker
        </Link>
        <span>/</span>
        <span className="text-[#fafafa]">Co-Investor Network</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#fafafa]">Co-Investor Network</h1>
        <p className="text-sm text-[#52525b] mt-1">
          Discover which firms frequently back the same companies. Click any cell to see shared deals.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Active Relationships', value: activeRelationships,         sub: 'unique firm pairs' },
          { label: 'Strongest Pair',       value: strongestNames.join(' × '), sub: `${strongestCount} shared deal${strongestCount !== 1 ? 's' : ''}` },
          { label: 'Most Connected',       value: mostConnected[0],            sub: `${mostConnected[1]} co-investment${mostConnected[1] !== 1 ? 's' : ''}` },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-xl bg-[#18181b] border border-[#27272a] p-4">
            <p className="text-xs text-[#52525b] mb-1">{label}</p>
            <p className="text-lg font-bold text-[#fafafa] truncate">{value}</p>
            {sub && <p className="text-xs text-[#52525b] mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Main grid: heatmap + ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Heatmap — 2/3 width */}
        <div className="lg:col-span-2 rounded-2xl border border-[#27272a] bg-[#18181b] p-5">
          <h2 className="text-sm font-semibold text-[#fafafa] mb-1">Investment Overlap Matrix</h2>
          <p className="text-xs text-[#52525b] mb-5">Darker cells = more shared deals between two firms.</p>

          {/* Hover label */}
          <div className="h-6 mb-3 flex items-center">
            {hoverInfo && hoverInfo.count > 0 ? (
              <p className="text-xs text-[#a1a1aa]">
                <span className="text-[#fafafa] font-semibold">{hoverInfo.nameA}</span>
                {' '}&times;{' '}
                <span className="text-[#fafafa] font-semibold">{hoverInfo.nameB}</span>
                {' — '}
                <span className="text-[#818cf8]">{hoverInfo.count} shared deal{hoverInfo.count !== 1 ? 's' : ''}</span>
                {hoverInfo.count > 0 && <span className="text-[#52525b]"> · click to explore</span>}
              </p>
            ) : (
              <p className="text-xs text-[#3f3f46]">Hover a cell to preview, click to see deals</p>
            )}
          </div>

          {/* Matrix */}
          <div className="overflow-x-auto">
            <table className="border-separate" style={{ borderSpacing: 3 }}>
              <thead>
                <tr>
                  {/* Empty corner */}
                  <th className="w-20" />
                  {vcFirms.map(f => (
                    <th
                      key={f.id}
                      className="text-center pb-1"
                      style={{ width: 40, minWidth: 40 }}
                    >
                      <span
                        className="text-[10px] font-semibold"
                        style={{ color: f.color }}
                      >
                        {ABBREV[f.id] ?? f.shortName.slice(0, 4)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vcFirms.map(rowFirm => (
                  <tr key={rowFirm.id}>
                    {/* Row label */}
                    <td className="pr-3 text-right">
                      <span
                        className="text-[11px] font-medium whitespace-nowrap"
                        style={{ color: rowFirm.color }}
                      >
                        {rowFirm.shortName.length > 12
                          ? rowFirm.shortName.slice(0, 11) + '…'
                          : rowFirm.shortName}
                      </span>
                    </td>

                    {vcFirms.map(colFirm => {
                      const isDiag = rowFirm.id === colFirm.id
                      if (isDiag) {
                        return (
                          <td key={colFirm.id}>
                            <div
                              className="rounded-md flex items-center justify-center"
                              style={{ width: 40, height: 40, background: '#27272a' }}
                            >
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: rowFirm.color, opacity: 0.6 }}
                              />
                            </div>
                          </td>
                        )
                      }

                      const key   = getPairKey(rowFirm.shortName, colFirm.shortName)
                      const count = pairCounts[key] || 0
                      const bg    = cellBg(count, maxCount)
                      const isSelected = selected?.key === key

                      return (
                        <td key={colFirm.id}>
                          <div
                            role={count > 0 ? 'button' : undefined}
                            tabIndex={count > 0 ? 0 : undefined}
                            onClick={() => handleCellClick(rowFirm, colFirm, count)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') handleCellClick(rowFirm, colFirm, count)
                            }}
                            onMouseEnter={() => setHoverInfo({ nameA: rowFirm.shortName, nameB: colFirm.shortName, count })}
                            onMouseLeave={() => setHoverInfo(null)}
                            className="rounded-md flex items-center justify-center transition-all"
                            style={{
                              width: 40,
                              height: 40,
                              background: bg || '#09090b',
                              border: isSelected
                                ? '2px solid #6366f1'
                                : `1px solid ${count > 0 ? '#6366f135' : '#27272a'}`,
                              cursor: count > 0 ? 'pointer' : 'default',
                              transform: isSelected ? 'scale(1.05)' : undefined,
                            }}
                          >
                            {count > 0 && (
                              <span
                                className="text-xs font-bold"
                                style={{ color: count / maxCount > 0.5 ? '#fff' : '#a5b4fc' }}
                              >
                                {count}
                              </span>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Most connected firms ranking — 1/3 width */}
        <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-5">
          <h2 className="text-sm font-semibold text-[#fafafa] mb-4">Most Connected Firms</h2>
          <div className="space-y-3">
            {rankedFirms.map(({ firm, total }, i) => (
              <div key={firm.id} className="flex items-center gap-3">
                <span className="text-xs text-[#52525b] w-4 text-right flex-shrink-0">{i + 1}</span>
                <Link
                  to={`/vc/${firm.id}`}
                  className="text-xs font-medium hover:text-white transition-colors flex-shrink-0 w-24 truncate"
                  style={{ color: firm.color }}
                >
                  {firm.shortName}
                </Link>
                <div className="flex-1 h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(total / maxFirmTotal) * 100}%`,
                      background: firm.color,
                      opacity: 0.85,
                    }}
                  />
                </div>
                <span className="text-xs text-[#52525b] w-4 text-right flex-shrink-0">{total}</span>
              </div>
            ))}
          </div>

          {/* Color legend */}
          <div className="mt-6 pt-4 border-t border-[#27272a]">
            <p className="text-[10px] text-[#52525b] mb-2 uppercase tracking-wider">Deal intensity</p>
            <div className="flex items-center gap-1.5">
              <div className="h-3 flex-1 rounded-sm" style={{
                background: 'linear-gradient(to right, rgba(99,102,241,0.18), rgba(99,102,241,0.9))',
              }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-[#52525b]">1 deal</span>
              <span className="text-[10px] text-[#52525b]">{maxCount} deals</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected pair detail */}
      {selected && selectedFirmA && selectedFirmB && (
        <div className="rounded-2xl border border-[#6366f130] bg-[#18181b] p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: selectedFirmA.color }} />
                <Link to={`/vc/${selectedFirmA.id}`} className="text-sm font-semibold text-[#fafafa] hover:text-white">
                  {selectedFirmA.shortName}
                </Link>
              </div>
              <span className="text-[#52525b] text-sm">&times;</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: selectedFirmB.color }} />
                <Link to={`/vc/${selectedFirmB.id}`} className="text-sm font-semibold text-[#fafafa] hover:text-white">
                  {selectedFirmB.shortName}
                </Link>
              </div>
              <span className="text-xs text-[#818cf8] bg-[#6366f115] border border-[#6366f130] px-2 py-0.5 rounded-full">
                {selectedDeals.length} shared deal{selectedDeals.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-[#52525b] hover:text-[#a1a1aa] transition-colors"
            >
              Clear ×
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {selectedDeals.map(raise => (
              <Link
                key={raise.id}
                to={`/company/${toSlug(raise.company)}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-[#27272a] bg-[#09090b] hover:border-[#3f3f46] hover:bg-[#1c1c1f] transition-all group"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: '#6366f115', color: '#6366f1', border: '1px solid #6366f125' }}
                >
                  {raise.company.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-[#fafafa] group-hover:text-white truncate">
                      {raise.company}
                    </span>
                    <RoundBadge round={raise.round} small />
                  </div>
                  <p className="text-xs text-[#52525b]">{formatDate(raise.date)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#fafafa]">{formatAmount(raise.amount)}</p>
                  <ArrowUpRight size={12} className="text-[#3f3f46] group-hover:text-[#6366f1] ml-auto mt-0.5 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
