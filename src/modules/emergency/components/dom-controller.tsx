import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCampaignStore } from '@/stores/campaign-store'
import { executeDomAction, revertDomAction, captureState } from '../utils/dom-utils'
import type { EmergencyAction } from '@/lib/types'

export function DomController() {
  const navigate = useNavigate()
  const actionHistory = useCampaignStore((state) => state.emergency.actionHistory)
  const isEnabled = useCampaignStore((state) => state.emergency.isEnabled)
  const updateEmergencyAction = useCampaignStore((state) => state.updateEmergencyAction)
  const updateMission = useCampaignStore((state) => state.updateMission)
  const missions = useCampaignStore((state) => state.missions)
  
  const executedIds = useRef<Set<string>>(new Set())
  const localHistoryRef = useRef<EmergencyAction[]>([])

  useEffect(() => {
    if (!isEnabled) return

    const currentIds = new Set(actionHistory.map(a => a.id))
    
    // Detect new actions
    for (const action of actionHistory) {
      if (!executedIds.current.has(action.id)) {
        // New action
        
        // 1. Capture state if not present
        if (!action.originalState) {
            const originalState = captureState(action)
            if (originalState) {
                setTimeout(() => {
                    updateEmergencyAction(action.id, { originalState })
                }, 0)
            }
        }
        
        // 2. Execute
        if (action.type === 'navigate') {
           navigate(action.payload.path)
        } else if (action.type === 'updateData') {
           const { path, value } = action.payload
           if (path === 'mission_summary.active_mission.chaos') {
              const activeMission = missions.find(m => m.status === 'active')
              if (activeMission) {
                 const { id, ...rest } = activeMission
                 updateMission(id, { ...rest, chaos: Number(value) })
              }
           } else if (path === 'mission_summary.active_mission.looseEnds') {
              const activeMission = missions.find(m => m.status === 'active')
              if (activeMission) {
                 const { id, ...rest } = activeMission
                 updateMission(id, { ...rest, looseEnds: Number(value) })
              }
           }
        } else {
           const addedId = executeDomAction(action)
           if (addedId && !action.originalState) {
               setTimeout(() => {
                   updateEmergencyAction(action.id, { originalState: { addedElementId: addedId } })
               }, 0)
           }
        }
        
        executedIds.current.add(action.id)
      }
    }
    
    // Detect undone actions
    const removedIds = [...executedIds.current].filter(id => !currentIds.has(id))
    
    if (removedIds.length > 0) {
        for (const id of removedIds) {
            const action = localHistoryRef.current.find(a => a.id === id)
            if (action) {
                revertDomAction(action)
            }
            executedIds.current.delete(id)
        }
    }
    
    localHistoryRef.current = [...actionHistory]
    
  }, [actionHistory, isEnabled, updateEmergencyAction, navigate, updateMission, missions])

  return null
}
