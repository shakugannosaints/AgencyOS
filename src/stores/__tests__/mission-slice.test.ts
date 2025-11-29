import { describe, it, expect } from 'vitest'
import { useCampaignStore } from '@/stores/campaign-store'

describe('mission slice adjust realityRequestsFailed', () => {
  it('adjusts realityRequestsFailed and creates a log', () => {
    // initialize store
    useCampaignStore.setState({
      missions: [{ id: 'msn-test', code: 'MSN-TEST', name: 'Test', type: '其他', status: 'active', chaos: 0, looseEnds: 0, scheduledDate: new Date().toISOString(), realityRequestsFailed: 2 }],
      logs: [],
    })

    const adjust = useCampaignStore.getState().adjustMissionRealityRequestsFailed
    adjust('msn-test', 1, 'test adjust')

    const state = useCampaignStore.getState()
    const mission = state.missions.find((m) => m.id === 'msn-test')
    expect(mission?.realityRequestsFailed).toBe(3)
    expect(state.logs.some((l) => l.type === 'reality-failure' && l.detail === 'test adjust')).toBe(true)
  })
})
