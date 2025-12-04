import { useState } from 'react'
import { WindowFrame } from '@/components/ui/window-frame'
import { useThemeStore } from '@/stores/theme-store'
import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface VoidScheduleProps {
  isOpen: boolean
  onClose: () => void
}

export function VoidSchedule({ isOpen, onClose }: VoidScheduleProps) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const isWin98 = useThemeStore((state) => state.mode === 'win98')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsProcessing(true)
    setMessage(t('desktop.schedule.optimizing'))
    
    setTimeout(() => {
      setInput('')
      setIsProcessing(false)
      setMessage(t('desktop.schedule.archived'))
      
      setTimeout(() => setMessage(''), 3000)
    }, 1500)
  }

  return (
    <WindowFrame
      title={t('desktop.schedule.title')}
      isOpen={isOpen}
      onClose={onClose}
      initialSize={{ width: 300, height: 200 }}
    >
      <div className={cn(
        "flex h-full flex-col p-4 gap-4",
        isWin98 ? "bg-[#dfdfdf] text-black" : "bg-agency-ink/80 text-agency-cyan"
      )}>
        <div className="text-xs opacity-70">
          {t('desktop.schedule.description')}
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 flex-1">
          <input
            className={cn(
              "flex-1 p-2 text-sm outline-none border",
              isWin98 
                ? "border-[#808080] shadow-[inset_1px_1px_#000000] bg-white" 
                : "border-agency-border bg-agency-ink/50 rounded"
            )}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('desktop.schedule.placeholder')}
            disabled={isProcessing}
          />
          
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase transition-all",
              isWin98
                ? "border-2 border-b-[#404040] border-l-[#ffffff] border-r-[#404040] border-t-[#ffffff] bg-[#c0c0c0] active:border-b-[#ffffff] active:border-l-[#404040] active:border-r-[#ffffff] active:border-t-[#404040]"
                : "border border-agency-cyan text-agency-cyan hover:bg-agency-cyan/10 rounded"
            )}
          >
            <Trash2 className="h-3 w-3" />
            {isProcessing ? t('desktop.schedule.processing') : t('desktop.schedule.submit')}
          </button>
        </form>

        {message && (
          <div className="text-xs text-center font-mono animate-pulse text-red-500">
            {message}
          </div>
        )}
      </div>
    </WindowFrame>
  )
}
