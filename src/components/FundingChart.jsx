import React, { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { getChartData, ROUND_COLORS, ROUNDS } from '../data/sampleData'

const PERIOD_LABELS = {
  daily:     'Daily',
  monthly:   'Monthly',
  quarterly: 'Quarterly',
  yearly:    'Yearly',
}

function formatAmount(v) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}B`
  return `$${v}M`
}

function formatPeriodTick(value, period) {
  if (period === 'monthly') {
    const [year, month] = value.split('-')
    const d = new Date(year, month - 1)
    return d.toLocaleString('default', { month: 'short', year: '2-digit' })
  }
  return value
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + (p.value || 0), 0)
  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-3 shadow-2xl min-w-[160px]">
      <p className="text-[#a1a1aa] text-xs mb-2 font-medium">{label}</p>
      {payload.map(p => p.value > 0 && (
        <div key={p.name} className="flex justify-between gap-6 text-xs py-0.5">
          <span className="flex items-center gap-1.5" style={{ color: p.color }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="text-[#fafafa] font-medium">{formatAmount(p.value)}</span>
        </div>
      ))}
      {payload.length > 1 && (
        <div className="flex justify-between gap-6 text-xs border-t border-[#27272a] mt-2 pt-2">
          <span className="text-[#a1a1aa]">Total</span>
          <span className="text-[#fafafa] font-semibold">{formatAmount(total)}</span>
        </div>
      )}
    </div>
  )
}

export default function FundingChart({ period, activeRounds, raises, chartType }) {
  const data = useMemo(
    () => getChartData(period, activeRounds, raises),
    [period, activeRounds, raises]
  )

  const showTotal = activeRounds.includes('Total') && activeRounds.length === 1
  const seriesKeys = showTotal ? ['Total'] : activeRounds.filter(r => r !== 'Total')

  const tickFormatter = (v) => formatPeriodTick(v, period)

  const commonProps = {
    data,
    margin: { top: 10, right: 10, left: 10, bottom: 0 },
  }

  const xAxis = (
    <XAxis
      dataKey="period"
      tickFormatter={tickFormatter}
      tick={{ fill: '#52525b', fontSize: 11 }}
      axisLine={false}
      tickLine={false}
      dy={8}
    />
  )

  const yAxis = (
    <YAxis
      tickFormatter={formatAmount}
      tick={{ fill: '#52525b', fontSize: 11 }}
      axisLine={false}
      tickLine={false}
      width={56}
    />
  )

  const grid = <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
  const tooltip = <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a44' }} />

  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={340}>
        <BarChart {...commonProps}>
          {grid}
          {xAxis}
          {yAxis}
          {tooltip}
          {seriesKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="a"
              fill={key === 'Total' ? '#6366f1' : ROUND_COLORS[key]}
              radius={i === seriesKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              maxBarSize={48}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={340}>
      <AreaChart {...commonProps}>
        <defs>
          {seriesKeys.map((key) => {
            const color = key === 'Total' ? '#6366f1' : ROUND_COLORS[key]
            return (
              <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            )
          })}
        </defs>
        {grid}
        {xAxis}
        {yAxis}
        {tooltip}
        {seriesKeys.map((key) => {
          const color = key === 'Total' ? '#6366f1' : ROUND_COLORS[key]
          return (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${key})`}
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: '#18181b', strokeWidth: 2 }}
            />
          )
        })}
      </AreaChart>
    </ResponsiveContainer>
  )
}
