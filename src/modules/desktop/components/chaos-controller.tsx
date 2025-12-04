import { useState, useEffect } from 'react'
import { WindowFrame } from '@/components/ui/window-frame'
import { useThemeStore } from '@/stores/theme-store'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { Activity, Zap } from 'lucide-react'

interface ChaosControllerProps {
  isOpen: boolean
  onClose: () => void
}

export function ChaosController({ isOpen, onClose }: ChaosControllerProps) {
  const { t } = useTranslation()
  const isWin98 = useThemeStore((state) => state.mode === 'win98')
  const [stability, setStability] = useState(85)
  const [isStabilizing, setIsStabilizing] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => {
      setStability(prev => {
        const change = (Math.random() - 0.5) * 5
        return Math.min(100, Math.max(0, prev + change))
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isOpen])

  const handleStabilize = () => {
    setIsStabilizing(true)
    setTimeout(() => {
      setStability(100)
      setIsStabilizing(false)
    }, 2000)
  }

  return (
    <WindowFrame
      title={t('desktop.chaos.title')}
      isOpen={isOpen}
      onClose={onClose}
      initialSize={{ width: 400, height: 300 }}
    >
      <div className={cn(
        "flex h-full flex-col p-4 gap-4",
        isWin98 ? "bg-[#dfdfdf] text-black" : "bg-agency-ink/80 text-agency-cyan"
      )}>
        <div className={cn(
          "flex items-center justify-between p-2 border",
          isWin98 ? "border-[#808080] bg-white" : "border-agency-cyan/30 bg-agency-ink/50"
        )}>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 animate-pulse" />
            <span className="text-xs font-bold uppercase">{t('desktop.chaos.status')}</span>
          </div>
          <span className={cn(
            "font-mono text-sm font-bold",
            stability < 50 ? "text-red-500" : "text-green-500"
          )}>
            {stability.toFixed(2)}%
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-6">
            {/* Visualizers */}
            <div className="flex justify-around">
                <div className="flex flex-col items-center gap-2">
                    <div className={cn("h-16 w-4 rounded-full overflow-hidden relative", isWin98 ? "bg-gray-300" : "bg-agency-ink")}>
                        <div 
                            className={cn("absolute bottom-0 w-full transition-all duration-300", isWin98 ? "bg-red-600" : "bg-agency-cyan")}
                            style={{ height: `${stability}%` }}
                        />
                    </div>
                    <span className="text-[10px] uppercase">Agency</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className={cn("h-16 w-4 rounded-full overflow-hidden relative", isWin98 ? "bg-gray-300" : "bg-agency-ink")}>
                        <div 
                            className={cn("absolute bottom-0 w-full transition-all duration-300", isWin98 ? "bg-blue-600" : "bg-agency-magenta")}
                            style={{ height: `${Math.max(0, 100 - stability)}%` }}
                        />
                    </div>
                    <span className="text-[10px] uppercase">Urgency</span>
                </div>
            </div>
        </div>

        <button
          onClick={handleStabilize}
          disabled={isStabilizing}
          className={cn(
            "w-full py-2 px-4 text-xs font-bold uppercase transition-all flex items-center justify-center gap-2",
            isWin98
              ? "border-2 border-b-[#404040] border-l-[#ffffff] border-r-[#404040] border-t-[#ffffff] bg-[#c0c0c0] active:border-b-[#ffffff] active:border-l-[#404040] active:border-r-[#ffffff] active:border-t-[#404040]"
              : "border border-agency-cyan bg-agency-cyan/10 text-agency-cyan hover:bg-agency-cyan/20"
          )}
        >
          <Zap className={cn("h-3 w-3", isStabilizing && "animate-spin")} />
          {isStabilizing ? t('desktop.chaos.stabilizing') : t('desktop.chaos.stabilize')}
        </button>
      </div>
    </WindowFrame>
  )
}
