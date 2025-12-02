/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { createAgentSlice } from '../agent-slice'
import type { AgentSummary } from '@/lib/types'

describe('agent-slice', () => {
  const mockAgent: Omit<AgentSummary, 'id'> = {
    codename: 'Test Agent',
    arcAnomaly: 'None',
    arcReality: 'None',
    arcRole: 'None',
    qa: {
      focus: { current: 1, max: 5 },
      deceit: { current: 1, max: 5 },
      vitality: { current: 1, max: 5 },
      empathy: { current: 1, max: 5 },
      initiative: { current: 1, max: 5 },
      resilience: { current: 1, max: 5 },
      presence: { current: 1, max: 5 },
      expertise: { current: 1, max: 5 },
      mystique: { current: 1, max: 5 },
    },
    awards: 0,
    reprimands: 0,
    status: 'active',
    awardsDelta: 0,
    reprimandsDelta: 0,
  }

  const createMockStore = () => {
    let state: any = { agents: [] }
    const set = (patch: any) => {
      if (typeof patch === 'function') {
        const newState = patch(state)
        // Merge if partial, but here we assume it returns the full slice part or merged state
        // Zustand set(fn) merges the result into state.
        // makeCrud returns { [itemsKey]: ... } which is a partial.
        // So we should merge it.
        state = { ...state, ...newState }
      }
      else state = { ...state, ...patch }
    }
    const get = () => state
    const slice = createAgentSlice(set, get as any, {} as any)
    return { get, slice }
  }

  it('createAgent adds an agent', () => {
    const { get, slice } = createMockStore()
    slice.createAgent(mockAgent)
    expect(get().agents.length).toBe(1)
    expect(get().agents[0].codename).toBe('Test Agent')
    expect(get().agents[0].id).toBeDefined()
  })

  it('updateAgent updates an agent', () => {
    const { get, slice } = createMockStore()
    slice.createAgent(mockAgent)
    const id = get().agents[0].id
    slice.updateAgent(id, { ...mockAgent, codename: 'Updated Agent' })
    expect(get().agents[0].codename).toBe('Updated Agent')
  })

  it('deleteAgent removes an agent', () => {
    const { get, slice } = createMockStore()
    slice.createAgent(mockAgent)
    const id = get().agents[0].id
    slice.deleteAgent(id)
    expect(get().agents.length).toBe(0)
  })

  it('settleAgentDeltas applies deltas and resets them', () => {
    const { get, slice } = createMockStore()
    
    // Create an agent with deltas
    slice.createAgent({
      ...mockAgent,
      awards: 1,
      reprimands: 1,
      awardsDelta: 2,
      reprimandsDelta: 3,
    })

    expect(get().agents[0].awards).toBe(1)
    expect(get().agents[0].reprimands).toBe(1)
    expect(get().agents[0].awardsDelta).toBe(2)
    expect(get().agents[0].reprimandsDelta).toBe(3)

    slice.settleAgentDeltas()

    expect(get().agents[0].awards).toBe(3) // 1 + 2
    expect(get().agents[0].reprimands).toBe(4) // 1 + 3
    expect(get().agents[0].awardsDelta).toBe(0)
    expect(get().agents[0].reprimandsDelta).toBe(0)
  })
})
