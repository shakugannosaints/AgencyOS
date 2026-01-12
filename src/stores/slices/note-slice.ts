import type { StateCreator } from 'zustand'
import type { Note } from '@/lib/types'
import { makeCrud } from './slice-helpers'

export interface NoteSlice {
  notes: Note[]
  createNote?: (payload: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note
  addNote?: (note: Note) => void
  updateNote: (id: string, patch: Partial<Note>) => void
  deleteNote: (id: string) => void
  reorderNotes: (ids: string[]) => void
}

export const createNoteSlice: StateCreator<
  NoteSlice,
  [],
  [],
  NoteSlice
> = (set, get) => ({
  notes: [],
  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
  ...(() => {
  const crud = makeCrud<Note>('notes', set, get, {
      onCreate: (item) => ({ ...item, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
    })
    return {
      createNote: (payload: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => crud.create(payload),
      updateNote: (id: string, patch: Partial<Note>) => crud.update(id, { ...(patch as Partial<Note>), updatedAt: new Date().toISOString() }),
      deleteNote: (id: string) => crud.remove(id),
      reorderNotes: (ids: string[]) => crud.reorder(ids),
    }
  })(),
})
