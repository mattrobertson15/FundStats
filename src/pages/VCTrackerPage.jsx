import React from 'react'
import { Link } from 'react-router-dom'
import { Network } from 'lucide-react'
import VCTracker from '../components/VCTracker'

export default function VCTrackerPage() {
  return (
    <div className="space-y-6">
      {/* Co-investor network callout */}
      <Link
        to="/vc/network"
        className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#27272a] bg-[#18181b] hover:border-[#3f3f46] hover:bg-[#1c1c1f] transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#6366f115] border border-[#6366f125] flex items-center justify-center flex-shrink-0">
            <Network size={15} className="text-[#818cf8]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#fafafa]">Co-Investor Network</p>
            <p className="text-xs text-[#52525b]">Discover which firms frequently back the same companies together</p>
          </div>
        </div>
        <span className="text-xs text-[#52525b] group-hover:text-[#6366f1] transition-colors flex-shrink-0">
          Explore →
        </span>
      </Link>

      <VCTracker />
    </div>
  )
}
