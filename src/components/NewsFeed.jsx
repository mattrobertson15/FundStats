import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { RoundBadge, SectorBadge } from './Badge'
import { ArrowUpRight, Globe } from 'lucide-react'
import { toSlug } from '../utils/slugify'

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
  return `https://${raise.company.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com`
}

function formatHostname(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

export default function NewsFeed({ raises, activeRounds }) {
  const [search, setSearch] = useState('')

  const filtered = raises
    .filter(r => {
      const matchRound  = activeRounds.includes('Total') || activeRounds.includes(r.round)
      const matchSearch = !search
        || r.company.toLowerCase().includes(search.toLowerCase())
        || r.sector.toLowerCase().includes(search.toLowerCase())
      return matchRound && matchSearch
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const total = filtered.reduce((s, r) => s + r.amount, 0)

  return (
    <div>
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

      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#52525b] text-sm">No matching rounds found.</div>
        )}
        {filtered.map(raise => {
          const websiteUrl = getWebsiteUrl(raise)
          return (
            <Link
              key={raise.id}
              to={`/company/${toSlug(raise.company)}`}
              className="w-full text-left group flex items-start gap-4 p-4 rounded-xl border border-[#27272a] bg-[#18181b] hover:border-[#3f3f46] hover:bg-[#1c1c1f] transition-all"
            >
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
                <ArrowUpRight size={14} className="text-[#3f3f46] group-hover:text-[#6366f1] transition-colors mt-0.5" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
