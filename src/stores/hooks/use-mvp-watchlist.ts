import { useMemo } from 'react'
import type { AgentSummary } from '@/lib/types'
import { useCampaignStore } from '@/stores/campaign-store'

interface MvpWatchlistResult {
  /** MVP 特工列表 */
  mvpAgents: AgentSummary[]
  /** 观察期特工列表 */
  watchlistAgents: AgentSummary[]
  /** MVP 特工代号标签（多人用 · 连接） */
  mvpLabel: string
  /** 观察期特工代号标签（多人用 · 连接） */
  watchlistLabel: string
}

/**
 * 根据当前任务内的嘉奖/申诫增量，计算 MVP 和观察期特工
 * 
 * 规则：
 * - 观察期：申诫增量最多者；若平局则嘉奖最少者；再平局则全员
 * - MVP：从非观察期特工中选出嘉奖增量最多者；若平局则申诫最少者
 * - 若所有人增量为 0，则返回空结果
 */
export function useMvpWatchlist(): MvpWatchlistResult {
  const agents = useCampaignStore((state) => state.agents)

  return useMemo(() => {
    const inService = agents.filter((agent) => agent.status === 'active')
    
    if (!inService.length) {
      return {
        mvpAgents: [],
        watchlistAgents: [],
        mvpLabel: '—',
        watchlistLabel: '—',
      }
    }

    // 本次任务内的增量用于评选 MVP / 观察期；若未设置则视为 0
    const getAwards = (a: AgentSummary) => a.awardsDelta ?? 0
    const getReprimands = (a: AgentSummary) => a.reprimandsDelta ?? 0

    const allAwardsZero = inService.every((a) => getAwards(a) === 0)
    const allReprimandsZero = inService.every((a) => getReprimands(a) === 0)

    // 观察期：先处理"全 0"与一般规则（基于本次任务的申诫增量）
    let watchCandidates: AgentSummary[] = []
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

    // MVP：从"未进入观察期"的特工中评选；若所有嘉奖为 0 或候选为空，则无人 MVP
    const remainingForMvp = inService.filter(
      (agent) => !watchCandidates.some((w) => w.id === agent.id),
    )

    let mvpCandidates: AgentSummary[] = []
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

    return {
      mvpAgents: mvpCandidates,
      watchlistAgents: watchCandidates,
      mvpLabel,
      watchlistLabel,
    }
  }, [agents])
}
