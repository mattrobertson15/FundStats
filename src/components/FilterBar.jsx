import React, { useState } from 'react'
import { ROUNDS, ROUND_COLORS, SECTORS } from '../data/sampleData'
import { BarChart2, Building2, Check, ChevronDown, TrendingUp } from 'lucide-react'

const PERIODS = ['daily', 'monthly', 'quarterly', 'yearly']
const ALL_ROUND_OPTIONS = ['Total', ...ROUNDS]

export default function FilterBar({
  period,
  setPeriod,
  activeRounds,
  setActiveRounds,
  activeSectors,
  setActiveSectors,
  chartType,
  setChartType,
}) {
  const [industryMenuOpen, setIndustryMenuOpen] = useState(false)

  function toggleRound(rnd) {
    if (rnd === 'Total') {
      setActiveRounds(['Total'])
      return
    }
    const withoutTotal = activeRounds.filter(r => r !== 'Total')
    if (withoutTotal.includes(rnd)) {
      const next = withoutTotal.filter(r => r !== rnd)
      setActiveRounds(next.length === 0 ? ['Total'] : next)
    } else {
      setActiveRounds([...withoutTotal, rnd])
    }
  }

  function toggleSector(sector) {
    if (activeSectors.includes(sector)) {
      setActiveSectors(activeSectors.filter(s => s !== sector))
    } else {
      setActiveSectors([...activeSectors, sector])
    }
  }

  function toggleAllSectors() {
    setActiveSectors(activeSectors.length === SECTORS.length ? [] : SECTORS)
  }

  const isActive = (rnd) => {
    if (rnd === 'Total') return activeRounds.includes('Total')
    return !activeRounds.includes('Total') && activeRounds.includes(rnd)
  }

  const selectedIndustryLabel = activeSectors.length === SECTORS.length
    ? 'All Industries'
    : `${activeSectors.length} Industries`

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Period selector */}
      <div className="flex items-center bg-[#18181b] border border-[#27272a] rounded-lg p-1 gap-0.5">
        {PERIODS.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
              period === p
                ? 'bg-[#6366f1] text-white shadow-sm'
                : 'text-[#71717a] hover:text-[#a1a1aa]'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chart type toggle */}
      <div className="flex items-center bg-[#18181b] border border-[#27272a] rounded-lg p-1 gap-0.5">
        <button
          onClick={() => setChartType('area')}
          title="Area chart"
          className={`p-1.5 rounded-md transition-all ${
            chartType === 'area' ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#52525b] hover:text-[#a1a1aa]'
          }`}
        >
          <TrendingUp size={14} />
        </button>
        <button
          onClick={() => setChartType('bar')}
          title="Bar chart"
          className={`p-1.5 rounded-md transition-all ${
            chartType === 'bar' ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#52525b] hover:text-[#a1a1aa]'
          }`}
        >
          <BarChart2 size={14} />
        </button>
      </div>

      {/* Industry selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIndustryMenuOpen(!industryMenuOpen)}
          className="h-9 flex items-center gap-2 bg-[#18181b] border border-[#27272a] rounded-lg px-3 text-xs font-medium text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#3f3f46] transition-all"
        >
          <Building2 size={14} />
          <span>{selectedIndustryLabel}</span>
          <ChevronDown
            size={14}
            className={`transition-transform ${industryMenuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {industryMenuOpen && (
          <div className="absolute left-0 top-11 z-40 w-64 rounded-xl border border-[#27272a] bg-[#18181b] shadow-2xl p-2">
            <label className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-[#fafafa] hover:bg-[#27272a] cursor-pointer">
              <input
                type="checkbox"
                checked={activeSectors.length === SECTORS.length}
                onChange={toggleAllSectors}
                className="sr-only"
              />
              <span className="w-4 h-4 rounded border border-[#3f3f46] bg-[#09090b] flex items-center justify-center">
                {activeSectors.length === SECTORS.length && <Check size={12} className="text-[#fafafa]" />}
              </span>
              All Industries
            </label>

            <div className="my-1 border-t border-[#27272a]" />

            <div className="max-h-64 overflow-y-auto pr-1">
              {SECTORS.map(sector => {
                const selected = activeSectors.includes(sector)
                return (
                  <label
                    key={sector}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#fafafa] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSector(sector)}
                      className="sr-only"
                    />
                    <span
                      className="w-4 h-4 rounded border flex items-center justify-center"
                      style={{
                        background: selected ? '#6366f1' : '#09090b',
                        borderColor: selected ? '#6366f1' : '#3f3f46',
                      }}
                    >
                      {selected && <Check size={12} className="text-white" />}
                    </span>
                    <span className="truncate">{sector}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Round checkboxes */}
      <div className="flex flex-wrap gap-2">
        {ALL_ROUND_OPTIONS.map(rnd => {
          const color = rnd === 'Total' ? '#6366f1' : ROUND_COLORS[rnd]
          const active = isActive(rnd)
          return (
            <button
              key={rnd}
              onClick={() => toggleRound(rnd)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={{
                background: active ? color + '18' : 'transparent',
                borderColor: active ? color + '55' : '#27272a',
                color: active ? color : '#52525b',
              }}
            >
              <span
                className="w-3 h-3 rounded-sm border-2 flex items-center justify-center transition-all flex-shrink-0"
                style={{ borderColor: active ? color : '#3f3f46', background: active ? color : 'transparent' }}
              >
                {active && (
                  <svg viewBox="0 0 10 8" className="w-2 h-2" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {rnd}
            </button>
          )
        })}
      </div>
    </div>
  )
}
