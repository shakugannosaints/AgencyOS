import { describe, it, expect } from 'vitest'
import { useCampaignStore, selectAgencySnapshot } from '@/stores/campaign-store'

describe('campaign-store snapshot includes settings', () => {
  it('includes notesAllowHtml in snapshot', () => {
    // ensure store is in known state
    useCampaignStore.setState({ notes: [], notesAllowHtml: false, agents: [], missions: [], anomalies: [], logs: [], campaign: { id: 'c', name: 'x', divisionCode: 'x', location: 'x', status: 'active', styleTags: [], contentFlags: [], defaultRules: [], updatedAt: new Date().toISOString() } })
    const snap = selectAgencySnapshot(useCampaignStore.getState())
    expect(snap.settings?.notesAllowHtml).toBe(false)
  })
})
