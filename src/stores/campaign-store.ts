import { create } from 'zustand'
import type { AgencySnapshot, CustomTrackSnapshot } from '@/lib/types'
import { useTracksStore } from '@/stores/tracks-store'
import { mockAgents, mockAnomalies, mockCampaign, mockMissions } from '@/lib/mock-data'
import {
  createAgentSlice,
  createMissionSlice,
  createAnomalySlice,
  createCampaignSlice,
  createNoteSlice,
  createSettingsSlice,
  createEmergencySlice,
  type AgentSlice,
  type MissionSlice,
  type AnomalySlice,
  type CampaignSlice,
  type NoteSlice,
  type SettingsSlice,
  type EmergencySlice,
} from '@/stores/slices'

// Combined store type
type AgencyStore = AgentSlice & MissionSlice & AnomalySlice & CampaignSlice & NoteSlice & SettingsSlice & EmergencySlice & {
  hydrate: (snapshot: AgencySnapshot) => void
}

export const useCampaignStore = create<AgencyStore>()((...args) => ({
  // Compose all slices
  ...createAgentSlice(...args),
  ...createMissionSlice(...args),
  ...createAnomalySlice(...args),
  ...createCampaignSlice(...args),
  ...createNoteSlice(...args),
  ...createSettingsSlice(...args),
  ...createEmergencySlice(...args),

  // Hydrate action for restoring from snapshot
  hydrate: (snapshot) => {
    const [set] = args
    // Restore main campaign data
    const currentEmergency = useCampaignStore.getState().emergency
    set({
      campaign: snapshot.campaign,
      agents: snapshot.agents,
      missions: snapshot.missions,
      anomalies: snapshot.anomalies,
      notes: snapshot.notes || [],
  notesAllowHtml: snapshot.settings?.notesAllowHtml ?? true,
  dashboardReadOnlyStyle: snapshot.settings?.dashboardReadOnlyStyle ?? false,
      logs: snapshot.logs,
      ...(snapshot.emergency ? {
        emergency: {
          ...currentEmergency,
          ...snapshot.emergency
        }
      } : {}),
    })

    // Restore tracks separately if present
    if (snapshot.tracks) {
      const tracksForStore: CustomTrackSnapshot[] = snapshot.tracks
      useTracksStore.setState({
        tracks: tracksForStore.map((track) => ({
          id: track.id,
          name: track.name,
          color: track.color,
          items: track.items.map((item) => ({
            id: item.id,
            label: item.label,
            checked: item.checked,
          })),
        })),
      })
    }
  },
}))

// Initialize with mock data
useCampaignStore.setState({
  campaign: mockCampaign,
  agents: mockAgents,
  missions: mockMissions,
  anomalies: mockAnomalies,
  notes: [],
  logs: [],
  dashboardReadOnlyStyle: false,
})

// Selector for creating a snapshot
export const selectAgencySnapshot = (state: AgencyStore): AgencySnapshot => ({
  campaign: state.campaign,
  agents: state.agents,
  missions: state.missions,
  anomalies: state.anomalies,
  notes: state.notes,
  logs: state.logs,
  tracks: useTracksStore.getState().tracks,
  settings: {
    notesAllowHtml: state.notesAllowHtml,
    dashboardReadOnlyStyle: state.dashboardReadOnlyStyle,
  },
  emergency: {
    isEnabled: state.emergency.isEnabled,
    permissions: state.emergency.permissions,
    chatHistory: state.emergency.chatHistory,
    actionHistory: state.emergency.actionHistory,
    llmConfig: state.emergency.llmConfig,
  },
})

export const getAgencySnapshot = () => selectAgencySnapshot(useCampaignStore.getState())
