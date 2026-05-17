import React from 'react'

export default function StatCard({ label, value, sub, accent }) {
  return (
    <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-4">
      <p className="text-xs text-[#52525b] mb-1">{label}</p>
      <p
        className="text-2xl font-bold tracking-tight"
        style={{ color: accent || '#fafafa' }}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-[#52525b] mt-1">{sub}</p>}
    </div>
  )
}
