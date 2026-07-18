import type { AgencySnapshot } from '@/lib/types'
import { supabase } from '@/services/supabase/client'

export interface CloudCampaign {
  id: string
  ownerId: string
  name: string
  snapshot: AgencySnapshot
  revision: number
  createdAt: string
  updatedAt: string
}

interface CampaignRow {
  id: string
  owner_id: string
  name: string
  snapshot: AgencySnapshot
  revision: number
  created_at: string
  updated_at: string
}

export class CloudConflictError extends Error {
  constructor() {
    super('云端数据已被其他设备修改，请先同步最新版本')
    this.name = 'CloudConflictError'
  }
}

function toCloudCampaign(row: CampaignRow): CloudCampaign {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    snapshot: row.snapshot,
    revision: row.revision,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * 上传前移除不应进入云端数据库的本地密钥。
 */
function sanitizeSnapshot(
  snapshot: AgencySnapshot,
): AgencySnapshot {
  if (!snapshot.emergency) {
    return snapshot
  }

  const { apiKey: _apiKey, ...safeLlmConfig } =
    snapshot.emergency.llmConfig

  return {
    ...snapshot,
    emergency: {
      ...snapshot.emergency,
      llmConfig: safeLlmConfig,
    },
  }
}

/**
 * 读取当前用户最近更新的一个战役。
 * 第一阶段暂时按“一个账户一个主要战役”处理。
 */
export async function loadLatestCloudCampaign():
Promise<CloudCampaign | null> {
  const { data, error } = await supabase
    .from('campaigns')
    .select(
      'id, owner_id, name, snapshot, revision, created_at, updated_at',
    )
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  return toCloudCampaign(data as CampaignRow)
}

/**
 * 将当前本地快照作为新的云端战役创建。
 */
export async function createCloudCampaign(
  snapshot: AgencySnapshot,
): Promise<CloudCampaign> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    throw new Error('用户尚未登录')
  }

  const safeSnapshot = sanitizeSnapshot(snapshot)

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      owner_id: user.id,
      name: safeSnapshot.campaign.name,
      snapshot: safeSnapshot,
    })
    .select(
      'id, owner_id, name, snapshot, revision, created_at, updated_at',
    )
    .single()

  if (error) {
    throw error
  }

  return toCloudCampaign(data as CampaignRow)
}

/**
 * 保存战役，并使用 revision 防止静默覆盖其他设备的修改。
 */
export async function updateCloudCampaign(
  campaignId: string,
  snapshot: AgencySnapshot,
  expectedRevision: number,
): Promise<CloudCampaign> {
  const safeSnapshot = sanitizeSnapshot(snapshot)

  const { data, error } = await supabase
    .from('campaigns')
    .update({
      name: safeSnapshot.campaign.name,
      snapshot: safeSnapshot,
      revision: expectedRevision + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', campaignId)
    .eq('revision', expectedRevision)
    .select(
      'id, owner_id, name, snapshot, revision, created_at, updated_at',
    )
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    throw new CloudConflictError()
  }

  return toCloudCampaign(data as CampaignRow)
}