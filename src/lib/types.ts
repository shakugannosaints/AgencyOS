export interface TrackItemSnapshot {
  id: ID
  label: string
  checked: boolean
}

export interface CustomTrackSnapshot {
  id: ID
  name: string
  color: string
  items: TrackItemSnapshot[]
}
export type ID = string

export type CampaignStatus = 'active' | 'paused' | 'ended'
export type AgentStatus = 'active' | 'resting' | 'retired' | 'dead' | 'pending'
export type MissionType = '收容' | '清扫' | '市场破坏' | '其他'
export type MissionStatus = 'planning' | 'active' | 'debrief' | 'archived'

export const QA_CATEGORIES = [
  { key: 'focus', label: '专注' },
  { key: 'deceit', label: '欺瞒' },
  { key: 'vitality', label: '活力' },
  { key: 'empathy', label: '共情' },
  { key: 'initiative', label: '主动' },
  { key: 'resilience', label: '坚毅' },
  { key: 'presence', label: '气场' },
  { key: 'expertise', label: '专业' },
  { key: 'mystique', label: '诡秘' },
] as const

export type QAKey = (typeof QA_CATEGORIES)[number]['key']

export interface QAStat {
  current: number
  max: number
}

export type QAProfile = Record<QAKey, QAStat>

export interface Campaign {
  id: ID
  name: string
  divisionCode: string
  location: string
  status: CampaignStatus
  styleTags: string[]
  contentFlags: string[]
  defaultRules: string[]
  nextMissionId?: ID
  // Optional current on-duty general manager (editable in UI)
  generalManager?: string
  updatedAt: string
}

export interface AgentClaimRecord {
  id: ID
  itemName: string
  category: string
  reason: string
  claimedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface AgentSummary {
  id: ID
  codename: string
  arcAnomaly: string
  arcReality: string
  arcRole: string
  qa: QAProfile
  awards: number
  reprimands: number
  status: AgentStatus
  claims?: AgentClaimRecord[]
  // 当前任务内新增的嘉奖/申诫增量，用于计算本次任务的 MVP / 观察期
  awardsDelta?: number
  reprimandsDelta?: number
}

export interface MissionSummary {
  id: ID
  code: string
  name: string
  type: MissionType
  status: MissionStatus
  chaos: number
  looseEnds: number
  realityRequestsFailed?: number
  scheduledDate: string
  optionalObjectiveHint?: string
  expectedAgents?: string
  goalsSummary?: string
}

export interface AnomalySummary {
  id: ID
  codename: string
  focus: string
  domain: string
  status: 'active' | 'contained' | 'neutralized' | 'escaped'
}

export interface Note {
  id: ID
  title: string
  summary: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface MissionLogEntry {
  id: ID
  missionId: ID
  timestamp: string
  type: 'log' | 'chaos' | 'loose-end' | 'reality-failure'
  detail: string
  delta?: number
}

export interface AgencySnapshot {
  campaign: Campaign
  agents: AgentSummary[]
  missions: MissionSummary[]
  anomalies: AnomalySummary[]
  notes: Note[]
  logs: MissionLogEntry[]
  tracks?: CustomTrackSnapshot[]
  settings?: {
    notesAllowHtml?: boolean
  }
}
