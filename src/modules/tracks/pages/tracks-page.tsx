import { useState } from 'react'
import { Panel } from '@/components/ui/panel'
import { useTracksStore } from '@/stores/tracks-store'

export function TracksPage() {
  const tracks = useTracksStore((state) => state.tracks)
  const createTrack = useTracksStore((state) => state.createTrack)
  const updateTrackMeta = useTracksStore((state) => state.updateTrackMeta)
  const updateTrackItem = useTracksStore((state) => state.updateTrackItem)
  const deleteTrack = useTracksStore((state) => state.deleteTrack)

  const [name, setName] = useState('')
  const [color, setColor] = useState('#22c55e')
  const [itemCount, setItemCount] = useState(5)

  const handleCreate = () => {
    createTrack({ name, color, itemCount })
    setName('')
    setItemCount(5)
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-agency-muted">自定义轨道</p>
        <h1 className="text-2xl font-semibold text-white">自定义轨道管理</h1>
      </header>

      <Panel className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-agency-muted">新建轨道</p>
        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            名称
            <input
              className="mt-1 w-full rounded-xl border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="例如：观察日程 / 特殊流程"
            />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            颜色
            <input
              type="color"
              className="mt-1 h-[42px] w-full cursor-pointer rounded-xl border border-agency-border bg-agency-ink/60"
              value={color}
              onChange={(event) => setColor(event.target.value)}
            />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            复选框数量
            <input
              type="number"
              min={1}
              max={32}
              className="mt-1 w-full rounded-xl border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan"
              value={itemCount}
              onChange={(event) => setItemCount(Number(event.target.value) || 1)}
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              className="w-full rounded-2xl border border-agency-cyan/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-cyan"
              onClick={handleCreate}
            >
              创建轨道
            </button>
          </div>
        </div>
      </Panel>

      {tracks.length ? (
        <div className="space-y-4">
          {tracks.map((track) => (
            <Panel key={track.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    className="rounded-xl border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan"
                    value={track.name}
                    onChange={(event) =>
                      updateTrackMeta(track.id, {
                        name: event.target.value,
                      })
                    }
                  />
                  <input
                    type="color"
                    className="h-8 w-16 cursor-pointer rounded border border-agency-border bg-agency-ink/60"
                    value={track.color}
                    onChange={(event) =>
                      updateTrackMeta(track.id, {
                        color: event.target.value,
                      })
                    }
                  />
                </div>
                <button
                  type="button"
                  className="rounded-2xl border border-agency-border px-3 py-1 text-xs uppercase tracking-[0.3em] text-agency-muted hover:border-agency-magenta hover:text-agency-magenta"
                  onClick={() => deleteTrack(track.id)}
                >
                  删除轨道
                </button>
              </div>

              <div className="flex flex-wrap gap-4">
                {track.items.map((item) => (
                  <label
                    key={item.id}
                    className="flex flex-col items-center gap-1 text-center text-xs text-agency-muted"
                    style={{ color: track.color }}
                  >
                    <input
                      type="checkbox"
                      className="h-5 w-5 cursor-pointer rounded border border-agency-border bg-agency-ink/80"
                      checked={item.checked}
                      onChange={(event) =>
                        updateTrackItem(track.id, item.id, {
                          checked: event.target.checked,
                        })
                      }
                    />
                    <input
                      className="w-24 rounded border border-agency-border bg-agency-ink/60 px-1 py-0.5 text-[0.65rem] text-agency-cyan"
                      value={item.label}
                      onChange={(event) =>
                        updateTrackItem(track.id, item.id, {
                          label: event.target.value,
                        })
                      }
                    />
                  </label>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      ) : (
        <Panel>
          <p className="text-sm text-agency-muted">尚未创建任何轨道。先在上方创建一条自定义轨道吧。</p>
        </Panel>
      )}
    </div>
  )
}
