import React from 'react'
import { Routes, Route, NavLink, Outlet } from 'react-router-dom'
import { Activity } from 'lucide-react'
import MarketPage        from './pages/MarketPage'
import VCTrackerPage     from './pages/VCTrackerPage'
import VCFirmPage        from './pages/VCFirmPage'
import CompanyPage       from './pages/CompanyPage'
import CoInvestorPage    from './pages/CoInvestorPage'
import { useData }     from './context/DataContext'

const tabClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
    isActive ? 'bg-[#6366f1] text-white' : 'text-[#71717a] hover:text-[#a1a1aa]'
  }`

function Header() {
  const { loading, usingLiveData } = useData()

  return (
    <header className="border-b border-[#18181b] bg-[#09090b]/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <NavLink to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#6366f1] flex items-center justify-center">
            <Activity size={15} className="text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-[#fafafa]">Fund Stats</span>
        </NavLink>

        <div className="flex items-center bg-[#18181b] border border-[#27272a] rounded-lg p-1 gap-1">
          <NavLink to="/"   end className={tabClass}>Market</NavLink>
          <NavLink to="/vc"     className={tabClass}>VC Tracker</NavLink>
        </div>

        <div className="flex-shrink-0">
          {loading ? (
            <span className="text-xs text-[#52525b] bg-[#18181b] border border-[#27272a] px-2.5 py-1 rounded-full animate-pulse">
              Loading…
            </span>
          ) : (
            <span className="text-xs text-[#52525b] bg-[#18181b] border border-[#27272a] px-2.5 py-1 rounded-full">
              {usingLiveData ? 'Live Data' : 'Sample Data'}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

function Layout() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index                element={<MarketPage />} />
        <Route path="vc"            element={<VCTrackerPage />} />
        <Route path="vc/network"    element={<CoInvestorPage />} />
        <Route path="vc/:firmId"    element={<VCFirmPage />} />
        <Route path="company/:slug" element={<CompanyPage />} />
      </Route>
    </Routes>
  )
}
