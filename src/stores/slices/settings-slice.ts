import type { StateCreator } from 'zustand'

export interface SettingsSlice {
  notesAllowHtml: boolean
  setNotesAllowHtml: (value: boolean) => void
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  notesAllowHtml: true, // preserve current behavior by default
  setNotesAllowHtml: (value: boolean) => set({ notesAllowHtml: value }),
})

export default createSettingsSlice
