import type { StateCreator } from 'zustand'
import type { AgentSummary } from '@/lib/types'

export interface AgentSlice {
  agents: AgentSummary[]
  createAgent: (payload: Omit<AgentSummary, 'id'>) => void
  updateAgent: (id: string, payload: Omit<AgentSummary, 'id'>) => void
  deleteAgent: (id: string) => void
  settleAgentDeltas: () => void
}

const createId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10)

export const createAgentSlice: StateCreator<
  AgentSlice,
  [],
  [],
  AgentSlice
> = (set) => ({
  agents: [],
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
