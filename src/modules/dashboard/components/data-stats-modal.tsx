import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useCampaignStore } from '@/stores/campaign-store'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { generatePalette } from './palette-utils'

// Type definitions for chart data
interface LineChartData {
  name: string
  looseEnds: number
  realityRequestsFailed: number
}

interface PieChartSlice {
  name: string
  value: number
  key?: string
}

// Custom tooltip props - simplified to avoid Recharts type constraints
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ 
    value?: number | string 
    payload?: LineChartData | PieChartSlice 
  }>
  label?: string
  chartType?: 'line' | 'pie'
  total?: number
  t: (key: string) => string
}

interface Props {
  onClose: () => void
}

// Custom tooltip component with React.memo for performance optimization
const CustomTooltip: React.FC<CustomTooltipProps> = React.memo(({
  active,
  payload,
  label,
  chartType,
  total,
  t
}) => {
  if (!active || !payload || payload.length === 0) return null
  
  const item = payload[0]
  const rawValue = item.value ?? 0
  const value = typeof rawValue === 'string' ? Number(rawValue) : rawValue
  const percent = total && total > 0 ? Math.round((Number(value) / total) * 1000) / 10 : null
  const itemPayload = item.payload as LineChartData | undefined
  
  return (
    <div className="rounded-md border border-agency-border/60 bg-agency-ink/95 p-3 text-sm text-white shadow-lg">
      <div className="flex items-baseline justify-between gap-4">
        <div className="font-medium text-xs text-agency-muted">{label}</div>
        <div className="text-xs font-mono text-agency-cyan">{value}</div>
      </div>
      {percent !== null && (
        <div className="mt-1 text-xs text-agency-muted">{percent}%</div>
      )}
      {chartType === 'line' && itemPayload && (
        <>
          <div className="mt-2 text-xs text-agency-muted">{t('dashboard.dataStats.charts.looseEnds')}: {itemPayload.looseEnds}</div>
          <div className="mt-1 text-xs text-agency-muted">{t('dashboard.realityRequestsFailed')}: {itemPayload.realityRequestsFailed}</div>
        </>
      )}
    </div>
  )
})

CustomTooltip.displayName = 'CustomTooltip'

// Reusable PieChart component
interface CustomPieChartProps {
  data: PieChartSlice[]
  title: string
  total: number
  t: (key: string) => string
  colorOffset?: number
}

const CustomPieChart: React.FC<CustomPieChartProps> = ({ data, title, total, t, colorOffset = 0 }) => {
  const colors = useMemo(() => generatePalette(data.length, colorOffset), [data.length, colorOffset])
  
  const makePieLabel = (total: number) => (entry: { value?: number }) => {
    const percent = total > 0 ? Math.round(((entry.value ?? 0) / total) * 100) : 0
    return `${percent}%`
  }
  
  return (
    <section className="rounded-lg border border-agency-border/40 bg-agency-ink/30 p-4">
      <p className="text-xs text-agency-muted">{title}</p>
      <div style={{ width: '100%', height: 230 }}>
        <ResponsiveContainer>
          <PieChart>
            <Tooltip content={({ active, payload, label }) => (
              <CustomTooltip 
                active={active} 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                payload={payload as any} 
                label={label} 
                chartType="pie" 
                total={total} 
                t={t}
              />
            )} />
            {data.length > 0 ? (
              <Pie 
                data={data} 
                dataKey="value" 
                nameKey="name" 
                outerRadius={80} 
                label={makePieLabel(total)} 
                labelLine={false}
              >
                {data.map((entry, i) => (
                  <Cell 
                    key={`${entry.key || entry.name}-${i}`} 
                    fill={colors[i % colors.length]} 
                  />
                ))}
              </Pie>
            ) : (
              <text x="50%" y="50%" textAnchor="middle" fill="#9ca3af">{t('dashboard.dataStats.noData')}</text>
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
      {data.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-agency-muted">
          {data.map((entry, i) => (
            <div key={`${entry.name}-legend`} className="inline-flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-sm"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span>{entry.name}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export const DataStatsModal: React.FC<Props> = ({ onClose }) => {
  const { t } = useTranslation()
  const missions = useCampaignStore((s) => s.missions)
  const agents = useCampaignStore((s) => s.agents)
  const anomalies = useCampaignStore((s) => s.anomalies)

  // Line chart data: missions ordered as in store
  const lineData = useMemo<LineChartData[]>(() => {
    return missions.map((m, idx) => ({
      name: m.code || m.name || `#${idx + 1}`,
      looseEnds: m.looseEnds ?? 0,
      realityRequestsFailed: m.realityRequestsFailed ?? 0,
    }))
  }, [missions])

  // Pie chart data: active agents and their awards (filter zero values)
  const activeAgentSlices = useMemo<PieChartSlice[]>(() => {
    const actives = agents.filter((a) => a.status === 'active')
    return actives
      .map((a) => ({ name: a.codename || a.id, value: a.awards ?? 0 }))
      .filter((s) => s.value > 0)
  }, [agents])

  // Pie chart data: active agents and their reprimands
  const activeAgentReprimandSlices = useMemo<PieChartSlice[]>(() => {
    const actives = agents.filter((a) => a.status === 'active')
    return actives
      .map((a) => ({ name: a.codename || a.id, value: a.reprimands ?? 0 }))
      .filter((s) => s.value > 0)
  }, [agents])

  // Pie chart data: anomalies status counts
  const anomalySlices = useMemo<PieChartSlice[]>(() => {
    const counts: Record<string, number> = {
      active: 0,
      contained: 0,
      neutralized: 0,
      escaped: 0,
    }
    anomalies.forEach((an) => {
      counts[an.status] = (counts[an.status] ?? 0) + 1
    })
    return [
      { key: 'active', name: t('anomalies.statusOptions.active'), value: counts.active },
      { key: 'contained', name: t('anomalies.statusOptions.contained'), value: counts.contained },
      { key: 'neutralized', name: t('anomalies.statusOptions.neutralized'), value: counts.neutralized },
      { key: 'escaped', name: t('anomalies.statusOptions.escaped'), value: counts.escaped },
    ].filter((s) => s.value > 0)
  }, [anomalies, t])

  // Totals for pie charts
  const totalAwards = useMemo(() => activeAgentSlices.reduce((sum, slice) => sum + slice.value, 0), [activeAgentSlices])
  const totalReprimands = useMemo(() => activeAgentReprimandSlices.reduce((sum, slice) => sum + slice.value, 0), [activeAgentReprimandSlices])
  const totalAnomalies = useMemo(() => anomalySlices.reduce((sum, slice) => sum + slice.value, 0), [anomalySlices])

  // Colors cached with useMemo for performance
  const lineChartColors = useMemo(() => generatePalette(2, 0), [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 保留点击关闭区域，但移除暗色遮罩以去掉背后的阴影效果 */}
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-5xl rounded-2xl border border-agency-border/60 shadow-panel bg-agency-panel/100 p-6 win98-raised">
        <header className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{t('dashboard.dataStats.title')}</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-sm text-agency-muted hover:text-white"
              onClick={onClose}
            >
              {t('app.common.cancel')}
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Line Chart Section */}
          <section className="col-span-3 rounded-lg border border-agency-border/40 bg-agency-ink/30 p-4">
            <p className="text-xs text-agency-muted">{t('dashboard.dataStats.charts.looseEnds')}</p>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip content={({ active, payload, label }) => (
                    <CustomTooltip 
                      active={active} 
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      payload={payload as any} 
                      label={label} 
                      chartType="line" 
                      t={t}
                    />
                  )} />
                  <Line 
                    type="monotone" 
                    dataKey="looseEnds" 
                    stroke={lineChartColors[0] || '#ef4444'} 
                    strokeWidth={2} 
                    dot={{ r: 3 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Pie Chart Sections using the reusable CustomPieChart component */}
          <CustomPieChart 
            data={activeAgentSlices} 
            title={t('dashboard.dataStats.charts.agentAwards')} 
            total={totalAwards} 
            t={t} 
            colorOffset={200} 
          />
          
          <CustomPieChart 
            data={activeAgentReprimandSlices} 
            title={t('dashboard.dataStats.charts.agentReprimands')} 
            total={totalReprimands} 
            t={t} 
            colorOffset={20} 
          />
          
          <CustomPieChart 
            data={anomalySlices} 
            title={t('dashboard.dataStats.charts.anomaliesStatus')} 
            total={totalAnomalies} 
            t={t} 
            colorOffset={10} 
          />
        </div>
      </div>
    </div>
  )
}

export default DataStatsModal
