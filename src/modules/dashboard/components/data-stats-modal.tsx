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
  Legend,
} from 'recharts'

interface Props {
  onClose: () => void
}

export const DataStatsModal: React.FC<Props> = ({ onClose }) => {
  const { t } = useTranslation()
  const missions = useCampaignStore((s) => s.missions)
  const agents = useCampaignStore((s) => s.agents)
  const anomalies = useCampaignStore((s) => s.anomalies)

  // Line chart: missions ordered as in store
  const lineData = useMemo(() => {
    return missions.map((m, idx) => ({
      name: m.code || m.name || `#${idx + 1}`,
      looseEnds: m.looseEnds ?? 0,
    }))
  }, [missions])

  // Pie chart: active agents and their awards (filter zero values)
  const activeAgentSlices = useMemo(() => {
    const actives = agents.filter((a) => a.status === 'active')
    return actives
      .map((a) => ({ name: a.codename || a.id, value: a.awards ?? 0 }))
      .filter((s) => (s.value ?? 0) > 0)
  }, [agents])

  // Pie chart: active agents and their reprimands (申诫)
  const activeAgentReprimandSlices = useMemo(() => {
    const actives = agents.filter((a) => a.status === 'active')
    return actives
      .map((a) => ({ name: a.codename || a.id, value: a.reprimands ?? 0 }))
      .filter((s) => (s.value ?? 0) > 0)
  }, [agents])

  // Pie chart: anomalies status counts
  const anomalySlices = useMemo(() => {
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
    ].filter((s) => (s.value ?? 0) > 0)
  }, [anomalies, t])

  // Generate a visually distinct HSL-based palette for N items
  const generatePalette = (n: number, offset = 0) => {
    if (n <= 0) return [] as string[]
    return Array.from({ length: n }).map((_, i) => {
      const hue = Math.round((i * (360 / n) + offset) % 360)
      // saturation 62%, lightness 52% gives good contrast on dark background
      return `hsl(${hue},62%,52%)`
    })
  }

  // Custom tooltip for richer, themed hover cards
  const CustomTooltip = ({ active, payload, label, chartType, total }: any) => {
    if (!active || !payload || payload.length === 0) return null
    const item = payload[0]
    const value = item.value ?? 0
    const percent = total && total > 0 ? Math.round((value / total) * 1000) / 10 : null
    return (
      <div className="rounded-md border border-agency-border/60 bg-agency-ink/95 p-3 text-sm text-white shadow-lg">
        <div className="flex items-baseline justify-between gap-4">
          <div className="font-medium text-xs text-agency-muted">{label}</div>
          <div className="text-xs font-mono text-agency-cyan">{value}</div>
        </div>
        {percent !== null && (
          <div className="mt-1 text-xs text-agency-muted">{percent}%</div>
        )}
        {chartType === 'line' && item.payload && item.payload.looseEnds !== undefined && (
          <div className="mt-2 text-xs text-agency-muted">{t('dashboard.dataStats.charts.looseEnds')}: {item.payload.looseEnds}</div>
        )}
      </div>
    )
  }

  // totals for pies
  const totalAwards = activeAgentSlices.reduce((s, e) => s + (e.value ?? 0), 0)
  const totalReprimands = activeAgentReprimandSlices.reduce((s, e) => s + (e.value ?? 0), 0)
  const totalAnomalies = anomalySlices.reduce((s, e) => s + (e.value ?? 0), 0)

  const makePieLabel = (total: number) => (entry: any) => {
    const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0
    return `${percent}%`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* 保留点击关闭区域，但移除暗色遮罩以去掉背后的阴影效果 */}
    <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-5xl rounded-2xl border border-agency-border/60 shadow-panel bg-agency-panel/100 p-6">
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
          <section className="col-span-3 rounded-lg border border-agency-border/40 bg-agency-ink/30 p-4">
            <p className="text-xs text-agency-muted">{t('dashboard.dataStats.charts.looseEnds')}</p>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip content={(props) => <CustomTooltip {...props} chartType="line" />} />
                  <Line type="monotone" dataKey="looseEnds" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-lg border border-agency-border/40 bg-agency-ink/30 p-4">
            <p className="text-xs text-agency-muted">{t('dashboard.dataStats.charts.agentAwards')}</p>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip content={(props) => <CustomTooltip {...props} chartType="pie" total={totalAwards} />} />
                  {activeAgentSlices.length > 0 ? (
                    (() => {
                      const colors = generatePalette(activeAgentSlices.length, 200)
                      return (
                        <Pie data={activeAgentSlices} dataKey="value" nameKey="name" outerRadius={80} label={makePieLabel(totalAwards)} labelLine={false}>
                          {activeAgentSlices.map((entry, i) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <Cell key={`${entry.name}-${i}`} fill={colors[i % colors.length]} />
                          ))}
                        </Pie>
                      )
                    })()
                  ) : (
                    <text x="50%" y="50%" textAnchor="middle" fill="#9ca3af">{t('dashboard.dataStats.noData')}</text>
                  )}
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-lg border border-agency-border/40 bg-agency-ink/30 p-4">
            <p className="text-xs text-agency-muted">{t('dashboard.dataStats.charts.agentReprimands')}</p>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip content={(props) => <CustomTooltip {...props} chartType="pie" total={totalReprimands} />} />
                  {activeAgentReprimandSlices.length > 0 ? (
                    (() => {
                      const colors = generatePalette(activeAgentReprimandSlices.length, 280)
                      return (
                        <Pie data={activeAgentReprimandSlices} dataKey="value" nameKey="name" outerRadius={80} label={makePieLabel(totalReprimands)} labelLine={false}>
                          {activeAgentReprimandSlices.map((entry, i) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <Cell key={`${entry.name}-rep-${i}`} fill={colors[i % colors.length]} />
                          ))}
                        </Pie>
                      )
                    })()
                  ) : (
                    <text x="50%" y="50%" textAnchor="middle" fill="#9ca3af">{t('dashboard.dataStats.noData')}</text>
                  )}
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-lg border border-agency-border/40 bg-agency-ink/30 p-4">
            <p className="text-xs text-agency-muted">{t('dashboard.dataStats.charts.anomaliesStatus')}</p>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip content={(props) => <CustomTooltip {...props} chartType="pie" total={totalAnomalies} />} />
                  {anomalySlices.length > 0 ? (
                    (() => {
                      const colors = generatePalette(anomalySlices.length, 10)
                      return (
                        <Pie data={anomalySlices} dataKey="value" nameKey="name" outerRadius={80} label={makePieLabel(totalAnomalies)} labelLine={false}>
                          {anomalySlices.map((entry, i) => (
                            <Cell key={`${entry.key}-${i}`} fill={colors[i % colors.length]} />
                          ))}
                        </Pie>
                      )
                    })()
                  ) : (
                    <text x="50%" y="50%" textAnchor="middle" fill="#9ca3af">{t('dashboard.dataStats.noData')}</text>
                  )}
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default DataStatsModal
