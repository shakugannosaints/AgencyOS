import { useState } from 'react'
import { Panel } from '@/components/ui/panel'
import { useTracksStore } from '@/stores/tracks-store'
import { useTranslation } from 'react-i18next'
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

function SortableTrackItem({
  track,
  index,
  updateTrackMeta,
  updateTrackItemCount,
  updateTrackItem,
  deleteTrack,
  t,
}: {
  track: any
  index: number
  updateTrackMeta: any
  updateTrackItemCount: any
  updateTrackItem: any
  deleteTrack: any
  t: any
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 0,
    position: 'relative' as const,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Panel
      ref={setNodeRef}
      style={style}
      className="space-y-4 border border-agency-border/60 bg-agency-ink/70 win98:bg-transparent shadow-[0_0_0_1px_rgba(15,23,42,0.5)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing text-agency-muted hover:text-agency-cyan"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>
          <span className="flex h-7 w-7 items-center justify-center bg-agency-ink/80 win98:bg-transparent text-xs text-agency-muted rounded-xl win98:rounded-none">
            #{index + 1}
          </span>
          <input
            className="min-w-[160px] border border-agency-border bg-agency-ink/60 win98:bg-transparent px-3 py-2 text-sm font-medium text-agency-cyan shadow-inner rounded-xl win98:rounded-none"
            value={track.name}
            onChange={(event) =>
              updateTrackMeta(track.id, {
                name: event.target.value,
              })
            }
          />
          <div className="flex items-center gap-2 bg-agency-ink/60 win98:bg-transparent px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-agency-muted rounded-full win98:rounded-none">
            <span
              className="h-3 w-3 shadow-[0_0_0_1px_rgba(15,23,42,0.8)] rounded-full win98:rounded-none"
              style={{ backgroundColor: track.color }}
            />
            <input
              type="color"
              className="h-4 w-4 cursor-pointer bg-transparent border-none appearance-none p-0"
              value={track.color}
              onChange={(event) =>
                updateTrackMeta(track.id, {
                  color: event.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-agency-muted">
            {t('tracks.form.count')}
            <input
              type="number"
              min={1}
              max={42}
              className="w-12 border border-agency-border bg-agency-ink/60 win98:bg-transparent px-2 py-1 text-xs text-agency-cyan rounded-lg win98:rounded-none"
              value={track.items.length}
              onChange={(event) => updateTrackItemCount(track.id, Number(event.target.value) || 1)}
            />
          </label>
          <button
            type="button"
            className="border border-agency-border/60 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-agency-muted hover:border-agency-magenta hover:text-agency-magenta rounded-xl win98:rounded-none"
            onClick={() => {
              if (window.confirm(t('tracks.deleteConfirm', { name: track.name }))) {
                deleteTrack(track.id)
              }
            }}
          >
            {t('app.common.delete')}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {track.items.map((item: any, i: number) => (
          <div key={item.id} className="group relative flex flex-col items-center gap-1.5">
            <button
              type="button"
              className={cn(
                'h-6 w-6 border-2 transition-all duration-200 rounded-lg win98:rounded-none',
                item.checked
                  ? 'border-transparent shadow-[0_0_8px] scale-110'
                  : 'border-agency-border bg-agency-ink/40'
              )}
              style={{
                backgroundColor: item.checked ? track.color : undefined,
                boxShadow: item.checked ? `0 0 12px ${track.color}80` : undefined,
                borderColor: item.checked ? track.color : undefined,
              }}
              onClick={() =>
                updateTrackItem(track.id, item.id, {
                  checked: !item.checked,
                })
              }
            >
              {item.checked && (
                <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white">
                  ✓
                </div>
              )}
            </button>
            <input
              className="w-12 border-none bg-transparent p-0 text-center text-[8px] uppercase tracking-[0.1em] text-agency-muted focus:text-agency-cyan focus:outline-none"
              value={item.label}
              placeholder={`#${i + 1}`}
              onChange={(event) =>
                updateTrackItem(track.id, item.id, {
                  label: event.target.value,
                })
              }
            />
          </div>
        ))}
      </div>
    </Panel>
  )
}

export function TracksPage() {
  const { t } = useTranslation()
  const tracks = useTracksStore((state) => state.tracks)
  const createTrack = useTracksStore((state) => state.createTrack)
  const updateTrackMeta = useTracksStore((state) => state.updateTrackMeta)
  const updateTrackItemCount = useTracksStore((state) => state.updateTrackItemCount)
  const updateTrackItem = useTracksStore((state) => state.updateTrackItem)
  const deleteTrack = useTracksStore((state) => state.deleteTrack)
  const reorderTracks = useTracksStore((state) => state.reorderTracks)

  const [name, setName] = useState('')
  const [color, setColor] = useState('#22c55e')
  const [itemCount, setItemCount] = useState(5)

  const handleCreate = () => {
    createTrack({ name, color, itemCount })
    setName('')
    setItemCount(5)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = tracks.findIndex((t) => t.id === active.id)
      const newIndex = tracks.findIndex((t) => t.id === over.id)
      const newOrderedIds = arrayMove(tracks, oldIndex, newIndex).map((t) => t.id)
      reorderTracks(newOrderedIds)
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-agency-muted">{t('tracks.subtitle')}</p>
        <h1 className="text-2xl font-semibold text-white">{t('tracks.title')}</h1>
      </header>

      <Panel className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-agency-muted">{t('tracks.create')}</p>
        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('tracks.form.name')}
            <input
              className="mt-1 w-full border border-agency-border bg-agency-ink/60 win98:bg-transparent px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('tracks.form.namePlaceholder')}
            />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('tracks.form.color')}
            <input
              type="color"
              className="mt-1 h-[42px] w-full cursor-pointer border border-agency-border bg-agency-ink/60 win98:bg-transparent rounded-xl win98:rounded-none"
              value={color}
              onChange={(event) => setColor(event.target.value)}
            />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('tracks.form.count')}
            <input
              type="number"
              min={1}
              max={42}
              className="mt-1 w-full border border-agency-border bg-agency-ink/60 win98:bg-transparent px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none"
              value={itemCount}
              onChange={(event) => setItemCount(Number(event.target.value) || 1)}
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              className="w-full border border-agency-cyan/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-cyan rounded-2xl win98:rounded-none"
              onClick={handleCreate}
            >
              {t('tracks.form.submit')}
            </button>
          </div>
        </div>
      </Panel>

      {tracks.length ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tracks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {tracks.map((track, index) => (
                <SortableTrackItem
                  key={track.id}
                  track={track}
                  index={index}
                  updateTrackMeta={updateTrackMeta}
                  updateTrackItemCount={updateTrackItemCount}
                  updateTrackItem={updateTrackItem}
                  deleteTrack={deleteTrack}
                  t={t}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <Panel>
          <p className="text-sm text-agency-muted">{t('tracks.empty')}</p>
        </Panel>
      )}
    </div>
  )
}
