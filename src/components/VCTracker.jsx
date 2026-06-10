import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import StatCard from './StatCard'
import VCCard from './VCCard'
import { useData } from '../context/DataContext'
import { computeVCStats } from '../utils/vcStats'

function formatAmount(n) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`
  return `$${n}M`
}

export default function VCTracker() {
  const { raises, vcFirms } = useData()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const vcStats = useMemo(
    () => vcFirms.map(firm => computeVCStats(firm, raises)),
    [raises, vcFirms]
  )

  const filteredStats = useMemo(() => {
    if (!search) return vcStats
    const q = search.toLowerCase()
    return vcStats.filter(v =>
      v.firm.name.toLowerCase().includes(q) ||
      v.firm.shortName.toLowerCase().includes(q)
    )
  }, [vcStats, search])

  const summaryStats = useMemo(() => {
    const seen = new Set()
    let totalDeployed = 0
    vcStats.forEach(({ portfolio }) => {
      portfolio.forEach(r => { if (!seen.has(r.id)) { seen.add(r.id); totalDeployed += r.amount } })
    })
    const mostActive = [...vcStats].sort((a, b) => b.investmentCount - a.investmentCount)[0]
    let largest = 0
    vcStats.forEach(({ portfolio }) => portfolio.forEach(r => { if (r.amount > largest) largest = r.amount }))
    return { totalDeployed, mostActive: mostActive?.firm.shortName || '—', largest }
  }, [vcStats])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#fafafa]">VC Tracker</h1>
        <p className="text-sm text-[#52525b] mt-1">Follow leading venture firms and track their portfolio activity.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Tracked Firms"   value={vcFirms.length}                        sub="venture firms" accent="#6366f1" />
        <StatCard label="Capital Tracked" value={formatAmount(summaryStats.totalDeployed)} />
        <StatCard label="Most Active"     value={summaryStats.mostActive} />
        <StatCard label="Largest Round"   value={formatAmount(summaryStats.largest)} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-[#fafafa]">Venture Firms</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b]" />
            <input
              type="text"
              placeholder="Search firms…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-[#18181b] border border-[#27272a] rounded-lg pl-8 pr-3 py-2 text-sm text-[#fafafa] placeholder:text-[#52525b] outline-none focus:border-[#6366f1] transition-colors w-44"
            />
          </div>
        </div>

        {filteredStats.length === 0 ? (
          <div className="text-center py-16 text-[#52525b] text-sm">No matching firms found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredStats.map(({ firm, totalDeployed, investmentCount, topSectors, stageCounts }) => (
              <VCCard
                key={firm.id}
                firm={firm}
                totalDeployed={totalDeployed}
                investmentCount={investmentCount}
                topSectors={topSectors}
                stageCounts={stageCounts}
                onClick={() => navigate(`/vc/${firm.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
