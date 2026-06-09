import React from 'react'
import { X, MapPin, Calendar, DollarSign, TrendingUp, Globe, ArrowUpRight } from 'lucide-react'
import { RoundBadge, SectorBadge } from './Badge'

function formatAmount(n) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`
  return `$${n}M`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function getWebsiteUrl(raise) {
  if (raise.website) return raise.website
  const domain = raise.company.toLowerCase().replace(/[^a-z0-9]+/g, '')
  return `https://${domain}.com`
}

function formatHostname(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

export default function DetailModal({ raise, onClose }) {
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

        <div className="grid grid-cols-2 gap-px bg-[#27272a] border-b border-[#27272a]">
          {[
            { icon: <DollarSign size={14} />, label: 'Raised',    value: formatAmount(raise.amount) },
            { icon: <TrendingUp size={14} />, label: 'Valuation', value: raise.valuation ? formatAmount(raise.valuation) : '—' },
            { icon: <Calendar size={14} />,   label: 'Announced', value: formatDate(raise.date) },
            { icon: <MapPin size={14} />,     label: 'HQ',        value: raise.hq },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-[#18181b] p-4">
              <p className="text-[#52525b] text-xs flex items-center gap-1.5 mb-1">{icon} {label}</p>
              <p className="text-[#fafafa] text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>

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
