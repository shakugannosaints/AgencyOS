import { Panel } from '@/components/ui/panel'
import { useToast } from '@/components/ui/use-toast'
import { useTrans } from '@/lib/i18n-utils'
import type { AgentClaimRecord } from '@/lib/types'
import { useCampaignStore } from '@/stores/campaign-store'
import { useState } from 'react'
import { AgentForm, type AgentFormValues } from '../components/agent-form'
import { AgentList } from '../components/agent-list'

export function AgentsPage() {
  const t = useTrans()
  const { showToast } = useToast()
  const agents = useCampaignStore((state) => state.agents)
  const createAgent = useCampaignStore((state) => state.createAgent)
  const updateAgent = useCampaignStore((state) => state.updateAgent)
  const deleteAgent = useCampaignStore((state) => state.deleteAgent)
  const settleAgentDeltas = useCampaignStore((state) => state.settleAgentDeltas)
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null)

  const onSubmit = (values: AgentFormValues, claims: AgentClaimRecord[]) => {
    if (editingAgentId) {
      const agent = agents.find((item) => item.id === editingAgentId)
      if (!agent) return
      // 保留现有的非表单字段（例如申领物记录 claims），只用表单值覆盖基础信息
      const { id: _id, claims: _oldClaims, awardsDelta, reprimandsDelta, ...rest } = agent
      void _id
      void _oldClaims
      updateAgent(editingAgentId, { ...rest, ...values, claims, awardsDelta, reprimandsDelta })
      setEditingAgentId(null)
      showToast('success', t('agents.toast.updated', { name: values.codename }))
    } else {
      createAgent({ ...values, claims: claims.length > 0 ? claims : undefined })
      showToast('success', t('agents.toast.created', { name: values.codename }))
    }
  }

  const startEdit = (agentId: string) => {
    setEditingAgentId(agentId)
  }

  const cancelEdit = () => {
    setEditingAgentId(null)
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

  const handleUpdateDelta = (id: string, field: 'awardsDelta' | 'reprimandsDelta', value: number) => {
    const agent = agents.find((a) => a.id === id)
    if (!agent) return
    const { id: _id, ...rest } = agent
    void _id
    updateAgent(id, { ...rest, [field]: value })
  }

  const handleSettleDeltas = () => {
    if (window.confirm(t('agents.settleConfirm'))) {
      settleAgentDeltas()
    }
  }

  const editingAgent = agents.find(a => a.id === editingAgentId)

  return (
    <div className="space-y-6">
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
        <AgentForm 
          key={editingAgentId || 'create'}
          initialData={editingAgent} 
          onSubmit={onSubmit} 
          onCancel={cancelEdit} 
          isEditing={!!editingAgentId} 
        />
      </Panel>
      <AgentList 
        agents={agents} 
        editingAgentId={editingAgentId} 
        onEdit={startEdit} 
        onDelete={handleDelete} 
        onUpdateDelta={handleUpdateDelta}
      />
    </div>
  )
}
