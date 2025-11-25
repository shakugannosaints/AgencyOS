import { create } from 'zustand'

export interface TrackItem {
  id: string
  label: string
  checked: boolean
}

export interface CustomTrack {
  id: string
  name: string
  color: string // Tailwind 兼容的色值或原生 hex，如 "#f97316"
  items: TrackItem[]
}

interface TracksState {
  tracks: CustomTrack[]
}

interface TracksActions {
  createTrack: (payload: { name: string; color: string; itemCount: number }) => void
  updateTrackMeta: (id: string, payload: { name?: string; color?: string }) => void
  updateTrackItem: (trackId: string, itemId: string, patch: Partial<TrackItem>) => void
  deleteTrack: (id: string) => void
}

type TracksStore = TracksState & TracksActions

const createId = () =>
  (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10))

export const useTracksStore = create<TracksStore>((set) => ({
  tracks: [],
  createTrack: ({ name, color, itemCount }) =>
    set((state) => ({
      tracks: [
        ...state.tracks,
        {
          id: createId(),
          name: name || '未命名轨道',
          color: color || '#22c55e',
          items: Array.from({ length: Math.max(1, itemCount) }, (_, index) => ({
            id: createId(),
            label: `节点 ${index + 1}`,
            checked: false,
          })),
        },
      ],
    })),
  updateTrackMeta: (id, payload) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === id
          ? {
              ...track,
              ...payload,
            }
          : track,
      ),
    })),
  updateTrackItem: (trackId, itemId, patch) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId
          ? {
              ...track,
              items: track.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      ...patch,
                    }
                  : item,
              ),
            }
          : track,
      ),
    })),
  deleteTrack: (id) =>
    set((state) => ({
      tracks: state.tracks.filter((track) => track.id !== id),
    })),
}))
