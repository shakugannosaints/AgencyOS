import { FormFieldError } from '@/components/ui/form-field'
import { useCommonTranslations, useTrans } from '@/lib/i18n-utils'
import { QA_CATEGORIES, type AgentSummary, type AgentClaimRecord } from '@/lib/types'
import { createId } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const agentSchema = z.object({
  codename: z.string().min(2, '请输入代号'),
  arcAnomaly: z.string().min(1),
  arcReality: z.string().min(1),
  arcRole: z.string().min(1),
  qa: z.object({
    focus: z.object({ current: z.number().min(0).max(9), max: z.number().min(0).max(9) }),
    deceit: z.object({ current: z.number().min(0).max(9), max: z.number().min(0).max(9) }),
    vitality: z.object({ current: z.number().min(0).max(9), max: z.number().min(0).max(9) }),
    empathy: z.object({ current: z.number().min(0).max(9), max: z.number().min(0).max(9) }),
    initiative: z.object({ current: z.number().min(0).max(9), max: z.number().min(0).max(9) }),
    resilience: z.object({ current: z.number().min(0).max(9), max: z.number().min(0).max(9) }),
    presence: z.object({ current: z.number().min(0).max(9), max: z.number().min(0).max(9) }),
    expertise: z.object({ current: z.number().min(0).max(9), max: z.number().min(0).max(9) }),
    mystique: z.object({ current: z.number().min(0).max(9), max: z.number().min(0).max(9) }),
  }),
  awards: z.number().min(0),
  reprimands: z.number().min(0),
  status: z.enum(['active', 'resting', 'retired', 'dead', 'pending']),
})

export type AgentFormValues = z.infer<typeof agentSchema>

const createDefaultQAValues = (): AgentFormValues['qa'] =>
  QA_CATEGORIES.reduce((acc, category) => {
    acc[category.key] = { current: 1, max: 3 }
    return acc
  }, {} as AgentFormValues['qa'])

const createEmptyAgentForm = (): AgentFormValues => ({
  codename: '',
  arcAnomaly: '',
  arcReality: '',
  arcRole: '',
  qa: createDefaultQAValues(),
  awards: 0,
  reprimands: 0,
  status: 'active',
})

interface AgentFormProps {
  initialData?: AgentSummary
  onSubmit: (values: AgentFormValues, claims: AgentClaimRecord[]) => void
  onCancel: () => void
  isEditing: boolean
}

export function AgentForm({ initialData, onSubmit, onCancel, isEditing }: AgentFormProps) {
  const t = useTrans()
  const { delete: deleteText, cancel: cancelText, update: updateText, submit: submitText } = useCommonTranslations()
  
  const [claims, setClaims] = useState<AgentClaimRecord[]>(initialData?.claims || [])
  const [claimDraft, setClaimDraft] = useState({
    itemName: '',
    category: '',
    reason: '',
  })

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: initialData ? {
      codename: initialData.codename,
      arcAnomaly: initialData.arcAnomaly,
      arcReality: initialData.arcReality,
      arcRole: initialData.arcRole,
      qa: initialData.qa,
      awards: initialData.awards,
      reprimands: initialData.reprimands,
      status: initialData.status,
    } : createEmptyAgentForm(),
  })

  const handleSubmit = (values: AgentFormValues) => {
    onSubmit(values, claims)
    if (!isEditing) {
      form.reset(createEmptyAgentForm())
      setClaims([])
    }
    setClaimDraft({ itemName: '', category: '', reason: '' })
  }

  const handleAddClaim = () => {
    if (!claimDraft.itemName.trim()) return
    const next: AgentClaimRecord[] = [
      ...claims,
      {
        id: createId(),
        itemName: claimDraft.itemName.trim(),
        category: claimDraft.category.trim() || t('agents.claims.uncategorized'),
        reason: claimDraft.reason.trim() || t('agents.claims.reasonDefault'),
        claimedAt: new Date().toISOString(),
        status: 'pending',
      },
    ]
    setClaims(next)
    setClaimDraft({ itemName: '', category: '', reason: '' })
  }

  const handleDeleteClaim = (claimId: string) => {
    setClaims(claims.filter((item) => item.id !== claimId))
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 md:grid-cols-4">
      <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
        {t('agents.form.codename')}
        <input
          className={`w-full border bg-agency-ink/60 px-3 py-2 font-mono text-sm text-agency-cyan rounded-xl win98:rounded-none ${form.formState.errors.codename ? "border-agency-magenta" : "border-agency-border"}`}
          {...form.register('codename')}
        />
        <FormFieldError error={form.formState.errors.codename} />
      </label>
      <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
        {t('agents.form.arcAnomalyf')}
        <input
          className={`w-full border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none ${form.formState.errors.arcAnomaly ? "border-agency-magenta" : "border-agency-border"}`}
          {...form.register('arcAnomaly')}
        />
        <FormFieldError error={form.formState.errors.arcAnomaly} />
      </label>
      <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
        {t('agents.form.arcRealityf')}
        <input
          className={`w-full border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none ${form.formState.errors.arcReality ? "border-agency-magenta" : "border-agency-border"}`}
          {...form.register('arcReality')}
        />
        <FormFieldError error={form.formState.errors.arcReality} />
      </label>
      <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
        {t('agents.form.arcRolef')}
        <input
          className={`w-full border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none ${form.formState.errors.arcRole ? "border-agency-magenta" : "border-agency-border"}`}
          {...form.register('arcRole')}
        />
        <FormFieldError error={form.formState.errors.arcRole} />
      </label>
      <div className="space-y-2 text-xs uppercase tracking-[0.3em] text-agency-muted md:col-span-3">
        <p>{t('agents.form.qaLabel')}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QA_CATEGORIES.map((category) => (
            <label key={category.key} className="space-y-1 border border-agency-border/80 bg-agency-ink/60 p-3 rounded-2xl win98:rounded-none">
              <span className="text-[0.65rem] tracking-[0.4em] text-agency-muted">{t(`agents.stats.${category.key}`)}</span>
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  className="w-full border border-agency-border bg-agency-ink px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none"
                  {...form.register(`qa.${category.key}.current` as const, { valueAsNumber: true })}
                />
                <input
                  type="number"
                  className="w-full border border-agency-border bg-agency-ink px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none"
                  {...form.register(`qa.${category.key}.max` as const, { valueAsNumber: true })}
                />
              </div>
            </label>
          ))}
        </div>
      </div>
      <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
        {t('agents.form.awards')}/{t('agents.form.reprimands')}
        <div className="flex gap-2">
          <input type="number" className="w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('awards', { valueAsNumber: true })} />
          <input type="number" className="w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('reprimands', { valueAsNumber: true })} />
        </div>
      </label>
      <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
        {t('agents.form.status')}
        <select className="w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('status')}>
          <option value="active">{t('agents.statusOptions.active')}</option>
          <option value="resting">{t('agents.statusOptions.resting')}</option>
          <option value="retired">{t('agents.statusOptions.retired')}</option>
          <option value="dead">{t('agents.statusOptions.dead')}</option>
          <option value="pending">{t('agents.statusOptions.pending')}</option>
        </select>
      </label>
      <div className="md:col-span-3 space-y-2 text-xs uppercase tracking-[0.3em] text-agency-muted">
        <div className="flex items-center justify-between">
          <span>{t('agents.claims.title')}</span>
          <span className="text-[0.65rem] text-agency-muted normal-case">{t('agents.claims.count', { count: claims.length })}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-[2fr_1.5fr_3fr_auto] items-start">
          <label className="space-y-1">
            <span className="text-[0.65rem] tracking-[0.3em]">{t('agents.claims.itemName')}</span>
            <input
              className="w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none"
              value={claimDraft.itemName}
              onChange={(e) => setClaimDraft((prev) => ({ ...prev, itemName: e.target.value }))}
              placeholder={t('agents.claims.itemNamePlaceholder')}
            />
          </label>
          <label className="space-y-1">
            <span className="text-[0.65rem] tracking-[0.3em]">{t('agents.claims.category')}</span>
            <input
              className="w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none"
              value={claimDraft.category}
              onChange={(e) => setClaimDraft((prev) => ({ ...prev, category: e.target.value }))}
              placeholder={t('agents.claims.categoryPlaceholder')}
            />
          </label>
          <label className="space-y-1">
            <span className="text-[0.65rem] tracking-[0.3em]">{t('agents.claims.reason')}</span>
            <input
              className="w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none"
              value={claimDraft.reason}
              onChange={(e) => setClaimDraft((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder={t('agents.claims.reasonPlaceholder')}
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAddClaim}
              className="w-full border border-agency-cyan/60 px-3 py-2 text-[0.7rem] uppercase tracking-[0.3em] text-agency-cyan hover:border-agency-cyan disabled:border-agency-border disabled:text-agency-border rounded-2xl win98:rounded-none"
              disabled={!claimDraft.itemName.trim()}
            >
              {t('agents.claims.addClaim')}
            </button>
          </div>
        </div>
        {claims.length ? (
          <div className="mt-2 space-y-2 border border-agency-border/80 bg-agency-ink/60 p-3 rounded-2xl win98:rounded-none">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-agency-muted">{t('agents.claims.history')}</p>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-start justify-between gap-3 border border-agency-border/60 bg-agency-ink/80 px-3 py-2 text-[0.75rem] text-agency-muted rounded-xl win98:rounded-none"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-agency-cyan">{claim.itemName}</span>
                      <span className="rounded-full border border-agency-border px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.3em]">
                        {claim.category || t('agents.claims.uncategorized')}
                      </span>
                      <span className="text-[0.6rem] uppercase tracking-[0.3em] text-agency-muted">
                        {new Date(claim.claimedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[0.7rem] leading-relaxed">{t('agents.claims.reason')}：{claim.reason}</p>
                    <p className="text-[0.65rem] uppercase tracking-[0.3em] text-agency-amber">{t('agents.claims.status')}：{claim.status}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteClaim(claim.id)}
                    className="mt-1 border border-agency-border px-2 py-1 text-[0.6rem] uppercase tracking-[0.3em] text-agency-muted hover:border-agency-magenta hover:text-agency-magenta rounded-xl win98:rounded-none"
                  >
                    {deleteText}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-3 self-end">
        {isEditing ? (
          <button type="button" onClick={onCancel} className="border border-agency-border px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-muted rounded-2xl win98:rounded-none">
            {cancelText}
          </button>
        ) : null}
        <button type="submit" className="border border-agency-cyan/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-cyan transition hover:border-agency-cyan rounded-2xl win98:rounded-none">
          {isEditing ? updateText : submitText}
        </button>
      </div>
    </form>
  )
}
