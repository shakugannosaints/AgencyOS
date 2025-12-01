import { useCampaignStore } from '@/stores/campaign-store'

export function gatherContext(triggerEvent: string, latestMessage: string) {
  const state = useCampaignStore.getState()
  
  // Simplified DOM
  // In a real app, we might traverse the DOM. 
  // For now, we can just provide some key elements if we know them, or a very simplified structure.
  // Traversing the whole DOM is too heavy.
  // We can select elements with `data-testid` or specific classes.
  const domContext = getSimplifiedDom()

  return {
    trigger_event: triggerEvent,
    permissions: state.emergency.permissions,
    page_context: {
      url: window.location.pathname,
      dom: domContext
    },
    data_context: {
      campaign: {
        name: state.campaign.name,
        status: state.campaign.status,
        divisionCode: state.campaign.divisionCode
      },
      mission_summary: {
        active_mission: state.missions.find(m => m.status === 'active'),
        chaos_level: state.missions.find(m => m.status === 'active')?.chaos || 0
      },
      agents_summary: {
        active_count: state.agents.filter(a => a.status === 'active').length,
        resting_count: state.agents.filter(a => a.status === 'resting').length
      }
    },
    chat_history: state.emergency.chatHistory.slice(-5).map(msg => ({
      sender: msg.sender,
      text: msg.text
    })),
    user_message: latestMessage
  }
}

function getSimplifiedDom() {
  // Find all elements with data-testid or specific classes
  const elements = document.querySelectorAll('[data-testid], .stat-card, .panel')
  const simplified = Array.from(elements).map(el => ({
    tag: el.tagName.toLowerCase(),
    attributes: {
      id: el.id,
      class: el.className,
      'data-testid': el.getAttribute('data-testid')
    },
    text: el.textContent?.substring(0, 50) // Truncate
  }))
  return simplified
}
