import React, { useState } from 'react'
import { RoundBadge, SectorBadge } from './Badge'
import { ArrowUpRight, X, MapPin, Calendar, DollarSign, TrendingUp, Globe } from 'lucide-react'

function formatAmount(n) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`
  return `$${n}M`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getWebsiteUrl(raise) {
  if (raise.website) return raise.website

  const domain = raise.company
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')

  return `https://${domain}.com`
}

function formatHostname(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function DetailModal({ raise, onClose }) {
  if (!raise) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-[#27272a] bg-[#18181b] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#27272a]">
          <div>
            <h2 className="text-lg font-semibold text-[#fafafa]">{raise.company}</h2>
            <div className="flex items-center gap-2 mt-2">
              <RoundBadge round={raise.round} />
              <SectorBadge sector={raise.sector} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#52525b] hover:text-[#a1a1aa] transition-colors p-1 rounded-lg hover:bg-[#27272a]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-px bg-[#27272a] border-b border-[#27272a]">
          {[
            { icon: <DollarSign size={14} />, label: 'Raised',     value: formatAmount(raise.amount) },
            { icon: <TrendingUp size={14} />, label: 'Valuation',  value: raise.valuation ? formatAmount(raise.valuation) : '—' },
            { icon: <Calendar size={14} />,   label: 'Announced',  value: formatDate(raise.date) },
            { icon: <MapPin size={14} />,     label: 'HQ',         value: raise.hq },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-[#18181b] p-4">
              <p className="text-[#52525b] text-xs flex items-center gap-1.5 mb-1">
                {icon} {label}
              </p>
              <p className="text-[#fafafa] text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="p-6 space-y-4">
          <p className="text-[#a1a1aa] text-sm leading-relaxed">{raise.description}</p>
          <a
            href={getWebsiteUrl(raise)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[#27272a] bg-[#09090b] px-3 py-2 text-sm font-medium text-[#fafafa] transition-colors hover:border-[#6366f1] hover:text-white"
          >
            <Globe size={15} className="text-[#818cf8]" />
            {formatHostname(getWebsiteUrl(raise))}
            <ArrowUpRight size={14} className="text-[#52525b]" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default function NewsFeed({ raises, activeRounds }) {
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = raises
    .filter(r => {
      const matchRound = activeRounds.includes('Total') || activeRounds.includes(r.round)
      const matchSearch = !search || r.company.toLowerCase().includes(search.toLowerCase()) || r.sector.toLowerCase().includes(search.toLowerCase())
      return matchRound && matchSearch
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const total = filtered.reduce((s, r) => s + r.amount, 0)

  return (
    <div>
      <DetailModal raise={selected} onClose={() => setSelected(null)} />

      {/* Section header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#fafafa]">Funding Rounds</h2>
          <p className="text-xs text-[#52525b] mt-0.5">
            {filtered.length} rounds · {formatAmount(total)} total raised
          </p>
        </div>
        <input
          type="text"
          placeholder="Search company or sector…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#52525b] outline-none focus:border-[#6366f1] transition-colors w-56"
        />
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#52525b] text-sm">
            No matching rounds found.
          </div>
        )}
        {filtered.map(raise => {
          const websiteUrl = getWebsiteUrl(raise)

          return (
            <div
              key={raise.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(raise)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelected(raise)
                }
              }}
              className="w-full text-left group flex items-start gap-4 p-4 rounded-xl border border-[#27272a] bg-[#18181b] hover:border-[#3f3f46] hover:bg-[#1c1c1f] transition-all cursor-pointer"
            >
              {/* Company initial */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: '#6366f115', color: '#6366f1', border: '1px solid #6366f125' }}
              >
                {raise.company.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-[#fafafa] group-hover:text-white">{raise.company}</span>
                  <RoundBadge round={raise.round} small />
                  <SectorBadge sector={raise.sector} />
                </div>
                <p className="text-xs text-[#71717a] mt-1 line-clamp-1">{raise.description}</p>
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  onKeyDown={e => e.stopPropagation()}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#818cf8] hover:text-[#a5b4fc]"
                >
                  <Globe size={13} />
                  {formatHostname(websiteUrl)}
                  <ArrowUpRight size={12} />
                </a>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-sm font-bold text-[#fafafa]">{formatAmount(raise.amount)}</span>
                <span className="text-[10px] text-[#52525b]">{formatDate(raise.date)}</span>
                <ArrowUpRight
                  size={14}
                  className="text-[#3f3f46] group-hover:text-[#6366f1] transition-colors mt-0.5"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
