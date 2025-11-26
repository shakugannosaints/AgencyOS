import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type ThemeMode = 'night' | 'day' | 'win98' | 'retro' | 'fluent'

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
  (set) => ({
      mode: 'night',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'agency-theme-mode',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined,
          }
        }
        return window.localStorage
      }),
    },
  ),
)
