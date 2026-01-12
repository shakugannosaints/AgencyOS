import { create } from 'zustand'
import { createId } from '@/lib/utils'

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
  updateTrackItemCount: (id: string, nextCount: number) => void
  updateTrackItem: (trackId: string, itemId: string, patch: Partial<TrackItem>) => void
  deleteTrack: (id: string) => void
  reorderTracks: (ids: string[]) => void
}

type TracksStore = TracksState & TracksActions

// Using shared createId for consistent IDs

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
  updateTrackItemCount: (id, nextCount) =>
    set((state) => ({
      tracks: state.tracks.map((track) => {
        if (track.id !== id) return track

        const count = Math.max(1, Math.min(42, nextCount || 1))

        if (count === track.items.length) return track

        if (count > track.items.length) {
          const toAdd = count - track.items.length
          const newItems = Array.from({ length: toAdd }, (_, index) => ({
            id: createId(),
            label: `节点 ${track.items.length + index + 1}`,
            checked: false,
          }))

          return {
            ...track,
            items: [...track.items, ...newItems],
          }
        }

        // count < current length => trim from the end
        return {
          ...track,
          items: track.items.slice(0, count),
        }
      }),
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
  reorderTracks: (ids) =>
    set((state) => {
      const itemMap = new Map(state.tracks.map((it) => [it.id, it]))
      const newTracks = ids.map((id) => itemMap.get(id)).filter((item): item is CustomTrack => !!item)
      return { tracks: newTracks }
    }),
}))
