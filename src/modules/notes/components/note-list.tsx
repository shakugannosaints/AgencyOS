import { useState } from 'react'
import { ChevronDown, ChevronRight, Trash2, Calendar, Clock, GripVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Note } from '@/lib/types'
import { cn, formatDate } from '@/lib/utils'
import { NoteEditor } from './note-editor'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface NoteListProps {
  notes: Note[]
  onUpdate: (id: string, patch: Partial<Note>) => void
  onDelete: (id: string) => void
  onReorder: (ids: string[]) => void
}

function SortableNoteItem({
  note,
  expandedId,
  toggleExpand,
  onUpdate,
  onDelete,
  t,
}: {
  note: Note
  expandedId: string | null
  toggleExpand: (id: string) => void
  onUpdate: (id: string, patch: Partial<Note>) => void
  onDelete: (id: string) => void
  t: any
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 0,
    position: 'relative' as const,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'border rounded-lg transition-all duration-200 bg-card',
        expandedId === note.id ? 'ring-1 ring-primary shadow-md' : 'hover:bg-accent/50'
      )}
    >
      {/* Header / Summary View */}
      <div className="p-4 cursor-pointer flex items-start gap-3" onClick={() => toggleExpand(note.id)}>
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-1"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <button className="mt-1 text-muted-foreground hover:text-foreground transition-colors">
          {expandedId === note.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-medium truncate text-lg">{note.title || t('notes.untitled')}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(note.createdAt)}
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{note.summary || t('notes.noSummary')}</p>

          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
              <Clock className="w-3 h-3" />
              {t('notes.lastModified')}: {formatDate(note.updatedAt)}
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            if (confirm(t('notes.deleteConfirm'))) {
              onDelete(note.id)
            }
          }}
          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Expanded Content */}
      {expandedId === note.id && (
        <div className="px-4 pb-4 pt-0 border-t border-border/50 mt-2">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">{t('notes.title')}</label>
              <input
                type="text"
                value={note.title}
                onChange={(e) => {
                  const updatedTitle = e.target.value
                  onUpdate(note.id, { title: updatedTitle })
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t('notes.titlePlaceholder')}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">{t('notes.summary')}</label>
              <textarea
                value={note.summary || ''}
                onChange={(e) => {
                  const updatedSummary = e.target.value
                  onUpdate(note.id, { summary: updatedSummary })
                }}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t('notes.summaryPlaceholder')}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">{t('notes.content')}</label>
              <NoteEditor initialContent={note.content} onSave={(content) => onUpdate(note.id, { content })} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function NoteList({ notes, onUpdate, onDelete, onReorder }: NoteListProps) {
  const { t } = useTranslation()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = notes.findIndex((n) => n.id === active.id)
      const newIndex = notes.findIndex((n) => n.id === over.id)
      const newNotes = arrayMove(notes, oldIndex, newIndex)
      onReorder(newNotes.map((n) => n.id))
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (notes.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">{t('notes.empty')}</div>
  }

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={notes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
          {notes.map((note) => (
            <SortableNoteItem
              key={note.id}
              note={note}
              expandedId={expandedId}
              toggleExpand={toggleExpand}
              onUpdate={onUpdate}
              onDelete={onDelete}
              t={t}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}
