import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCampaignStore, selectAgencySnapshot } from '@/stores/campaign-store'
import { NoteList } from '../components/note-list'
import { saveAgencySnapshot } from '@/services/db/repository'
import type { Note } from '@/lib/types'
import { useTrans } from '@/lib/i18n-utils'
// using store-managed createNote now

export function NotesPage() {
  const t = useTrans()
  const notes = useCampaignStore((state) => state.notes)
  const createNote = useCampaignStore((state) => state.createNote)
  const updateNote = useCampaignStore((state) => state.updateNote)
  const deleteNote = useCampaignStore((state) => state.deleteNote)
  const reorderNotes = useCampaignStore((state) => state.reorderNotes)
  const [localNotes, setLocalNotes] = useState<Note[]>(notes)

  useEffect(() => {
    setLocalNotes(notes)
  }, [notes])

  const handleCreateNote = () => {
    if (!createNote) return
    const payload = {
      title: t('notes.newNoteTitle'),
      summary: '',
      content: '',
    }
    const created = createNote(payload)
    // immediate local update for responsive UI
    setLocalNotes((prevNotes) => [created, ...prevNotes])
  }

  const handleSaveNotes = async (updatedNotes: Note[]) => {
    // Persist the whole agency snapshot using the existing repo API so persistence remains centralized
    try {
      const snapshot = selectAgencySnapshot(useCampaignStore.getState())
      await saveAgencySnapshot(snapshot)
      setLocalNotes(updatedNotes)
    } catch (error) {
      console.error('保存笔记失败', error)
    }
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

  const handleReorderNotes = (ids: string[]) => {
    reorderNotes(ids)
    // localNotes is synced via useEffect but we can also set it immediately for smoother UI
    const itemMap = new Map(notes.map((it) => [it.id, it]))
    const newNotes = ids.map((id) => itemMap.get(id)).filter((n): n is Note => !!n)
    setLocalNotes(newNotes)
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
          onReorder={handleReorderNotes}
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
