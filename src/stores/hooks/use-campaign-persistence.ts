import { useEffect } from 'react'
import { loadAgencySnapshot, saveAgencySnapshot } from '@/services/db/repository'
import { selectAgencySnapshot, useCampaignStore } from '@/stores/campaign-store'
import { useTracksStore } from '@/stores/tracks-store'

export function useCampaignPersistence() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    let ready = false
  let unsubCampaign: (() => void) | undefined
  let unsubTracks: (() => void) | undefined
    let pendingSnapshot: ReturnType<typeof selectAgencySnapshot> | null = null
    let saving = false

    const persist = async (snapshot: ReturnType<typeof selectAgencySnapshot>) => {
      if (saving) {
        pendingSnapshot = snapshot
        return
      }
      saving = true
      try {
        await saveAgencySnapshot(snapshot)
      } catch (error) {
        console.error('[AgencyOS] 持久化失败', error)
      } finally {
        saving = false
        if (pendingSnapshot) {
          const next = pendingSnapshot
          pendingSnapshot = null
          void persist(next)
        }
      }
    }

    const bootstrap = async () => {
      try {
        const snapshot = await loadAgencySnapshot()
        if (snapshot) {
          useCampaignStore.getState().hydrate(snapshot)
        } else {
          await persist(selectAgencySnapshot(useCampaignStore.getState()))
        }
      } catch (error) {
        console.error('[AgencyOS] 初始化持久化失败', error)
      } finally {
        ready = true
      }
    }

    void bootstrap()

    // 订阅战役主 store 的变化
    unsubCampaign = useCampaignStore.subscribe((state) => {
      if (!ready) return
      void persist(selectAgencySnapshot(state))
    })

    // 订阅轨道 store 的变化：轨道变化时也触发一次快照持久化
    unsubTracks = useTracksStore.subscribe(() => {
      if (!ready) return
      const campaignState = useCampaignStore.getState()
      void persist(selectAgencySnapshot(campaignState))
    })

    return () => {
      unsubCampaign?.()
      unsubTracks?.()
    }
  }, [])
}
