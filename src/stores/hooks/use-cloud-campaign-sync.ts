import { useEffect } from 'react'
import {
  CloudConflictError,
  createCloudCampaign,
  loadLatestCloudCampaign,
  updateCloudCampaign,
} from '@/services/cloud/campaign-repository'
import {
  loadAgencySnapshot,
  saveAgencySnapshot,
} from '@/services/db/repository'
import {
  selectAgencySnapshot,
  useCampaignStore,
} from '@/stores/campaign-store'
import { useTracksStore } from '@/stores/tracks-store'
import { useAuthStore } from '@/stores/auth-store'
import type { AgencySnapshot } from '@/lib/types'
import { supabase } from '@/services/supabase/client'

const CLOUD_SAVE_DELAY = 1200
interface RealtimeCampaignRow {
  id: string
  snapshot: AgencySnapshot
  revision: number
  updated_at: string
}

export function useCloudCampaignSync() {
  const userId = useAuthStore((state) => state.user?.id)

  useEffect(() => {
    if (!userId) {
      return
    }

    let cancelled = false
    let ready = false
    let applyingCloudSnapshot = false
    let saving = false

    let cloudCampaignId: string | null = null
    let cloudRevision = 0
    let saveTimer: number | undefined
    let pendingSnapshot: AgencySnapshot | null = null

    let unsubscribeCampaign: (() => void) | undefined
    let unsubscribeTracks: (() => void) | undefined
    let realtimeChannel:
    | ReturnType<typeof supabase.channel>
    | null = null

    const applyCloudSnapshot = async (
      snapshot: AgencySnapshot,
    ) => {
      applyingCloudSnapshot = true

      try {
        useCampaignStore.getState().hydrate(snapshot)
        await saveAgencySnapshot(snapshot)
      } finally {
        applyingCloudSnapshot = false
      }
    }

    const persistCloudSnapshot = async (
      snapshot: AgencySnapshot,
    ) => {
      if (
        cancelled ||
        !ready ||
        !cloudCampaignId
      ) {
        return
      }

      if (saving) {
        pendingSnapshot = snapshot
        return
      }

      saving = true

      try {
        const updated = await updateCloudCampaign(
          cloudCampaignId,
          snapshot,
          cloudRevision,
        )

        cloudRevision = updated.revision
      } catch (error) {
        if (error instanceof CloudConflictError) {
          console.warn(
            '[AgencyOS] 检测到云端版本冲突，正在加载最新版本',
          )

          pendingSnapshot = null

          const latest = await loadLatestCloudCampaign()

          if (
            latest &&
            latest.id === cloudCampaignId &&
            !cancelled
          ) {
            cloudRevision = latest.revision
            await applyCloudSnapshot(latest.snapshot)
          }
        } else {
          console.error('[AgencyOS] 云端保存失败', error)
        }
      } finally {
        saving = false

        if (pendingSnapshot && !cancelled) {
          const nextSnapshot = pendingSnapshot
          pendingSnapshot = null
          void persistCloudSnapshot(nextSnapshot)
        }
      }
    }

    const scheduleCloudSave = (
      snapshot: AgencySnapshot,
    ) => {
      if (
        !ready ||
        applyingCloudSnapshot ||
        cancelled
      ) {
        return
      }

      pendingSnapshot = snapshot

      if (saveTimer !== undefined) {
        window.clearTimeout(saveTimer)
      }

      saveTimer = window.setTimeout(() => {
        saveTimer = undefined

        const nextSnapshot = pendingSnapshot
        pendingSnapshot = null

        if (nextSnapshot) {
          void persistCloudSnapshot(nextSnapshot)
        }
      }, CLOUD_SAVE_DELAY)
    }

    const handleRealtimeUpdate = async (
      row: RealtimeCampaignRow,
    ) => {
      if (
        cancelled ||
        !ready ||
        !cloudCampaignId ||
        row.id !== cloudCampaignId ||
        row.revision <= cloudRevision
      ) {
        return
      }
    
      // 如果远程设备已提交更新，取消当前尚未上传的旧快照。
      if (saveTimer !== undefined) {
        window.clearTimeout(saveTimer)
        saveTimer = undefined
      }
    
      pendingSnapshot = null
      cloudRevision = row.revision
    
      try {
        await applyCloudSnapshot(row.snapshot)
      
        console.info(
          '[AgencyOS] 已接收云端实时更新',
          {
            campaignId: row.id,
            revision: row.revision,
          },
        )
      } catch (error) {
        console.error(
          '[AgencyOS] 应用实时更新失败',
          error,
        )
      }
    }

    const bootstrap = async () => {
      try {
        const localSnapshot =
          (await loadAgencySnapshot()) ??
          selectAgencySnapshot(
            useCampaignStore.getState(),
          )

        if (cancelled) {
          return
        }

        let cloudCampaign =
          await loadLatestCloudCampaign()

        if (cancelled) {
          return
        }

        if (cloudCampaign) {
          cloudCampaignId = cloudCampaign.id
          cloudRevision = cloudCampaign.revision

          await applyCloudSnapshot(
            cloudCampaign.snapshot,
          )
        } else {
          cloudCampaign =
            await createCloudCampaign(localSnapshot)

          if (cancelled) {
            return
          }

          cloudCampaignId = cloudCampaign.id
          cloudRevision = cloudCampaign.revision
        }

        ready = true

        unsubscribeCampaign =
          useCampaignStore.subscribe((state) => {
            scheduleCloudSave(
              selectAgencySnapshot(state),
            )
          })

        unsubscribeTracks =
          useTracksStore.subscribe(() => {
            scheduleCloudSave(
              selectAgencySnapshot(
                useCampaignStore.getState(),
              ),
            )
          })

          realtimeChannel = supabase
            .channel(`campaign:${cloudCampaignId}`)
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'campaigns',
                filter: `id=eq.${cloudCampaignId}`,
              },
              (payload) => {
                void handleRealtimeUpdate(
                  payload.new as RealtimeCampaignRow,
                )
              },
            )
            .subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                console.info(
                  '[AgencyOS] Realtime 已连接',
                  {
                    campaignId: cloudCampaignId,
                  },
                )
              }
            
              if (
                status === 'CHANNEL_ERROR' ||
                status === 'TIMED_OUT'
              ) {
                console.error(
                  '[AgencyOS] Realtime 连接异常',
                  status,
                )
              }
            })

        console.info(
          '[AgencyOS] 云端战役同步已启动',
          {
            campaignId: cloudCampaignId,
            revision: cloudRevision,
          },
        )
      } catch (error) {
        console.error(
          '[AgencyOS] 云端同步初始化失败',
          error,
        )
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
      ready = false

      if (saveTimer !== undefined) {
        window.clearTimeout(saveTimer)
      }

      unsubscribeCampaign?.()
      unsubscribeTracks?.()

      if (realtimeChannel) {
        void supabase.removeChannel(realtimeChannel)
      }
    }
  }, [userId])
}