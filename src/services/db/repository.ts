import type { AgencySnapshot } from '@/lib/types'
import { db } from '@/services/db/client'

export const SNAPSHOT_VERSION = 1

export interface SnapshotEnvelope {
  version: number
  exportedAt: string
  data: AgencySnapshot
}

export async function loadAgencySnapshot(): Promise<AgencySnapshot | null> {
  const [campaign] = await db.campaigns.toArray()
  if (!campaign) {
    return null
  }

  const [agents, missions, anomalies, logs, tracks] = await Promise.all([
    db.agents.toArray(),
    db.missions.toArray(),
    db.anomalies.toArray(),
    db.logs?.toArray() ?? [],
    db.tracks?.toArray() ?? [],
  ])

  return {
    campaign,
    agents,
    missions,
    anomalies,
    logs,
    tracks,
  }
}

export async function saveAgencySnapshot(snapshot: AgencySnapshot) {
  await db.transaction('rw', [db.campaigns, db.agents, db.missions, db.anomalies, db.logs ?? 'logs', db.tracks ?? 'tracks'], async () => {
    await db.campaigns.clear()
    await db.campaigns.put(snapshot.campaign)

    await db.agents.clear()
    if (snapshot.agents.length) {
      await db.agents.bulkPut(snapshot.agents)
    }

    await db.missions.clear()
    if (snapshot.missions.length) {
      await db.missions.bulkPut(snapshot.missions)
    }

    await db.anomalies.clear()
    if (snapshot.anomalies.length) {
      await db.anomalies.bulkPut(snapshot.anomalies)
    }

    if (db.logs) {
      await db.logs.clear()
      if (snapshot.logs.length) {
        await db.logs.bulkPut(snapshot.logs)
      }
    }

    if (db.tracks) {
      await db.tracks.clear()
      if (snapshot.tracks?.length) {
        await db.tracks.bulkPut(snapshot.tracks)
      }
    }
  })
}

export const createSnapshotEnvelope = (snapshot: AgencySnapshot): SnapshotEnvelope => ({
  version: SNAPSHOT_VERSION,
  exportedAt: new Date().toISOString(),
  data: snapshot,
})

interface SnapshotLike {
  campaign?: unknown
  agents?: unknown
  missions?: unknown
  anomalies?: unknown
  logs?: unknown
  tracks?: unknown
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const normalizeSnapshot = (candidate: SnapshotLike): AgencySnapshot => {
  if (!isRecord(candidate.campaign)) {
    throw new Error('Snapshot 缺少战役数据')
  }
  if (!Array.isArray(candidate.agents) || !Array.isArray(candidate.missions) || !Array.isArray(candidate.anomalies)) {
    throw new Error('Snapshot 缺少核心列表数据')
  }
  return {
    campaign: candidate.campaign as unknown as AgencySnapshot['campaign'],
    agents: candidate.agents as unknown as AgencySnapshot['agents'],
    missions: candidate.missions as unknown as AgencySnapshot['missions'],
    anomalies: candidate.anomalies as unknown as AgencySnapshot['anomalies'],
    logs: Array.isArray(candidate.logs) ? (candidate.logs as unknown as AgencySnapshot['logs']) : [],
    tracks: Array.isArray(candidate.tracks) ? (candidate.tracks as unknown as AgencySnapshot['tracks']) : [],
  }
}

export const parseSnapshotFile = (raw: unknown): AgencySnapshot => {
  if (!isRecord(raw)) {
    throw new Error('无法解析 Snapshot 文件')
  }
  if ('data' in raw && isRecord(raw.data)) {
    return normalizeSnapshot(raw.data as SnapshotLike)
  }
  return normalizeSnapshot(raw as SnapshotLike)
}
