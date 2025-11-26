import type { StateCreator } from 'zustand'
import type { Campaign } from '@/lib/types'

export interface CampaignSlice {
  campaign: Campaign
  updateCampaign: (patch: Partial<Campaign>) => void
}

export const createCampaignSlice: StateCreator<
  CampaignSlice,
  [],
  [],
  CampaignSlice
> = (set) => ({
  campaign: {
    id: '',
    name: '',
    divisionCode: '',
    location: '',
    status: 'active',
    styleTags: [],
    contentFlags: [],
    defaultRules: [],
    updatedAt: new Date().toISOString(),
  },
  updateCampaign: (patch) =>
    set((state) => ({
      campaign: {
        ...state.campaign,
        ...patch,
        updatedAt: new Date().toISOString(),
      },
    })),
})
