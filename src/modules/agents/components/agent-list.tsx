import { Panel } from '@/components/ui/panel'
import { useCommonTranslations, useTrans } from '@/lib/i18n-utils'
import { type AgentSummary, QA_CATEGORIES } from '@/lib/types'

interface AgentListProps {
  agents: AgentSummary[]
  editingAgentId: string | null
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onUpdateDelta: (id: string, field: 'awardsDelta' | 'reprimandsDelta', value: number) => void
}

export function AgentList({ agents, editingAgentId, onEdit, onDelete, onUpdateDelta }: AgentListProps) {
  const t = useTrans()
  const { delete: deleteText } = useCommonTranslations()

  return (
    <Panel className="overflow-x-auto p-0 lg:col-span-2">
      <table className="min-w-full divide-y divide-agency-border/60 text-sm">
        <thead className="bg-agency-ink/60 text-xs uppercase tracking-[0.2em] text-agency-muted">
          <tr>
            <th className="px-3 py-2 text-left">{t('agents.form.codename')}</th>
            <th className="px-3 py-2 text-left">{t('agents.form.arcAnomaly')}/{t('agents.form.arcReality')}/{t('agents.form.arcRole')}</th>
            <th className="px-3 py-2 text-left">{t('agents.form.qaLabel')}</th>
            <th className="px-3 py-2 text-left">{t('agents.form.awards')}/{t('agents.form.reprimands')}</th>
            <th className="px-3 py-2 text-left">{t('agents.form.missionDelta')}</th>
            <th className="px-3 py-2 text-left">{t('agents.form.status')}</th>
            <th className="px-3 py-2 text-left"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-agency-border/40">
          {agents.map((agent) => (
            <tr key={agent.id} className={`cursor-pointer hover:bg-agency-ink/40 ${editingAgentId === agent.id ? 'bg-agency-ink/40' : ''}`} onClick={() => onEdit(agent.id)}>
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
                    <span className="text-[0.6rem] w-8">+{t('agents.awardsDelta')}</span>
                    <input
                      type="number"
                      className="w-12 border border-agency-border bg-agency-ink/60 px-1 py-0.5 text-[0.7rem] font-mono text-agency-cyan rounded win98:rounded-none"
                      value={agent.awardsDelta ?? 0}
                      onChange={(e) => {
                        const delta = Number.isNaN(Number(e.target.value)) ? 0 : Number(e.target.value)
                        onUpdateDelta(agent.id, 'awardsDelta', delta)
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[0.6rem] w-8">+{t('agents.reprimandsDelta')}</span>
                    <input
                      type="number"
                      className="w-12 border border-agency-border bg-agency-ink/60 px-1 py-0.5 text-[0.7rem] font-mono text-agency-cyan rounded win98:rounded-none"
                      value={agent.reprimandsDelta ?? 0}
                      onChange={(e) => {
                        const delta = Number.isNaN(Number(e.target.value)) ? 0 : Number(e.target.value)
                        onUpdateDelta(agent.id, 'reprimandsDelta', delta)
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
                    onDelete(agent.id)
                  }}
                >
                  {deleteText}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  )
}
