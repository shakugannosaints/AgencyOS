import type { AgentSummary, AnomalySummary, Campaign, MissionSummary, QAKey, QAProfile, QAStat } from '@/lib/types'
import { QA_CATEGORIES } from '@/lib/types'

const createQAProfile = (overrides: Partial<Record<QAKey, QAStat>> = {}): QAProfile =>
  QA_CATEGORIES.reduce((profile, { key }) => {
    profile[key] = overrides[key] ?? { current: 1, max: 3 }
    return profile
  }, {} as QAProfile)

export const mockCampaign: Campaign = {
  id: 'tri-404',
  name: '三联城第404分部',
  divisionCode: 'DIV-404',
  location: '三联城 · 旧商业区',
  status: 'active',
  styleTags: ['职场喜剧', '高混沌'],
  contentFlags: ['内容-情感操控', '内容-精神压力'],
  defaultRules: ['A4', 'B2', 'F1'],
  nextMissionId: 'msn-018',
  // initial on-duty general manager (empty by default)
  generalManager: '',
  updatedAt: new Date().toISOString(),
}

export const mockAgents: AgentSummary[] = [
  {
    id: 'agent-x',
    codename: 'Agent X',
    arcAnomaly: 'Glitch',
    arcReality: 'Overbooked',
    arcRole: 'Intern',
    qa: createQAProfile({
      focus: { current: 4, max: 7 },
      deceit: { current: 3, max: 6 },
      vitality: { current: 5, max: 7 },
      empathy: { current: 2, max: 6 },
      initiative: { current: 5, max: 8 },
      resilience: { current: 4, max: 7 },
      presence: { current: 3, max: 6 },
      expertise: { current: 6, max: 9 },
      mystique: { current: 4, max: 7 },
    }),
    awards: 15,
    reprimands: 2,
  status: 'active',
  awardsDelta: 0,
  reprimandsDelta: 0,
    claims: [
      {
        id: 'claim-ax-01',
        itemName: '一次性收容装备包',
        category: '收容装备',
        reason: '执行 MSN-017 任务时需要额外防护与收容工具',
        claimedAt: new Date().toISOString(),
        status: 'approved',
      },
    ],
  },
  {
    id: 'agent-lotus',
    codename: 'Lotus',
    arcAnomaly: 'Whisper',
    arcReality: 'Caretaker',
    arcRole: 'PR',
    qa: createQAProfile({
      focus: { current: 6, max: 8 },
      deceit: { current: 5, max: 8 },
      vitality: { current: 4, max: 6 },
      empathy: { current: 7, max: 9 },
      initiative: { current: 3, max: 6 },
      resilience: { current: 5, max: 7 },
      presence: { current: 6, max: 9 },
      expertise: { current: 5, max: 8 },
      mystique: { current: 4, max: 7 },
    }),
    awards: 7,
    reprimands: 4,
    status: 'resting',
    awardsDelta: 0,
    reprimandsDelta: 0,
  },
]

export const mockMissions: MissionSummary[] = [
  {
    id: 'msn-017',
    code: 'MSN-017',
    name: '市场破坏 · 霓虹直播间',
    type: '市场破坏',
    status: 'active',
    chaos: 5,
    looseEnds: 3,
    realityRequestsFailed: 0,
    scheduledDate: new Date().toISOString(),
    optionalObjectiveHint: '完成 2 / 4 个可选目标 · 奖励 +3 嘉奖',
    expectedAgents: 'Agent X · Lotus · Sugarcoat',
    goalsSummary: '破坏品牌信任 / 扰乱直播算法',
  },
  {
    id: 'msn-018',
    code: 'MSN-018',
    name: '收容 · Whisper 低语者',
    type: '收容',
    status: 'planning',
    chaos: 2,
    looseEnds: 1,
   realityRequestsFailed: 0,
    scheduledDate: new Date(Date.now() + 86400000).toISOString(),
    optionalObjectiveHint: '记录 3 次低语样本 · 奖励+1 嘉奖',
    expectedAgents: 'Agent X · Lotus',
    goalsSummary: '捕获 Whisper-β / 控制散逸端',
  },
]

export const mockAnomalies: AnomalySummary[] = [
  {
    id: 'an-01',
    codename: 'Absence-14',
    focus: '恐惧 · 沉默',
    domain: '公共图书馆夜班',
    status: 'contained',
  },
  {
    id: 'an-02',
    codename: 'Growth-77',
    focus: '贪婪 · 促销',
    domain: '大型商场促销周',
    status: 'active',
  },
]
