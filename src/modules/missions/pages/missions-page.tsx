import { Panel } from '@/components/ui/panel'
import { useToast } from '@/components/ui/toast'
import { formatDate } from '@/lib/utils'
import { useCampaignStore } from '@/stores/campaign-store'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCommonTranslations, useTrans } from '@/lib/i18n-utils'

const missionSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  type: z.enum(['收容', '清扫', '市场破坏', '其他']),
  status: z.enum(['planning', 'active', 'debrief', 'archived']),
  chaos: z.number().min(0),
  looseEnds: z.number().min(0),
  scheduledDate: z.string(),
  optionalObjectiveHint: z.string().optional().or(z.literal('')),
  expectedAgents: z.string().optional().or(z.literal('')),
  goalsSummary: z.string().optional().or(z.literal('')),
})

type MissionFormValues = z.infer<typeof missionSchema>

export function MissionsPage() {
  const t = useTrans()
  const { delete: deleteText } = useCommonTranslations()
  const { showToast } = useToast()
  const missions = useCampaignStore((state) => state.missions)
  const adjustMissionChaos = useCampaignStore((state) => state.adjustMissionChaos)
  const adjustMissionLooseEnds = useCampaignStore((state) => state.adjustMissionLooseEnds)
  const appendMissionLog = useCampaignStore((state) => state.appendMissionLog)
  const createMission = useCampaignStore((state) => state.createMission)
  const updateMission = useCampaignStore((state) => state.updateMission)
  const deleteMission = useCampaignStore((state) => state.deleteMission)
  const [selectedMissionId, setSelectedMissionId] = useState<string | undefined>(missions[0]?.id)
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null)
  const [note, setNote] = useState(t('missions.defaultNote'))
  const mission = useMemo(() => missions.find((item) => item.id === selectedMissionId) ?? missions[0], [missions, selectedMissionId])

  const createDefaultMissionValues = (): MissionFormValues => ({
    code: 'MSN-019',
    name: '',
    type: '收容',
    status: 'planning',
    chaos: 0,
    looseEnds: 0,
    scheduledDate: new Date().toISOString().substring(0, 10),
    optionalObjectiveHint: '',
    expectedAgents: '',
    goalsSummary: '',
  })

  const form = useForm<MissionFormValues>({
    resolver: zodResolver(missionSchema),
    defaultValues: createDefaultMissionValues(),
  })

  useEffect(() => {
    if (!selectedMissionId) {
      setSelectedMissionId(missions[0]?.id)
      return
    }
    const exists = missions.some((mission) => mission.id === selectedMissionId)
    if (!exists) {
      setSelectedMissionId(missions[0]?.id)
    }
  }, [missions, selectedMissionId])

  const onSubmit = (values: MissionFormValues) => {
    const payload = { ...values, scheduledDate: new Date(values.scheduledDate).toISOString() }
    if (editingMissionId) {
      updateMission(editingMissionId, payload)
      setEditingMissionId(null)
      showToast('success', t('missions.toast.updated', { name: values.name }))
    } else {
      createMission(payload)
      showToast('success', t('missions.toast.created', { name: values.name }))
    }
    const defaults = createDefaultMissionValues()
    form.reset({ ...defaults, code: 'MSN-' + String(Math.floor(Math.random() * 900 + 100)) })
  }

  const startEditMission = (missionId: string) => {
    const target = missions.find((item) => item.id === missionId)
    if (!target) return
    setEditingMissionId(missionId)
    form.reset({
      code: target.code,
      name: target.name,
      type: target.type,
      status: target.status,
      chaos: target.chaos,
      looseEnds: target.looseEnds,
      scheduledDate: target.scheduledDate.substring(0, 10),
      optionalObjectiveHint: target.optionalObjectiveHint ?? '',
      expectedAgents: target.expectedAgents ?? '',
      goalsSummary: target.goalsSummary ?? '',
    })
  }

  const cancelMissionEdit = () => {
    setEditingMissionId(null)
    form.reset(createDefaultMissionValues())
  }

  const handleDeleteMission = (missionId: string) => {
    const mission = missions.find((item) => item.id === missionId)
    if (!mission) return
    if (window.confirm(t('missions.deleteConfirm', { code: mission.code, name: mission.name }))) {
      deleteMission(missionId)
      showToast('success', t('missions.toast.deleted', { name: mission.name }))
      if (editingMissionId === missionId) {
        cancelMissionEdit()
      }
      if (selectedMissionId === missionId) {
        setSelectedMissionId(undefined)
      }
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-agency-muted">{t('missions.subtitle')}</p>
        <h1 className="text-2xl font-semibold text-white">{t('missions.title')}</h1>
      </header>

      {mission ? (
        <Panel className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-agency-muted">{t('missions.currentMission')}</p>
              <h2 className="text-2xl font-semibold text-white">{mission.name}</h2>
              <p className="text-sm text-agency-muted">{mission.type} · {formatDate(mission.scheduledDate)}</p>
            </div>
            <div className="flex gap-2 text-xs uppercase tracking-[0.3em] text-agency-muted">
              <span className="border border-agency-border px-3 py-1 rounded-xl win98:rounded-none">{t('app.common.chaos')}：{mission.chaos}</span>
              <span className="border border-agency-border px-3 py-1 rounded-xl win98:rounded-none">{t('app.common.looseEnds')}：{mission.looseEnds}</span>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-agency-muted">{t('missions.chaosAdjust')}</p>
              <div className="flex gap-2">
                <button type="button" className="border border-agency-cyan/40 px-4 py-2 text-sm text-agency-cyan rounded-2xl win98:rounded-none" onClick={() => adjustMissionChaos(mission.id, 1, note)}>
                  +1
                </button>
                <button type="button" className="border border-agency-magenta/40 px-4 py-2 text-sm text-agency-magenta rounded-2xl win98:rounded-none" onClick={() => adjustMissionChaos(mission.id, -1, note)}>
                  -1
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-agency-muted">{t('missions.looseEndsAdjust')}</p>
              <div className="flex gap-2">
                <button type="button" className="border border-agency-amber/40 px-4 py-2 text-sm text-agency-amber rounded-2xl win98:rounded-none" onClick={() => adjustMissionLooseEnds(mission.id, 1, note)}>
                  +1
                </button>
                <button type="button" className="border border-agency-border px-4 py-2 text-sm text-agency-muted rounded-2xl win98:rounded-none" onClick={() => adjustMissionLooseEnds(mission.id, -1, note)}>
                  -1
                </button>
              </div>
            </div>
          </div>
          <label className="block text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('app.common.note')}
            <input value={note} onChange={(event) => setNote(event.target.value)} className="mt-1 w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm rounded-2xl win98:rounded-none" />
          </label>
          <button
            type="button"
            className="border border-agency-border px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-muted hover:border-agency-cyan hover:text-agency-cyan rounded-2xl win98:rounded-none"
            onClick={() => appendMissionLog(mission.id, note)}
          >
            {t('app.common.recordLog')}
          </button>
        </Panel>
      ) : null}

      <Panel>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-3">
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('missions.form.code')}
            <input className="mt-1 w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('code')} />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('missions.form.name')}
            <input className="mt-1 w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('name')} />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('missions.form.type')}
            <select className="mt-1 w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('type')}>
              <option value="收容">{t('missions.types.containment')}</option>
              <option value="清扫">{t('missions.types.cleanup')}</option>
              <option value="市场破坏">{t('missions.types.disruption')}</option>
              <option value="其他">{t('missions.types.other')}</option>
            </select>
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('missions.form.status')}
            <select className="mt-1 w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('status')}>
              <option value="planning">{t('missions.statusOptions.planning')}</option>
              <option value="active">{t('missions.statusOptions.active')}</option>
              <option value="debrief">{t('missions.statusOptions.debrief')}</option>
              <option value="archived">{t('missions.statusOptions.archived')}</option>
            </select>
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('app.common.chaos')}
            <input type="number" className="mt-1 w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('chaos', { valueAsNumber: true })} />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('app.common.looseEnds')}
            <input type="number" className="mt-1 w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('looseEnds', { valueAsNumber: true })} />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('missions.form.date')}
            <input type="date" className="mt-1 w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('scheduledDate')} />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('missions.form.optionalHint')}
            <input className="mt-1 w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('optionalObjectiveHint')} />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('missions.form.expectedAgents')}
            <input className="mt-1 w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('expectedAgents')} />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('missions.form.goalsSummary')}
            <input className="mt-1 w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('goalsSummary')} />
          </label>
          <div className="flex items-center gap-3 self-end">
            {editingMissionId ? (
              <button type="button" onClick={cancelMissionEdit} className="border border-agency-border px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-muted rounded-2xl win98:rounded-none">
                {t('app.common.cancelEdit')}
              </button>
            ) : null}
            <button type="submit" className="border border-agency-cyan/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-cyan rounded-2xl win98:rounded-none">
              {editingMissionId ? t('missions.saveMission') : t('missions.createMission')}
            </button>
          </div>
        </form>
      </Panel>

      <Panel className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-agency-border/60 text-sm">
          <thead className="bg-agency-ink/60 text-xs uppercase tracking-[0.3em] text-agency-muted">
            <tr>
              <th className="px-4 py-3 text-left">{t('missions.table.code')}</th>
              <th className="px-4 py-3 text-left">{t('missions.table.name')}</th>
              <th className="px-4 py-3 text-left">{t('missions.table.type')}</th>
              <th className="px-4 py-3 text-left">{t('missions.table.status')}</th>
              <th className="px-4 py-3 text-left">{t('app.common.chaos')}</th>
              <th className="px-4 py-3 text-left">{t('app.common.looseEnds')}</th>
              <th className="px-4 py-3 text-left">{t('missions.table.date')}</th>
              <th className="px-4 py-3 text-left">{t('missions.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-agency-border/40">
            {missions.map((item) => (
              <tr
                key={item.id}
                className={`cursor-pointer hover:bg-agency-ink/40 ${selectedMissionId === item.id ? 'bg-agency-ink/40' : ''}`}
                onClick={() => setSelectedMissionId(item.id)}
              >
                <td className="px-4 py-3 font-mono text-agency-cyan">{item.code}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.type}</td>
                <td className="px-4 py-3 uppercase tracking-[0.3em] text-xs">{item.status}</td>
                <td className="px-4 py-3">{item.chaos}</td>
                <td className="px-4 py-3">{item.looseEnds}</td>
                <td className="px-4 py-3">{formatDate(item.scheduledDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-xl border border-agency-border px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-agency-muted hover:border-agency-cyan hover:text-agency-cyan"
                      onClick={(event) => {
                        event.stopPropagation()
                        startEditMission(item.id)
                      }}
                    >
                      {editingMissionId === item.id ? t('app.common.editing') : t('app.common.edit')}
                    </button>
                    <button
                      type="button"
                      className="rounded-xl border border-agency-border/70 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-agency-muted hover:border-agency-magenta hover:text-agency-magenta"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleDeleteMission(item.id)
                      }}
                    >
                      {deleteText}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  )
}
