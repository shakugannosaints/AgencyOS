import { Panel } from '@/components/ui/panel'
import { StatCard } from '@/components/ui/stat-card'
import { formatDate } from '@/lib/utils'
import { useCampaignStore } from '@/stores/campaign-store'
import { ActivitySquare, AlertTriangle, Trophy, ShieldAlert } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export function DashboardPage() {
  const campaign = useCampaignStore((state) => state.campaign)
  const missions = useCampaignStore((state) => state.missions)
  const anomalies = useCampaignStore((state) => state.anomalies)
  const agents = useCampaignStore((state) => state.agents)
  const navigate = useNavigate()

  const activeMission = missions.find((mission) => mission.status === 'active') ?? null
  const pendingMission = missions.find((mission) => mission.status === 'planning' || mission.status === 'debrief') ?? missions[1] ?? missions[0]

  const { mvpLabel, watchlistLabel } = useMemo(() => {
    const inService = agents.filter((agent) => agent.status === 'active')
    if (!inService.length) {
      return { mvpLabel: '—', watchlistLabel: '—' }
    }

    // 本次任务内的增量用于评选 MVP / 观察期；若未设置则视为 0
    const getAwards = (a: (typeof inService)[number]) => a.awardsDelta ?? 0
    const getReprimands = (a: (typeof inService)[number]) => a.reprimandsDelta ?? 0

    const allAwardsZero = inService.every((a) => getAwards(a) === 0)
    const allReprimandsZero = inService.every((a) => getReprimands(a) === 0)

    // 观察期：先处理“全 0”与一般规则（基于本次任务的申诫增量）
    let watchCandidates = inService
    if (allReprimandsZero) {
      // 所有人申诫为 0 → 全员观察期
      watchCandidates = inService
    } else {
      // 申诫最多；若平局 → 嘉奖最少；再平局 → 全员平局者观察期
      const maxReprimands = Math.max(...inService.map((a) => getReprimands(a)))
      const reprimandLeaders = inService.filter((a) => getReprimands(a) === maxReprimands)
      if (reprimandLeaders.length === 1) {
        watchCandidates = reprimandLeaders
      } else {
        const minAwardsAmongLeaders = Math.min(...reprimandLeaders.map((a) => getAwards(a)))
        watchCandidates = reprimandLeaders.filter((a) => getAwards(a) === minAwardsAmongLeaders)
      }
    }

    // MVP：从“未进入观察期”的特工中评选；若所有嘉奖为 0 或候选为空，则无人 MVP
    const remainingForMvp = inService.filter(
      (agent) => !watchCandidates.some((w) => w.id === agent.id),
    )

    let mvpCandidates: typeof inService = []
    if (!allAwardsZero && remainingForMvp.length) {
      const maxAwards = Math.max(...remainingForMvp.map((a) => getAwards(a)))
      const awardLeaders = remainingForMvp.filter((a) => getAwards(a) === maxAwards)
      if (awardLeaders.length === 1) {
        mvpCandidates = awardLeaders
      } else {
        const minReprimandsAmongLeaders = Math.min(...awardLeaders.map((a) => getReprimands(a)))
        mvpCandidates = awardLeaders.filter((a) => getReprimands(a) === minReprimandsAmongLeaders)
      }
    }

    const mvpLabel = mvpCandidates.length
      ? mvpCandidates.map((a) => a.codename).join(' · ')
      : '—'

    const watchlistLabel = watchCandidates.length
      ? watchCandidates.map((a) => a.codename).join(' · ')
      : '—'

    return { mvpLabel, watchlistLabel }
  }, [agents])

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="混沌池" value={`${activeMission?.chaos ?? 0}`} hint="领域中3以内免费，并且三倍效果" icon={<ActivitySquare />} intent="warning" />
        <StatCard label="散逸端" value={activeMission?.looseEnds ?? 0} hint="注意天气" icon={<AlertTriangle />} intent="critical" />
        <StatCard
          label="MVP"
          value={mvpLabel}
          hint="嘉奖最多；并列时申诫最少者优先"
          icon={<Trophy className="text-red-500" />}
          className="text-red-500 [&>div>div:last-child>p:nth-child(2)]:text-red-500"
        />
        <StatCard
          label="观察期"
          value={watchlistLabel}
          hint="申诫最多；并列时嘉奖最少者优先"
          icon={<ShieldAlert className="text-blue-500" />}
          className="text-blue-500 [&>div>div:last-child>p:nth-child(2)]:text-blue-500"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <header className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-agency-muted">当前任务</p>
              <h2 className="text-2xl font-semibold text-white">{activeMission?.name ?? '暂无任务'}</h2>
            </div>
            <span className="rounded-full border border-agency-cyan/40 px-3 py-1 text-xs uppercase text-agency-cyan">
              {activeMission?.status ?? '待机'}
            </span>
          </header>
          <dl className="grid gap-3 text-sm text-agency-muted">
            <div className="flex justify-between border-b border-agency-border/30 pb-2">
              <dt>任务代号</dt>
              <dd className="font-mono text-agency-cyan">{activeMission?.code ?? 'N/A'}</dd>
            </div>
            <div className="flex justify-between border-b border-agency-border/30 pb-2">
              <dt>类型</dt>
              <dd>{activeMission?.type ?? '-'}</dd>
            </div>
            <div className="flex justify-between border-b border-agency-border/30 pb-2">
              <dt>计划日期</dt>
              <dd>{activeMission ? formatDate(activeMission.scheduledDate) : '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt>可选目标提示</dt>
              <dd>{activeMission?.optionalObjectiveHint ?? '—'}</dd>
            </div>
          </dl>
        </Panel>

        <Panel>
          <header className="mb-4">
            <p className="text-xs uppercase tracking-[0.4em] text-agency-muted">下一任务</p>
            <h2 className="text-xl font-semibold text-white">{pendingMission?.name ?? '待定'}</h2>
          </header>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between border-b border-agency-border/30 pb-2">
              <span className="text-agency-muted">代号</span>
              <span className="font-mono text-agency-cyan">{pendingMission?.code ?? '—'}</span>
            </li>
            <li className="flex items-center justify-between border-b border-agency-border/30 pb-2">
              <span className="text-agency-muted">预计参与特工</span>
              <span>{pendingMission?.expectedAgents ?? '—'}</span>
            </li>
            <li className="flex items-center justify-between border-b border-agency-border/30 pb-2">
              <span className="text-agency-muted">目标</span>
              <span>{pendingMission?.goalsSummary ?? '—'}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-agency-muted">简报更新时间</span>
              <span>{formatDate(campaign.updatedAt)}</span>
            </li>
          </ul>
        </Panel>
      </section>

      <Panel>
        <header className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-agency-muted">异常体监控</p>
            <h2 className="text-xl font-semibold text-white">已登记 {anomalies.length} 项</h2>
          </div>
          <button
            type="button"
            className="rounded-xl border border-agency-border px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-cyan transition hover:border-agency-cyan/60"
            onClick={() => navigate('/anomalies')}
          >
            查看收容库
          </button>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {anomalies.map((item) => (
            <div key={item.id} className="rounded-2xl border border-agency-border/60 bg-agency-ink/50 p-4">
              <p className="text-sm text-agency-muted">{item.focus}</p>
              <h3 className="text-lg font-semibold text-white">{item.codename}</h3>
              <p className="text-xs text-agency-muted">领域：{item.domain}</p>
              <p className="text-xs uppercase tracking-[0.4em] text-agency-cyan">{item.status}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
