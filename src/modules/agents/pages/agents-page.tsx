import { Panel } from '@/components/ui/panel'
import { FormFieldError } from '@/components/ui/form-field'
import { useToast } from '@/components/ui/toast'
import { useCampaignStore } from '@/stores/campaign-store'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { QA_CATEGORIES } from '@/lib/types'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

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

type AgentFormValues = z.infer<typeof agentSchema>

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

export function AgentsPage() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const agents = useCampaignStore((state) => state.agents)
  const createAgent = useCampaignStore((state) => state.createAgent)
  const updateAgent = useCampaignStore((state) => state.updateAgent)
  const deleteAgent = useCampaignStore((state) => state.deleteAgent)
  const settleAgentDeltas = useCampaignStore((state) => state.settleAgentDeltas)
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null)
  const [claimDraft, setClaimDraft] = useState({
    itemName: '',
    category: '',
    reason: '',
  })
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: createEmptyAgentForm(),
  })

  const onSubmit = (values: AgentFormValues) => {
    if (editingAgentId) {
      const agent = agents.find((item) => item.id === editingAgentId)
      if (!agent) return
      // 保留现有的非表单字段（例如申领物记录 claims），只用表单值覆盖基础信息
      const { id: _id, claims, awardsDelta, reprimandsDelta, ...rest } = agent
      updateAgent(editingAgentId, { ...rest, ...values, claims, awardsDelta, reprimandsDelta })
      setEditingAgentId(null)
      showToast('success', t('agents.toast.updated', { name: values.codename }))
    } else {
      createAgent(values)
      showToast('success', t('agents.toast.created', { name: values.codename }))
    }
    form.reset(createEmptyAgentForm())
  }

  const startEdit = (agentId: string) => {
    const agent = agents.find((item) => item.id === agentId)
    if (!agent) return
    setEditingAgentId(agentId)
    const { id: _id, awardsDelta, reprimandsDelta, ...rest } = agent
    form.reset({ ...rest })
    setClaimDraft({ itemName: '', category: '', reason: '' })
  }

  const cancelEdit = () => {
    setEditingAgentId(null)
    form.reset(createEmptyAgentForm())
    setClaimDraft({ itemName: '', category: '', reason: '' })
  }

  const handleDelete = (agentId: string) => {
    const target = agents.find((agent) => agent.id === agentId)
    if (!target) return
    if (window.confirm(t('agents.deleteConfirm', { name: target.codename }))) {
      deleteAgent(agentId)
      showToast('success', t('agents.toast.deleted', { name: target.codename }))
      if (editingAgentId === agentId) {
        cancelEdit()
      }
    }
  }

  const currentClaims = useMemo(() => {
    if (!editingAgentId) return []
    const agent = agents.find((item) => item.id === editingAgentId)
    return agent?.claims ?? []
  }, [agents, editingAgentId])

  const upsertClaims = (nextClaims: { id: string; itemName: string; category: string; reason: string; claimedAt: string; status: 'pending' | 'approved' | 'rejected' }[]) => {
    if (!editingAgentId) return
    const agent = agents.find((item) => item.id === editingAgentId)
    if (!agent) return
    const { id: _id, ...rest } = agent
    updateAgent(editingAgentId, { ...rest, claims: nextClaims })
  }

  const handleAddClaim = () => {
    if (!editingAgentId) return
    if (!claimDraft.itemName.trim()) return
    const next = [
      ...currentClaims,
      {
        id: Math.random().toString(36).slice(2, 10),
        itemName: claimDraft.itemName.trim(),
        category: claimDraft.category.trim() || t('agents.claims.uncategorized'),
        reason: claimDraft.reason.trim() || t('agents.claims.reasonDefault'),
        claimedAt: new Date().toISOString(),
        status: 'pending' as const,
      },
    ]
    upsertClaims(next)
    setClaimDraft({ itemName: '', category: '', reason: '' })
  }

  const handleDeleteClaim = (claimId: string) => {
    const next = currentClaims.filter((item) => item.id !== claimId)
    upsertClaims(next)
  }

  const handleSettleDeltas = () => {
    if (window.confirm(t('agents.settleConfirm'))) {
      settleAgentDeltas()
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-agency-muted">{t('agents.subtitle')}</p>
            <h1 className="text-2xl font-semibold text-white">{t('agents.title')}</h1>
          </div>
          <button
            type="button"
            onClick={handleSettleDeltas}
            className="border border-agency-cyan/60 px-4 py-2 text-[0.7rem] uppercase tracking-[0.3em] text-agency-cyan hover:border-agency-cyan rounded-2xl win98:rounded-none"
          >
            {t('agents.settleDeltas')}
          </button>
        </div>
      </header>
      <Panel>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('agents.form.codename')}
            <input
              className={cn(
                "w-full border bg-agency-ink/60 px-3 py-2 font-mono text-sm text-agency-cyan rounded-xl win98:rounded-none",
                form.formState.errors.codename ? "border-agency-magenta" : "border-agency-border"
              )}
              {...form.register('codename')}
            />
            <FormFieldError error={form.formState.errors.codename} />
          </label>
          <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('agents.form.arcAnomaly')}
            <input
              className={cn(
                "w-full border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none",
                form.formState.errors.arcAnomaly ? "border-agency-magenta" : "border-agency-border"
              )}
              {...form.register('arcAnomaly')}
            />
            <FormFieldError error={form.formState.errors.arcAnomaly} />
          </label>
          <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('agents.form.arcReality')}
            <input
              className={cn(
                "w-full border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none",
                form.formState.errors.arcReality ? "border-agency-magenta" : "border-agency-border"
              )}
              {...form.register('arcReality')}
            />
            <FormFieldError error={form.formState.errors.arcReality} />
          </label>
          <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
            {t('agents.form.arcRole')}
            <input
              className={cn(
                "w-full border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none",
                form.formState.errors.arcRole ? "border-agency-magenta" : "border-agency-border"
              )}
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
          {editingAgentId ? (
            <div className="md:col-span-3 space-y-2 text-xs uppercase tracking-[0.3em] text-agency-muted">
              <div className="flex items-center justify-between">
                <span>{t('agents.claims.title')}</span>
                <span className="text-[0.65rem] text-agency-muted normal-case">{t('agents.claims.count', { count: currentClaims.length })}</span>
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
              {currentClaims.length ? (
                <div className="mt-2 space-y-2 border border-agency-border/80 bg-agency-ink/60 p-3 rounded-2xl win98:rounded-none">
                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-agency-muted">{t('agents.claims.history')}</p>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {currentClaims.map((claim) => (
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
                          {t('app.common.delete')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="flex items-center gap-3 self-end">
            {editingAgentId ? (
              <button type="button" onClick={cancelEdit} className="border border-agency-border px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-muted rounded-2xl win98:rounded-none">
                {t('agents.form.cancel')}
              </button>
            ) : null}
            <button type="submit" className="border border-agency-cyan/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-cyan transition hover:border-agency-cyan rounded-2xl win98:rounded-none">
              {editingAgentId ? t('agents.form.update') : t('agents.form.submit')}
            </button>
          </div>
        </form>
      </Panel>
      <Panel className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-agency-border/60 text-sm">
          <thead className="bg-agency-ink/60 text-xs uppercase tracking-[0.2em] text-agency-muted">
            <tr>
              <th className="px-3 py-2 text-left">{t('agents.form.codename')}</th>
              <th className="px-3 py-2 text-left">{t('agents.form.arcAnomaly')}/{t('agents.form.arcReality')}/{t('agents.form.arcRole')}</th>
              <th className="px-3 py-2 text-left">{t('agents.form.qaLabel')}</th>
              <th className="px-3 py-2 text-left">{t('agents.form.awards')}/{t('agents.form.reprimands')}</th>
              <th className="px-3 py-2 text-left">Δ</th>
              <th className="px-3 py-2 text-left">{t('agents.form.status')}</th>
              <th className="px-3 py-2 text-left"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-agency-border/40">
            {agents.map((agent) => (
              <tr key={agent.id} className={`cursor-pointer hover:bg-agency-ink/40 ${editingAgentId === agent.id ? 'bg-agency-ink/40' : ''}`} onClick={() => startEdit(agent.id)}>
                <td className="px-3 py-2 font-mono text-agency-cyan whitespace-nowrap">{agent.codename}</td>
                <td className="px-3 py-2 text-xs">
                  <div className="space-y-0.5">
                    <div>{agent.arcAnomaly}</div>
                    <div>{agent.arcReality}</div>
                    <div>{agent.arcRole}</div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="grid gap-1 grid-cols-3" style={{ minWidth: '240px' }}>
                    {QA_CATEGORIES.map((category) => (
                      <div key={category.key} className="border border-agency-border/60 bg-agency-ink/40 px-1 py-0.5 text-[0.45rem] uppercase tracking-[0.05em] text-agency-muted rounded win98:rounded-none">
                        <div className="text-center font-medium">
                          <div className="leading-tight">{t(`agents.stats.${category.key}`)}</div>
                          <div className="font-mono text-agency-cyan text-[0.6rem]">{agent.qa[category.key].current}/{agent.qa[category.key].max}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="text-agency-amber">+{agent.awards}</span>
                  <span className="mx-1 text-agency-muted">/</span>
                  <span className="text-agency-magenta">-{agent.reprimands}</span>
                </td>
                <td className="px-3 py-2 text-xs text-agency-muted">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[0.6rem] w-6">+A</span>
                      <input
                        type="number"
                        className="w-12 border border-agency-border bg-agency-ink/60 px-1 py-0.5 text-[0.7rem] font-mono text-agency-cyan rounded win98:rounded-none"
                        value={agent.awardsDelta ?? 0}
                        onChange={(e) => {
                          const delta = Number.isNaN(Number(e.target.value)) ? 0 : Number(e.target.value)
                          const { id: _id, ...rest } = agent
                          updateAgent(agent.id, { ...rest, awardsDelta: delta })
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[0.6rem] w-6">+R</span>
                      <input
                        type="number"
                        className="w-12 border border-agency-border bg-agency-ink/60 px-1 py-0.5 text-[0.7rem] font-mono text-agency-cyan rounded win98:rounded-none"
                        value={agent.reprimandsDelta ?? 0}
                        onChange={(e) => {
                          const delta = Number.isNaN(Number(e.target.value)) ? 0 : Number(e.target.value)
                          const { id: _id, ...rest } = agent
                          updateAgent(agent.id, { ...rest, reprimandsDelta: delta })
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 uppercase tracking-[0.2em] text-[0.6rem] text-agency-muted whitespace-nowrap">{t(`agents.statusOptions.${agent.status}`)}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="border border-agency-border px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-agency-muted hover:border-agency-magenta hover:text-agency-magenta rounded win98:rounded-none"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleDelete(agent.id)
                    }}
                  >
                    {t('app.common.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  )
}
