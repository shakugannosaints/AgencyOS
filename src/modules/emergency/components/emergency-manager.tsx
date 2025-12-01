import { useEffect, useRef } from 'react'
import { useCampaignStore } from '@/stores/campaign-store'
import { callEmergencyLlm } from '../services/llm-service'
import { gatherContext } from '../services/context-service'

export function EmergencyManager() {
  const isEnabled = useCampaignStore((state) => state.emergency.isEnabled)
  const pollingInterval = useCampaignStore((state) => state.emergency.pollingInterval)
  const llmConfig = useCampaignStore((state) => state.emergency.llmConfig)
  const addEmergencyAction = useCampaignStore((state) => state.addEmergencyAction)
  const addEmergencyMessage = useCampaignStore((state) => state.addEmergencyMessage)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isProcessingRef = useRef(false)

  useEffect(() => {
    if (!isEnabled || !pollingInterval || pollingInterval <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const runPolling = async () => {
      if (isProcessingRef.current) return
      isProcessingRef.current = true

      try {
        // Gather context with 'polling' trigger
        const context = gatherContext('polling', '')
        
        // Call LLM
        const response = await callEmergencyLlm(context, llmConfig)
        
        // Handle response
        if (response.chat_response) {
          addEmergencyMessage({ sender: 'agent', text: response.chat_response })
        }
        
        if (response.dom_actions && response.dom_actions.length > 0) {
          response.dom_actions.forEach(action => {
              addEmergencyAction(action)
          })
        }
      } catch (error) {
        console.error('[Emergency Polling Error]', error)
      } finally {
        isProcessingRef.current = false
      }
    }

    intervalRef.current = setInterval(runPolling, pollingInterval * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isEnabled, pollingInterval, llmConfig, addEmergencyAction, addEmergencyMessage])

  return null
}
