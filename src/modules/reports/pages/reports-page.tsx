import { Panel } from '@/components/ui/panel'
import { useCampaignStore } from '@/stores/campaign-store'
import { formatDate, missionTypeKey } from '@/lib/utils'
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
        <ul className="space-y-2 text-sm">
          {pendingReports.map((mission) => (
            <li key={mission.id} className="rounded-2xl border border-agency-border/60 bg-agency-ink/50 p-4">
              <p className="font-semibold text-white">{mission.code} · {mission.name}</p>
              <p className="text-xs text-agency-muted">{t('reports.type')}：{t(`missions.types.${missionTypeKey(mission.type)}`)} · {t('reports.date')}：{formatDate(mission.scheduledDate)}</p>
              <div className="mt-2 flex gap-4 text-sm text-agency-muted items-center">
                <span className="text-sm text-agency-muted">{t('app.common.chaos')}：{mission.chaos}</span>
                <span className="text-sm text-agency-muted">{t('app.common.looseEnds')}：{mission.looseEnds}</span>
                <span className="text-sm text-agency-muted">{t('missions.realityRequestsFailedLabel', { defaultValue: t('missions.realityRequestsFailed') })}：{mission.realityRequestsFailed ?? 0}</span>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-agency-muted">{t('reports.archived')}</p>
        {archivedReports.length === 0 && <p className="text-sm text-agency-muted">{t('reports.noArchived')}</p>}
        <ul className="space-y-2 text-sm">
          {archivedReports.map((mission) => (
            <li key={mission.id} className="rounded-2xl border border-agency-border/60 bg-agency-ink/50 p-4">
              <p className="font-semibold text-white">{mission.code} · {mission.name}</p>
              <p className="text-xs text-agency-muted">{t('reports.lastUpdate')}：{formatDate(mission.scheduledDate)}</p>
              <span className="mt-2 inline-block text-sm text-agency-muted">{t('app.common.status')}：{mission.status}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-agency-muted">{t('reports.logs')}</p>
        {lastLogs.length === 0 && <p className="text-sm text-agency-muted">{t('reports.noLogs')}</p>}
        <ul className="space-y-2 text-sm">
          {lastLogs.map((log) => (
            <li key={log.id} className="rounded-2xl border border-agency-border/60 bg-agency-ink/50 p-4">
              <span className="text-agency-muted">{formatDate(log.timestamp)}</span> · [{log.type}] {log.detail}{' '}
              {typeof log.delta === 'number' ? <span className="text-agency-amber">({log.delta >= 0 ? '+' : ''}{log.delta})</span> : null}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
