import { Panel } from '@/components/ui/panel'
import { StatCard } from '@/components/ui/stat-card'
import { formatDate } from '@/lib/utils'
import { useCampaignStore } from '@/stores/campaign-store'
import { useMvpWatchlist } from '@/stores/hooks/use-mvp-watchlist'
import { ActivitySquare, AlertTriangle, Trophy, ShieldAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import DataStatsModal from '../components/data-stats-modal'

export function DashboardPage() {
  const { t } = useTranslation()
  const campaign = useCampaignStore((state) => state.campaign)
  const updateCampaign = useCampaignStore((state) => state.updateCampaign)
  const missions = useCampaignStore((state) => state.missions)
  const anomalies = useCampaignStore((state) => state.anomalies)
  const navigate = useNavigate()

  const activeMission = missions.find((mission) => mission.status === 'active') ?? null
  const pendingMission = missions.find((mission) => mission.status === 'planning' || mission.status === 'debrief') ?? missions[1] ?? missions[0]

  // Use extracted hook to calculate MVP and watchlist
  const { mvpLabel, watchlistLabel } = useMvpWatchlist()

  // Editable General Manager state
  const [isEditingGM, setIsEditingGM] = useState(false)
  const [gmValue, setGmValue] = useState<string>(campaign.generalManager ?? '')
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    setGmValue(campaign.generalManager ?? '')
  }, [campaign.generalManager])

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label={t('dashboard.chaosPool')} value={activeMission?.chaos ?? 0} hint={t('dashboard.chaosHint')} icon={<ActivitySquare />} intent="warning" />
        <StatCard label={t('dashboard.looseEnds')} value={activeMission?.looseEnds ?? 0} hint={t('dashboard.weatherHint')} icon={<AlertTriangle />} intent="critical" />
        <StatCard
          label={t('dashboard.mvp')}
          value={mvpLabel}
          hint={t('dashboard.mvpHint')}
          icon={<Trophy className="text-red-500" />}
          className="text-red-500 [&>div>div:last-child>p:nth-child(2)]:text-red-500"
        />
        <StatCard
          label={t('dashboard.watchlist')}
          value={watchlistLabel}
          hint={t('dashboard.watchlistHint')}
          icon={<ShieldAlert className="text-blue-500" />}
          className="text-blue-500 [&>div>div:last-child>p:nth-child(2)]:text-blue-500"
        />
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          className="border border-agency-border px-3 py-1 text-xs uppercase tracking-[0.3em] text-agency-cyan transition hover:border-agency-cyan/60 rounded-2xl win98:rounded-none"
          onClick={() => setShowStats(true)}
        >
          {t('dashboard.dataStats.open')}
        </button>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <header className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-agency-muted">{t('dashboard.currentMission')}</p>
              <h2 className="text-2xl font-semibold text-white">{activeMission?.name ?? t('dashboard.noMission')}</h2>
            </div>
            <span className="border border-agency-cyan/40 px-3 py-1 text-xs uppercase text-agency-cyan rounded-full win98:rounded-none">
              {activeMission?.status ?? t('dashboard.standby')}
            </span>
          </header>
          <dl className="grid gap-3 text-sm text-agency-muted">
            <div className="flex justify-between border-b border-agency-border/30 pb-2">
              <dt>{t('dashboard.missionCode')}</dt>
              <dd className="font-mono text-agency-cyan">{activeMission?.code ?? 'N/A'}</dd>
            </div>
            <div className="flex justify-between border-b border-agency-border/30 pb-2">
              <dt>{t('dashboard.missionType')}</dt>
              <dd>{activeMission?.type ?? '-'}</dd>
            </div>
            <div className="flex justify-between border-b border-agency-border/30 pb-2">
              <dt>{t('dashboard.currentGeneralManager')}</dt>
              <dd className="flex items-center gap-3">
                {!isEditingGM ? (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => setIsEditingGM(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setIsEditingGM(true)
                    }}
                    className={`cursor-pointer focus:outline-none focus:ring-2 focus:ring-agency-cyan/40 rounded ${campaign.generalManager ? 'text-agency-cyan font-medium' : 'text-agency-muted italic'}`}
                    aria-label={t('dashboard.currentGeneralManager') as string}
                  >
                    {campaign.generalManager ? campaign.generalManager : t('dashboard.currentGeneralManagerHint')}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      className="rounded bg-agency-ink/30 px-2 py-1 text-sm text-white border border-agency-border/30"
                      value={gmValue}
                      onChange={(e) => setGmValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateCampaign({ generalManager: gmValue })
                          setIsEditingGM(false)
                        } else if (e.key === 'Escape') {
                          setGmValue(campaign.generalManager ?? '')
                          setIsEditingGM(false)
                        }
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="text-xs text-agency-cyan/80 hover:text-agency-cyan"
                      onClick={() => {
                        updateCampaign({ generalManager: gmValue })
                        setIsEditingGM(false)
                      }}
                    >
                      {t('app.common.save')}
                    </button>
                    <button
                      type="button"
                      className="text-xs text-agency-muted hover:text-white"
                      onClick={() => {
                        setGmValue(campaign.generalManager ?? '')
                        setIsEditingGM(false)
                      }}
                    >
                      {t('app.common.cancel')}
                    </button>
                  </div>
                )}
              </dd>
            </div>
            <div className="flex justify-between border-b border-agency-border/30 pb-2">
              <dt>{t('dashboard.scheduledDate')}</dt>
              <dd>{activeMission ? formatDate(activeMission.scheduledDate) : '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{t('dashboard.optionalHint')}</dt>
              <dd>{activeMission?.optionalObjectiveHint ?? ''}</dd>
            </div>
          </dl>
        </Panel>

        <Panel>
          <header className="mb-4">
            <p className="text-xs uppercase tracking-[0.4em] text-agency-muted">{t('dashboard.nextMission')}</p>
            <h2 className="text-xl font-semibold text-white">{pendingMission?.name ?? t('dashboard.tbd')}</h2>
          </header>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between border-b border-agency-border/30 pb-2">
              <span className="text-agency-muted">{t('dashboard.code')}</span>
              <span className="font-mono text-agency-cyan">{pendingMission?.code ?? ''}</span>
            </li>
            <li className="flex items-center justify-between border-b border-agency-border/30 pb-2">
              <span className="text-agency-muted">{t('dashboard.expectedAgents')}</span>
              <span>{pendingMission?.expectedAgents ?? ''}</span>
            </li>
            <li className="flex items-center justify-between border-b border-agency-border/30 pb-2">
              <span className="text-agency-muted">{t('dashboard.goals')}</span>
              <span>{pendingMission?.goalsSummary ?? ''}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-agency-muted">{t('dashboard.briefingUpdate')}</span>
              <span>{formatDate(campaign.updatedAt)}</span>
            </li>
          </ul>
        </Panel>
      </section>

      <Panel>
        <header className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-agency-muted">{t('dashboard.anomalyMonitor')}</p>
            <h2 className="text-xl font-semibold text-white">{t('dashboard.registered', { count: anomalies.length })}</h2>
          </div>
          <button
            type="button"
            className="border border-agency-border px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-cyan transition hover:border-agency-cyan/60 rounded-2xl win98:rounded-none"
            onClick={() => navigate('/anomalies')}
          >
            {t('dashboard.viewContainment')}
          </button>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {anomalies.map((item) => (
            <div key={item.id} className="rounded-2xl border border-agency-border/60 bg-agency-ink/50 p-4">
              <p className="text-sm text-agency-muted">{item.focus}</p>
              <h3 className="text-lg font-semibold text-white">{item.codename}</h3>
              <p className="text-xs text-agency-muted">{t('dashboard.domain')}：{item.domain}</p>
              <p className="text-xs uppercase tracking-[0.4em] text-agency-cyan">{item.status}</p>
            </div>
          ))}
        </div>
      </Panel>
      {showStats && <DataStatsModal onClose={() => setShowStats(false)} />}
    </div>
  )
}
