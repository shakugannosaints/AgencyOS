import type { StateCreator } from 'zustand'

export interface SettingsSlice {
  notesAllowHtml: boolean
  setNotesAllowHtml: (value: boolean) => void
  dashboardReadOnlyStyle: boolean
  setDashboardReadOnlyStyle: (value: boolean) => void
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  notesAllowHtml: false, // default to false for security
  setNotesAllowHtml: (value: boolean) => set({ notesAllowHtml: value }),
  dashboardReadOnlyStyle: false,
  setDashboardReadOnlyStyle: (value: boolean) => set({ dashboardReadOnlyStyle: value }),
})

export default createSettingsSlice
