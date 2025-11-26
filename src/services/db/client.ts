import Dexie, { type Table } from 'dexie'
import type { AgentSummary, AnomalySummary, Campaign, MissionLogEntry, MissionSummary } from '@/lib/types'
import type { CustomTrackSnapshot, Note } from '@/lib/types'

export class AgencyDatabase extends Dexie {
  campaigns!: Table<Campaign>
  agents!: Table<AgentSummary>
  missions!: Table<MissionSummary>
  anomalies!: Table<AnomalySummary>
  logs!: Table<MissionLogEntry>
  tracks?: Table<CustomTrackSnapshot, string>
  notes!: Table<Note>

  constructor() {
    super('agency_os')
    this.version(1).stores({
      campaigns: '&id, status, updatedAt',
      agents: '&id, status, codename',
      missions: '&id, status, code',
      anomalies: '&id, status, codename',
    })
    this.version(2).stores({
      campaigns: '&id, status, updatedAt',
      agents: '&id, status, codename',
      missions: '&id, status, code',
      anomalies: '&id, status, codename',
      logs: '&id, missionId, timestamp',
      tracks: '&id',
    })
    this.version(3).stores({
      notes: '&id, title, updatedAt',
    })
  }
}

export const db = new AgencyDatabase()
