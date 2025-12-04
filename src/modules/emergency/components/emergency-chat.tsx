import { useState, useRef, useEffect } from 'react'
import { useCampaignStore } from '@/stores/campaign-store'
import { useThemeStore } from '@/stores/theme-store'
import { callEmergencyLlm } from '../services/llm-service'
import { gatherContext } from '../services/context-service'
import { cn } from '@/lib/utils'
import { Send, Trash2, X } from 'lucide-react'

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

  const themeMode = useThemeStore((state) => state.mode)
  const win98TitleBarColor = useThemeStore((state) => state.win98TitleBarColor)
  const isWin98 = themeMode === 'win98'

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatHistory, isChatOpen])

  if (!isEnabled || !isChatOpen) return null

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
      "fixed left-1/2 top-1/2 z-50 w-[400px] -translate-x-1/2 -translate-y-1/2 transform flex flex-col shadow-2xl",
      isWin98 
        ? "border-2 border-b-[#404040] border-l-[#dfdfdf] border-r-[#404040] border-t-[#dfdfdf] bg-[#c0c0c0] p-[2px]" 
        : "rounded-xl border border-agency-border bg-agency-panel/95 backdrop-blur overflow-hidden"
    )}>
       {/* Window Title Bar */}
       <div className={cn(
         "flex items-center justify-between px-2 py-1 select-none",
         isWin98 
           ? "win98-title-bar mb-[2px]" 
           : "bg-agency-ink/50 border-b border-agency-border"
       )}
       style={isWin98 && win98TitleBarColor === 'red' ? { background: 'linear-gradient(90deg, #800000, #d01010)' } : undefined}
       >
          <span className={cn("text-xs font-bold", isWin98 ? "text-white" : "text-agency-cyan")}>
            Emergency Protocol
          </span>
          <div className="flex gap-1">
             <button 
               onClick={toggleEmergencyChat}
               className={cn(
                 "flex h-4 w-4 items-center justify-center",
                 isWin98 
                   ? "bg-[#c0c0c0] text-black shadow-[inset_-1px_-1px_#000000,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] active:shadow-[inset_1px_1px_#000000,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]" 
                   : "hover:text-agency-cyan"
               )}
             >
               <X className="h-3 w-3" />
             </button>
          </div>
       </div>

       {/* Chat Content */}
       <div className={cn("flex flex-col h-[400px]", isWin98 ? "bg-white border border-[#808080] shadow-[inset_1px_1px_#000000]" : "")}>
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
            
            <div className={cn("p-2 flex gap-2", isWin98 ? "bg-[#c0c0c0]" : "border-t border-agency-border bg-agency-panel")}>
               <button 
                 onClick={clearEmergencyHistory}
                 className="p-2 text-agency-muted hover:text-red-500 transition-colors"
                 title="Clear History"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
               <input
                 className={cn(
                   "flex-1 border rounded px-3 py-1 text-sm outline-none",
                   isWin98 
                     ? "bg-white border-[#808080] shadow-[inset_1px_1px_#000000] text-black" 
                     : "bg-agency-ink border-agency-border text-agency-cyan focus:border-[#0047BB]"
                 )}
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
    </div>
  )
}
