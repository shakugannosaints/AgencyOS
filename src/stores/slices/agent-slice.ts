import type { StateCreator } from 'zustand'
import type { AgentSummary } from '@/lib/types'
import { makeCrud } from './slice-helpers'

export interface AgentSlice {
  agents: AgentSummary[]
  createAgent: (payload: Omit<AgentSummary, 'id'>) => void
  updateAgent: (id: string, payload: Omit<AgentSummary, 'id'>) => void
  deleteAgent: (id: string) => void
  reorderAgents: (ids: string[]) => void
  settleAgentDeltas: () => void
}

export const createAgentSlice: StateCreator<
  AgentSlice,
  [],
  [],
  AgentSlice
> = (set, get) => ({
  agents: [],
  ...(() => {
    const crud = makeCrud<AgentSummary>('agents', set, get)
    return {
      createAgent: (payload: Omit<AgentSummary, 'id'>) => crud.create(payload),
      updateAgent: (id: string, payload: Omit<AgentSummary, 'id'>) => crud.update(id, payload),
      deleteAgent: (id: string) => crud.remove(id),
      reorderAgents: (ids: string[]) => crud.reorder(ids),
    }
  })(),
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
})
