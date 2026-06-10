import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, DollarSign, TrendingUp, Globe, ArrowUpRight } from 'lucide-react'
import { RoundBadge, SectorBadge } from '../components/Badge'
import { useData } from '../context/DataContext'
import { fromSlug } from '../utils/slugify'

function formatAmount(n) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`
  return `$${n}M`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function getWebsiteUrl(raise) {
  if (raise.website) return raise.website
  return `https://${raise.company.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com`
}

export default function CompanyPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { raises, vcFirms } = useData()

  const raise = fromSlug(slug, raises)

  if (!raise) {
    return (
      <div className="py-24 text-center text-[#52525b]">
        <p className="text-lg font-semibold text-[#fafafa] mb-2">Company not found</p>
        <button onClick={() => navigate(-1)} className="text-sm text-[#6366f1] hover:underline">
          ← Go back
        </button>
      </div>
    )
  }

  const websiteUrl = getWebsiteUrl(raise)

  // Match investor names to vcFirms for linking
  const investors = (raise.investors || []).map(shortName => {
    const firm = vcFirms.find(f => f.shortName === shortName)
    return { shortName, firm }
  })

  // Related companies — same sector, different company
  const related = raises
    .filter(r => r.sector === raise.sector && r.id !== raise.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4)

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#52525b]">
        <button
          onClick={() => navigate(-1)}
          className="hover:text-[#a1a1aa] transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <span>/</span>
        <span className="text-[#fafafa]">{raise.company}</span>
      </div>

      {/* Company header */}
      <div className="flex items-start gap-5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
          style={{ background: '#6366f115', color: '#6366f1', border: '1px solid #6366f125' }}
        >
          {raise.company.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-[#fafafa]">{raise.company}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <RoundBadge round={raise.round} />
            <SectorBadge sector={raise.sector} />
            <span className="text-xs text-[#52525b]">{formatDate(raise.date)}</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <DollarSign size={13} />, label: 'Raised',     value: formatAmount(raise.amount) },
          { icon: <TrendingUp size={13} />, label: 'Valuation',  value: raise.valuation ? formatAmount(raise.valuation) : '—' },
          { icon: <MapPin size={13} />,     label: 'HQ',         value: raise.hq || '—' },
          { icon: <Calendar size={13} />,   label: 'Announced',  value: formatDate(raise.date) },
        ].map(({ icon, label, value }) => (
          <div key={label} className="rounded-xl bg-[#18181b] border border-[#27272a] p-4">
            <p className="text-xs text-[#52525b] flex items-center gap-1.5 mb-1">{icon}{label}</p>
            <p className="text-sm font-bold text-[#fafafa] truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Description + investors */}
      <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-6 space-y-5">
        {raise.description && (
          <p className="text-sm text-[#a1a1aa] leading-relaxed">{raise.description}</p>
        )}

        {investors.length > 0 && (
          <div>
            <p className="text-xs text-[#52525b] mb-2">Investors</p>
            <div className="flex flex-wrap gap-2">
              {investors.map(({ shortName, firm }) =>
                firm ? (
                  <Link
                    key={shortName}
                    to={`/vc/${firm.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#27272a] bg-[#09090b] text-xs font-medium text-[#fafafa] hover:border-[#6366f1] transition-colors"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: firm.color }}
                    />
                    {shortName}
                  </Link>
                ) : (
                  <span
                    key={shortName}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#27272a] bg-[#09090b] text-xs font-medium text-[#71717a]"
                  >
                    {shortName}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        <a
          href={websiteUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-[#27272a] bg-[#09090b] px-3 py-2 text-sm font-medium text-[#fafafa] hover:border-[#6366f1] transition-colors"
        >
          <Globe size={14} className="text-[#818cf8]" />
          {websiteUrl.replace(/^https?:\/\//, '')}
          <ArrowUpRight size={13} className="text-[#52525b]" />
        </a>
      </div>

      {/* Related companies */}
      {related.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#fafafa] mb-3">
            More in {raise.sector}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {related.map(r => (
              <Link
                key={r.id}
                to={`/company/${r.company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-[#27272a] bg-[#18181b] hover:border-[#3f3f46] hover:bg-[#1c1c1f] transition-all group"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: '#6366f115', color: '#6366f1', border: '1px solid #6366f125' }}>
                  {r.company.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#fafafa] group-hover:text-white truncate">{r.company}</p>
                  <p className="text-xs text-[#52525b]">{r.round} · {formatAmount(r.amount)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
