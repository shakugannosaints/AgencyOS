import type { StateCreator } from 'zustand'
import { createId } from '@/lib/utils'
import { makeCrud } from './slice-helpers'
import type { MissionLogEntry, MissionSummary } from '@/lib/types'

export interface MissionSlice {
  missions: MissionSummary[]
  logs: MissionLogEntry[]
  createMission: (payload: Omit<MissionSummary, 'id'>) => void
  updateMission: (id: string, payload: Omit<MissionSummary, 'id'>) => void
  deleteMission: (id: string) => void
  adjustMissionChaos: (missionId: string, delta: number, note: string) => void
  adjustMissionLooseEnds: (missionId: string, delta: number, note: string) => void
  adjustMissionRealityRequestsFailed: (missionId: string, delta: number, note: string) => void
  appendMissionLog: (missionId: string, detail: string) => void
}

export const createMissionSlice: StateCreator<
  MissionSlice,
  [],
  [],
  MissionSlice
> = (set, get) => ({
  missions: [],
  logs: [],
  ...(() => {
  const crud = makeCrud<MissionSummary>('missions', set, get, {
      onDelete: (id) => {
        set((state) => ({ logs: state.logs.filter((log) => log.missionId !== id) }))
      },
    })
    return {
  createMission: (payload: Omit<MissionSummary, 'id'>) => crud.create(payload),
  updateMission: (id: string, payload: Omit<MissionSummary, 'id'>) => crud.update(id, payload),
      deleteMission: (id: string) => crud.remove(id),
    }
  })(),
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
          ? { ...mission, looseEnds: mission.looseEnds + delta }
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
  adjustMissionRealityRequestsFailed: (missionId, delta, note) =>
    set((state) => ({
      missions: state.missions.map((mission) =>
        mission.id === missionId
          ? { ...mission, realityRequestsFailed: Math.max(0, (mission.realityRequestsFailed ?? 0) + delta) }
          : mission,
      ),
      logs: [
        ...state.logs,
        {
          id: createId(),
          missionId,
          type: 'reality-failure' as const,
          delta,
          detail: note,
          timestamp: new Date().toISOString(),
        },
      ],
    })),
})
