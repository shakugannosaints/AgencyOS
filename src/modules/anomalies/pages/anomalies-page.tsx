import { Panel } from '@/components/ui/panel'
import { useCampaignStore } from '@/stores/campaign-store'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useTrans } from '@/lib/i18n-utils'

const anomalySchema = z.object({
  codename: z.string().min(2),
  focus: z.string().min(2),
  domain: z.string().min(2),
  status: z.enum(['active', 'contained', 'neutralized', 'escaped']),
})

type AnomalyFormValues = z.infer<typeof anomalySchema>

export function AnomaliesPage() {
  const t = useTrans()
  const anomalies = useCampaignStore((state) => state.anomalies)
  const createAnomaly = useCampaignStore((state) => state.createAnomaly)
  const updateAnomaly = useCampaignStore((state) => state.updateAnomaly)
  const deleteAnomaly = useCampaignStore((state) => state.deleteAnomaly)
  const [editingAnomalyId, setEditingAnomalyId] = useState<string | null>(null)
  const createDefaultValues = (): AnomalyFormValues => ({
    codename: '',
    focus: '',
    domain: '',
    status: 'active',
  })
  const form = useForm<AnomalyFormValues>({
    resolver: zodResolver(anomalySchema),
    defaultValues: createDefaultValues(),
  })

  const onSubmit = (values: AnomalyFormValues) => {
    if (editingAnomalyId) {
      updateAnomaly(editingAnomalyId, values)
      setEditingAnomalyId(null)
    } else {
      createAnomaly(values)
    }
    form.reset(createDefaultValues())
  }

  const startEdit = (id: string) => {
    const anomaly = anomalies.find((item) => item.id === id)
    if (!anomaly) return
    setEditingAnomalyId(id)
    const { id: _id, ...rest } = anomaly
    form.reset(rest)
  }

  const cancelEdit = () => {
    setEditingAnomalyId(null)
    form.reset(createDefaultValues())
  }

  const handleDelete = (id: string) => {
    const anomaly = anomalies.find((item) => item.id === id)
    if (!anomaly) return
    if (window.confirm(t('anomalies.deleteConfirm', { name: anomaly.codename }))) {
      deleteAnomaly(id)
      if (editingAnomalyId === id) {
        cancelEdit()
      }
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-agency-muted">{t('anomalies.subtitle')}</p>
        <h1 className="text-2xl font-semibold text-white">{t('anomalies.title')}</h1>
      </header>

      <Panel>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-4">
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('anomalies.form.codename')}
            <input className="mt-1 w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('codename')} />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('anomalies.form.focus')}
            <input className="mt-1 w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('focus')} />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('anomalies.form.domain')}
            <input className="mt-1 w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('domain')} />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('anomalies.form.status')}
            <select className="mt-1 w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('status')}>
              <option value="active">{t('anomalies.statusOptions.active')}</option>
              <option value="contained">{t('anomalies.statusOptions.contained')}</option>
              <option value="neutralized">{t('anomalies.statusOptions.neutralized')}</option>
              <option value="escaped">{t('anomalies.statusOptions.escaped')}</option>
            </select>
          </label>
          <div className="md:col-span-4 flex items-center gap-3">
            {editingAnomalyId ? (
              <button type="button" onClick={cancelEdit} className="border border-agency-border px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-muted rounded-2xl win98:rounded-none">
                {t('app.common.cancelEdit')}
              </button>
            ) : null}
            <button type="submit" className="border border-agency-cyan/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-cyan rounded-2xl win98:rounded-none">
              {editingAnomalyId ? t('anomalies.saveAnomaly') : t('anomalies.createAnomaly')}
            </button>
          </div>
        </form>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        {anomalies.map((anomaly) => (
          <Panel key={anomaly.id} className={editingAnomalyId === anomaly.id ? 'border-agency-cyan/60' : undefined}>
            <p className="text-xs uppercase tracking-[0.4em] text-agency-muted">{anomaly.status}</p>
            <h2 className="text-xl font-semibold text-white">{anomaly.codename}</h2>
            <p className="text-sm text-agency-muted">{t('anomalies.card.focus')}：{anomaly.focus}</p>
            <p className="text-sm text-agency-muted">{t('anomalies.card.domain')}：{anomaly.domain}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="border border-agency-border px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-agency-muted hover:border-agency-cyan hover:text-agency-cyan rounded-xl win98:rounded-none"
                onClick={() => startEdit(anomaly.id)}
              >
                {editingAnomalyId === anomaly.id ? t('app.common.editing') : t('app.common.edit')}
              </button>
              <button
                type="button"
                className="border border-agency-border/70 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-agency-muted hover:border-agency-magenta hover:text-agency-magenta rounded-xl win98:rounded-none"
                onClick={() => handleDelete(anomaly.id)}
              >
                {t('app.common.delete')}
              </button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}
