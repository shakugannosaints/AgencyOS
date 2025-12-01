import type { StateCreator } from 'zustand'
import { createId } from '@/lib/utils'
import type { EmergencyAction, EmergencyMessage, EmergencyPermissions } from '@/lib/types'

export interface EmergencySlice {
  emergency: {
    isEnabled: boolean
    isChatOpen: boolean
    pollingInterval: number | null
    permissions: EmergencyPermissions
    alwaysAllowDataModification: boolean
    chatHistory: EmergencyMessage[]
    actionHistory: EmergencyAction[]
    llmConfig: {
      apiUrl: string
      model: string
      apiKey?: string
    }
  }

  setEmergencyEnabled: (isEnabled: boolean) => void
  toggleEmergencyChat: () => void
  setEmergencyPermissions: (permissions: Partial<EmergencyPermissions>) => void
  addEmergencyMessage: (message: Omit<EmergencyMessage, 'id' | 'timestamp'>) => void
  addEmergencyAction: (action: Omit<EmergencyAction, 'id' | 'timestamp'>) => void
  updateEmergencyAction: (id: string, updates: Partial<EmergencyAction>) => void
  undoLastEmergencyAction: () => EmergencyAction | undefined
  clearEmergencyHistory: () => void
  setEmergencyLlmConfig: (config: Partial<EmergencySlice['emergency']['llmConfig']>) => void
  setEmergencyPollingInterval: (interval: number | null) => void
}

export const createEmergencySlice: StateCreator<EmergencySlice> = (set, get) => ({
  emergency: {
    isEnabled: false,
    isChatOpen: false,
    pollingInterval: null,
    permissions: {
      canReadDom: false,
      canWriteDom: false,
      canWriteCampaignData: false,
      canWriteSettingsData: false,
      allowedAreas: [],
    },
    alwaysAllowDataModification: false,
    chatHistory: [],
    actionHistory: [],
    llmConfig: {
      apiUrl: '',
      model: '',
    }
  },

  setEmergencyEnabled: (isEnabled) =>
    set((state) => ({
      emergency: { ...state.emergency, isEnabled },
    })),

  toggleEmergencyChat: () =>
    set((state) => ({
      emergency: { ...state.emergency, isChatOpen: !state.emergency.isChatOpen },
    })),

  setEmergencyPermissions: (permissions) =>
    set((state) => ({
      emergency: {
        ...state.emergency,
        permissions: { ...state.emergency.permissions, ...permissions },
      },
    })),

  addEmergencyMessage: (message) =>
    set((state) => ({
      emergency: {
        ...state.emergency,
        chatHistory: [
          ...state.emergency.chatHistory,
          { ...message, id: createId(), timestamp: Date.now() },
        ],
      },
    })),

  addEmergencyAction: (action) =>
    set((state) => ({
      emergency: {
        ...state.emergency,
        actionHistory: [
          ...state.emergency.actionHistory,
          { ...action, id: createId(), timestamp: Date.now() },
        ],
      },
    })),

  updateEmergencyAction: (id, updates) =>
    set((state) => ({
      emergency: {
        ...state.emergency,
        actionHistory: state.emergency.actionHistory.map((action) =>
          action.id === id ? { ...action, ...updates } : action
        ),
      },
    })),

  undoLastEmergencyAction: () => {
    const state = get()
    const lastAction = state.emergency.actionHistory[state.emergency.actionHistory.length - 1]
    if (!lastAction) return undefined

    set((state) => ({
      emergency: {
        ...state.emergency,
        actionHistory: state.emergency.actionHistory.slice(0, -1),
      },
    }))
    return lastAction
  },

  clearEmergencyHistory: () =>
    set((state) => ({
      emergency: { ...state.emergency, chatHistory: [], actionHistory: [] },
    })),

  setEmergencyLlmConfig: (config) =>
    set((state) => ({
      emergency: {
        ...state.emergency,
        llmConfig: { ...state.emergency.llmConfig, ...config },
      },
    })),

  setEmergencyPollingInterval: (interval) =>
    set((state) => ({
      emergency: { ...state.emergency, pollingInterval: interval },
    })),
})
