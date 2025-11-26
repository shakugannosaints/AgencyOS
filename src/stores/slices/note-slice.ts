import type { StateCreator } from 'zustand'
import type { Note } from '@/lib/types'

export interface NoteSlice {
  notes: Note[]
  addNote: (note: Note) => void
  updateNote: (id: string, patch: Partial<Note>) => void
  deleteNote: (id: string) => void
}

export const createNoteSlice: StateCreator<
  NoteSlice,
  [],
  [],
  NoteSlice
> = (set) => ({
  notes: [],
  addNote: (note) =>
    set((state) => ({
      notes: [note, ...state.notes],
    })),
  updateNote: (id, patch) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id
          ? { ...note, ...patch, updatedAt: new Date().toISOString() }
          : note
      ),
    })),
  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    })),
})
