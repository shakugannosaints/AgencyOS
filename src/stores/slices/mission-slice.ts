import type { StateCreator } from 'zustand'
import type { MissionLogEntry, MissionSummary } from '@/lib/types'

export interface MissionSlice {
  missions: MissionSummary[]
  logs: MissionLogEntry[]
  createMission: (payload: Omit<MissionSummary, 'id'>) => void
  updateMission: (id: string, payload: Omit<MissionSummary, 'id'>) => void
  deleteMission: (id: string) => void
  adjustMissionChaos: (missionId: string, delta: number, note: string) => void
  adjustMissionLooseEnds: (missionId: string, delta: number, note: string) => void
  appendMissionLog: (missionId: string, detail: string) => void
}

const createId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10)

export const createMissionSlice: StateCreator<
  MissionSlice,
  [],
  [],
  MissionSlice
> = (set) => ({
  missions: [],
  logs: [],
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
          type: 'chaos' as const,
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
          type: 'loose-end' as const,
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
          type: 'log' as const,
          detail,
          timestamp: new Date().toISOString(),
        },
      ],
    })),
})
