import { Panel } from '@/components/ui/panel'
import { useCampaignStore } from '@/stores/campaign-store'
import { formatDate } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export function ReportsPage() {
  const { t } = useTranslation()
  const missions = useCampaignStore((state) => state.missions)
  const logs = useCampaignStore((state) => state.logs)

  const pendingReports = missions.filter((mission) => mission.status === 'debrief')
  const archivedReports = missions.filter((mission) => mission.status === 'archived')
  const lastLogs = logs.slice(-5).reverse()

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-agency-muted">{t('reports.subtitle')}</p>
          <h1 className="text-2xl font-semibold text-white">{t('reports.title')}</h1>
        </div>
      </header>

      <Panel className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-agency-muted">{t('reports.pending')}</p>
        {pendingReports.length === 0 && <p className="text-sm text-agency-muted">{t('reports.noPending')}</p>}
        {pendingReports.map((mission) => (
          <div key={mission.id} className="flex flex-col gap-2 rounded-2xl border border-agency-border/40 bg-agency-ink/40 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-white">{mission.code} · {mission.name}</p>
              <p className="text-xs text-agency-muted">{t('reports.type')}：{mission.type} · {t('reports.date')}：{formatDate(mission.scheduledDate)}</p>
            </div>
              <div className="flex gap-3 text-xs uppercase tracking-[0.3em] text-agency-muted">
              <span className="rounded-xl border border-agency-border px-3 py-1">{t('app.common.chaos')}：{mission.chaos}</span>
              <span className="rounded-xl border border-agency-border px-3 py-1">{t('app.common.looseEnds')}：{mission.looseEnds}</span>
              <span className="rounded-xl border border-agency-border px-3 py-1">{t('missions.realityRequestsFailedLabel', { defaultValue: t('missions.realityRequestsFailed') })}：{mission.realityRequestsFailed ?? 0}</span>
            </div>
          </div>
        ))}
      </Panel>

      <Panel className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-agency-muted">{t('reports.archived')}</p>
        {archivedReports.length === 0 && <p className="text-sm text-agency-muted">{t('reports.noArchived')}</p>}
        {archivedReports.map((mission) => (
          <div key={mission.id} className="flex flex-col gap-2 rounded-2xl border border-agency-border/40 bg-agency-ink/40 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-white">{mission.code} · {mission.name}</p>
              <p className="text-xs text-agency-muted">{t('reports.lastUpdate')}：{formatDate(mission.scheduledDate)}</p>
            </div>
            <span className="rounded-xl border border-agency-border px-3 py-1 text-xs uppercase tracking-[0.3em] text-agency-muted">{t('app.common.status')}：{mission.status}</span>
          </div>
        ))}
      </Panel>

      <Panel className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-agency-muted">{t('reports.logs')}</p>
        {lastLogs.length === 0 && <p className="text-sm text-agency-muted">{t('reports.noLogs')}</p>}
        <ul className="space-y-2 text-sm">
          {lastLogs.map((log) => (
            <li key={log.id} className="rounded-2xl border border-agency-border/40 bg-agency-ink/40 px-4 py-2 font-mono">
              <span className="text-agency-muted">{formatDate(log.timestamp)}</span> · [{log.type}] {log.detail}{' '}
              {typeof log.delta === 'number' ? <span className="text-agency-amber">({log.delta >= 0 ? '+' : ''}{log.delta})</span> : null}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
