import { create } from 'zustand'
import type { AgentSummary, AgencySnapshot, AnomalySummary, Campaign, CustomTrackSnapshot, MissionLogEntry, MissionSummary } from '@/lib/types'
import { useTracksStore } from '@/stores/tracks-store'
import { mockAgents, mockAnomalies, mockCampaign, mockMissions } from '@/lib/mock-data'

interface AgencyStoreState {
  campaign: Campaign
  agents: AgentSummary[]
  missions: MissionSummary[]
  anomalies: AnomalySummary[]
  logs: MissionLogEntry[]
}

interface AgencyStoreActions {
  updateCampaign: (patch: Partial<Campaign>) => void
  createAgent: (payload: Omit<AgentSummary, 'id'>) => void
  updateAgent: (id: string, payload: Omit<AgentSummary, 'id'>) => void
  deleteAgent: (id: string) => void
  createMission: (payload: Omit<MissionSummary, 'id'>) => void
  updateMission: (id: string, payload: Omit<MissionSummary, 'id'>) => void
  deleteMission: (id: string) => void
  createAnomaly: (payload: Omit<AnomalySummary, 'id'>) => void
  updateAnomaly: (id: string, payload: Omit<AnomalySummary, 'id'>) => void
  deleteAnomaly: (id: string) => void
  adjustMissionChaos: (missionId: string, delta: number, note: string) => void
  adjustMissionLooseEnds: (missionId: string, delta: number, note: string) => void
  settleAgentDeltas: () => void
  appendMissionLog: (missionId: string, detail: string) => void
  hydrate: (snapshot: AgencySnapshot) => void
}

type AgencyStore = AgencyStoreState & AgencyStoreActions

const createId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10)

export const useCampaignStore = create<AgencyStore>((set) => ({
  campaign: mockCampaign,
  agents: mockAgents,
  missions: mockMissions,
  anomalies: mockAnomalies,
  logs: [],
  updateCampaign: (patch) =>
    set((state) => ({
      campaign: {
        ...state.campaign,
        ...patch,
        updatedAt: new Date().toISOString(),
      },
    })),
  createAgent: (payload) =>
    set((state) => ({
      agents: [...state.agents, { ...payload, id: createId() }],
    })),
  updateAgent: (id, payload) =>
    set((state) => ({
      agents: state.agents.map((agent) => (agent.id === id ? { ...payload, id } : agent)),
    })),
  deleteAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((agent) => agent.id !== id),
    })),
  createMission: (payload) =>
    set((state) => ({
      missions: [...state.missions, { ...payload, id: createId() }],
    })),
  updateMission: (id, payload) =>
    set((state) => ({
      missions: state.missions.map((mission) => (mission.id === id ? { ...payload, id } : mission)),
    })),
  deleteMission: (id) =>
    set((state) => ({
      missions: state.missions.filter((mission) => mission.id !== id),
      logs: state.logs.filter((log) => log.missionId !== id),
    })),
  createAnomaly: (payload) =>
    set((state) => ({
      anomalies: [...state.anomalies, { ...payload, id: createId() }],
    })),
  updateAnomaly: (id, payload) =>
    set((state) => ({
      anomalies: state.anomalies.map((anomaly) => (anomaly.id === id ? { ...payload, id } : anomaly)),
    })),
  deleteAnomaly: (id) =>
    set((state) => ({
      anomalies: state.anomalies.filter((anomaly) => anomaly.id !== id),
    })),
  adjustMissionChaos: (missionId, delta, note) =>
    set((state) => ({
      missions: state.missions.map((mission) =>
        mission.id === missionId
          ? { ...mission, chaos: Math.max(0, mission.chaos + delta) }
          : mission,
      ),
      logs: [
        ...state.logs,
        {
          id: createId(),
          missionId,
          type: 'chaos',
          delta,
          detail: note,
          timestamp: new Date().toISOString(),
        },
      ],
    })),
  adjustMissionLooseEnds: (missionId, delta, note) =>
    set((state) => ({
      missions: state.missions.map((mission) =>
        mission.id === missionId
          ? { ...mission, looseEnds: Math.max(0, mission.looseEnds + delta) }
          : mission,
      ),
      logs: [
        ...state.logs,
        {
          id: createId(),
          missionId,
          type: 'loose-end',
          delta,
          detail: note,
          timestamp: new Date().toISOString(),
        },
      ],
    })),
  appendMissionLog: (missionId, detail) =>
    set((state) => ({
      logs: [
        ...state.logs,
        {
          id: createId(),
          missionId,
          type: 'log',
          detail,
          timestamp: new Date().toISOString(),
        },
      ],
    })),
    settleAgentDeltas: () =>
      set((state) => ({
        agents: state.agents.map((agent) => ({
          ...agent,
          awards: agent.awards + (agent.awardsDelta ?? 0),
          reprimands: agent.reprimands + (agent.reprimandsDelta ?? 0),
          awardsDelta: 0,
          reprimandsDelta: 0,
        })),
      })),
  hydrate: (snapshot) =>
    set(() => {
      // 先恢复主战役数据
      const nextState = {
        campaign: snapshot.campaign,
        agents: snapshot.agents,
        missions: snapshot.missions,
        anomalies: snapshot.anomalies,
        logs: snapshot.logs,
      }

      // 再单独恢复轨道（如果 snapshot 中存在）
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

      return nextState
    }),
}))

export const selectAgencySnapshot = (state: AgencyStoreState): AgencySnapshot => ({
  campaign: state.campaign,
  agents: state.agents,
  missions: state.missions,
  anomalies: state.anomalies,
  logs: state.logs,
  tracks: useTracksStore.getState().tracks,
})

export const getAgencySnapshot = () => selectAgencySnapshot(useCampaignStore.getState())
