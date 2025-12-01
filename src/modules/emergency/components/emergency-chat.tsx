import { useState, useRef, useEffect } from 'react'
import { useCampaignStore } from '@/stores/campaign-store'
import { callEmergencyLlm } from '../services/llm-service'
import { gatherContext } from '../services/context-service'
import { cn } from '@/lib/utils'
import { Send, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'

export function EmergencyChat() {
  const { 
    isEnabled, 
    isChatOpen, 
    chatHistory, 
    llmConfig 
  } = useCampaignStore((state) => state.emergency)
  
  const {
    toggleEmergencyChat,
    addEmergencyMessage,
    addEmergencyAction,
    clearEmergencyHistory
  } = useCampaignStore((state) => state)

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatHistory, isChatOpen])

  if (!isEnabled) return null

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const userMsg = input
    setInput('')
    addEmergencyMessage({ sender: 'user', text: userMsg })
    setIsLoading(true)

    try {
      const context = gatherContext('manual', userMsg)
      const response = await callEmergencyLlm(context, llmConfig)
      
      if (response.chat_response) {
        addEmergencyMessage({ sender: 'agent', text: response.chat_response })
      }
      
      if (response.dom_actions && response.dom_actions.length > 0) {
        response.dom_actions.forEach(action => {
            addEmergencyAction(action)
        })
      }
    } catch (error) {
      console.error('[Emergency Chat Error]', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addEmergencyMessage({ sender: 'agent', text: `...Connection interrupted... [System Error: ${errorMessage}]` })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-t border-agency-border bg-agency-ink/95 backdrop-blur",
      isChatOpen ? "h-[40vh]" : "h-10"
    )}>
       {/* Header / Banner */}
       <div 
         className="flex items-center justify-between px-4 h-10 bg-[#0047BB] cursor-pointer hover:bg-[#003aa0] transition-colors"
         onClick={toggleEmergencyChat}
       >
          <span className="font-mono text-xs tracking-[0.2em] text-white animate-pulse">
            URGENCY
          </span>
          {isChatOpen ? <ChevronDown className="w-4 h-4 text-white" /> : <ChevronUp className="w-4 h-4 text-white" />}
       </div>

       {/* Chat Content */}
       {isChatOpen && (
         <div className="flex flex-col h-[calc(40vh-2.5rem)]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
               {chatHistory.map(msg => (
                 <div key={msg.id} className={cn(
                   "flex flex-col max-w-[80%]",
                   msg.sender === 'user' ? "self-end items-end" : "self-start items-start"
                 )}>
                    <div className={cn(
                      "px-3 py-2 text-sm rounded-lg",
                      msg.sender === 'user' 
                        ? "bg-agency-cyan/10 text-agency-cyan border border-agency-cyan/30" 
                        : "bg-[#0047BB]/20 text-[#0047BB] border border-[#0047BB]/50 font-mono"
                    )}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-agency-muted mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                 </div>
               ))}
               {isLoading && (
                 <div className="self-start text-xs text-[#0047BB] animate-pulse">
                   ...Thinking...
                 </div>
               )}
            </div>
            
            <div className="p-3 border-t border-agency-border bg-agency-panel flex gap-2">
               <button 
                 onClick={clearEmergencyHistory}
                 className="p-2 text-agency-muted hover:text-red-500 transition-colors"
                 title="Clear History"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
               <input
                 className="flex-1 bg-agency-ink border border-agency-border rounded px-3 py-1 text-sm text-agency-cyan focus:border-[#0047BB] outline-none"
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSend()}
                 placeholder="Speak to the anomaly..."
                 disabled={isLoading}
               />
               <button 
                 onClick={handleSend}
                 disabled={isLoading || !input.trim()}
                 className="p-2 text-[#0047BB] hover:bg-[#0047BB]/10 rounded disabled:opacity-50"
               >
                 <Send className="w-4 h-4" />
               </button>
            </div>
         </div>
       )}
    </div>
  )
}
