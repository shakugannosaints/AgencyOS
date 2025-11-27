import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCampaignStore } from '@/stores/campaign-store'
import { NoteList } from '../components/note-list'
import { loadNotes, saveNotes } from '@/services/db/repository'
import type { Note } from '@/lib/types'
import { useTrans } from '@/lib/i18n-utils'

export function NotesPage() {
  const t = useTrans()
  const notes = useCampaignStore((state) => state.notes)
  const addNote = useCampaignStore((state) => state.addNote)
  const updateNote = useCampaignStore((state) => state.updateNote)
  const deleteNote = useCampaignStore((state) => state.deleteNote)
  const [localNotes, setLocalNotes] = useState<Note[]>([])

  useEffect(() => {
    const fetchNotes = async () => {
      const loadedNotes = await loadNotes()
      setLocalNotes(loadedNotes)
    }
    fetchNotes()
  }, [])

  const handleCreateNote = () => {
    const newNote = {
      id: crypto.randomUUID(),
      title: t('notes.newNoteTitle'),
      summary: '',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addNote(newNote)
    setLocalNotes((prevNotes) => [newNote, ...prevNotes])
  }

  const handleSaveNotes = async (updatedNotes: Note[]) => {
    await saveNotes(updatedNotes)
    setLocalNotes(updatedNotes)
  }

  // Wrap store update to keep localNotes in sync so collapsed/expanded views reflect latest edits
  const handleUpdateNote = (id: string, patch: Partial<Note>) => {
    updateNote(id, patch)
    setLocalNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n))
    )
  }

  const handleDeleteNote = (id: string) => {
    deleteNote(id)
    setLocalNotes((prevNotes) => prevNotes.filter((note) => note.id !== id))
  }

  return (
    <div className="h-full flex flex-col space-y-6 p-8 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('app.nav.notes')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('notes.description')}
          </p>
        </div>
        <button
            onClick={handleCreateNote}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('notes.create')}
          </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-10">
        <NoteList
          notes={localNotes}
          onUpdate={handleUpdateNote}
          onDelete={handleDeleteNote}
        />
      </div>

      {/* Example save button */}
      <button
        onClick={() => handleSaveNotes(notes)}
        className="border border-input rounded-md px-4 py-2 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Save Notes
      </button>
    </div>
  )
}
