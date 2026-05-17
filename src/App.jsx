import React, { useState, useMemo } from 'react'
import { Activity } from 'lucide-react'
import FundingChart from './components/FundingChart'
import FilterBar from './components/FilterBar'
import NewsFeed from './components/NewsFeed'
import StatCard from './components/StatCard'
import { raises } from './data/sampleData'

function formatAmount(n) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`
  return `$${n}M`
}

export default function App() {
  const [period, setPeriod] = useState('quarterly')
  const [activeRounds, setActiveRounds] = useState(['Total'])
  const [chartType, setChartType] = useState('area')

  const filteredRaises = useMemo(() => {
    if (activeRounds.includes('Total')) return raises
    return raises.filter(r => activeRounds.includes(r.round))
  }, [activeRounds])

  const stats = useMemo(() => {
    const total = filteredRaises.reduce((s, r) => s + r.amount, 0)
    const avgDeal = filteredRaises.length ? total / filteredRaises.length : 0
    const largest = filteredRaises.reduce((m, r) => r.amount > m ? r.amount : m, 0)
    const companies = new Set(filteredRaises.map(r => r.company)).size
    return { total, avgDeal, largest, companies }
  }, [filteredRaises])

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Topbar */}
      <header className="border-b border-[#18181b] bg-[#09090b]/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#6366f1] flex items-center justify-center">
              <Activity size={15} className="text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-[#fafafa]">Fund Stats</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#52525b] bg-[#18181b] border border-[#27272a] px-2.5 py-1 rounded-full">
              Sample Data · 2024–2025
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Hero */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#fafafa]">
            Venture Capital Funding
          </h1>
          <p className="text-sm text-[#52525b] mt-1">
            Track and analyze startup funding rounds across stages and sectors.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total Raised"
            value={formatAmount(stats.total)}
            sub={`${filteredRaises.length} rounds`}
            accent="#6366f1"
          />
          <StatCard
            label="Avg Deal Size"
            value={formatAmount(Math.round(stats.avgDeal))}
          />
          <StatCard
            label="Largest Round"
            value={formatAmount(stats.largest)}
          />
          <StatCard
            label="Companies"
            value={stats.companies}
            sub="unique"
          />
        </div>

        {/* Chart panel */}
        <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-5 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-[#fafafa]">Total Venture Funding</h2>
            <p className="text-xs text-[#52525b] mt-0.5">Aggregated by selected period and stage</p>
          </div>

          <FilterBar
            period={period}
            setPeriod={setPeriod}
            activeRounds={activeRounds}
            setActiveRounds={setActiveRounds}
            chartType={chartType}
            setChartType={setChartType}
          />

          <FundingChart
            period={period}
            activeRounds={activeRounds}
            raises={filteredRaises}
            chartType={chartType}
          />
        </div>

        {/* News feed */}
        <div className="rounded-2xl border border-[#27272a] bg-[#09090b] p-5">
          <NewsFeed raises={raises} activeRounds={activeRounds} />
        </div>

      </main>
    </div>
  )
}
