import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type ThemeMode = 'night' | 'day' | 'win98' | 'retro' | 'fluent' | 'siphon'
export type Win98TitleBarColor = 'blue' | 'red'
export interface CrtEffectSettings {
  enabled: boolean
  animated: boolean
  thickness: number
  gap: number
  speed: number
  opacity: number
}

const DEFAULT_CRT_SETTINGS: CrtEffectSettings = {
  enabled: false,
  animated: false,
  thickness: 2,
  gap: 4,
  speed: 8,
  opacity: 0.18,
}

interface ThemeState {
  mode: ThemeMode
  win98TitleBarColor: Win98TitleBarColor
  dayFlatStyle: boolean
  crtEffect: CrtEffectSettings
  setMode: (mode: ThemeMode) => void
  setWin98TitleBarColor: (color: Win98TitleBarColor) => void
  setDayFlatStyle: (flat: boolean) => void
  updateCrtEffect: (patch: Partial<CrtEffectSettings>) => void
  resetCrtEffect: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'win98',
      win98TitleBarColor: 'blue',
      dayFlatStyle: false,
      crtEffect: DEFAULT_CRT_SETTINGS,
      setMode: (mode) => set({ mode }),
      setWin98TitleBarColor: (color) => set({ win98TitleBarColor: color }),
      setDayFlatStyle: (flat) => set({ dayFlatStyle: flat }),
      updateCrtEffect: (patch) =>
        set((state) => ({
          crtEffect: {
            ...state.crtEffect,
            ...patch,
          },
        })),
      resetCrtEffect: () => set({ crtEffect: DEFAULT_CRT_SETTINGS }),
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
