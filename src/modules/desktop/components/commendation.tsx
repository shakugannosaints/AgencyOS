import { useState } from 'react'
import { WindowFrame } from '@/components/ui/window-frame'
import { useThemeStore } from '@/stores/theme-store'
import { cn } from '@/lib/utils'
import { Award } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface CommendationClickerProps {
  isOpen: boolean
  onClose: () => void
}

export function CommendationClicker({ isOpen, onClose }: CommendationClickerProps) {
  const { t } = useTranslation()
  const [count, setCount] = useState(0)
  const [feedback, setFeedback] = useState('')
  const isWin98 = useThemeStore((state) => state.mode === 'win98')

  const handleClick = () => {
    setCount(c => c + 1)
    
    const randomIndex = Math.floor(Math.random() * 10)
    setFeedback(t(`desktop.commendation.feedbacks.${randomIndex}`))
  }

  return (
    <WindowFrame
      title={t('desktop.commendation.title')}
      isOpen={isOpen}
      onClose={onClose}
      initialSize={{ width: 350, height: 250 }}
    >
      <div className={cn(
        "flex h-full flex-col items-center justify-center p-6 gap-6 text-center",
        isWin98 ? "bg-[#dfdfdf] text-black" : "bg-agency-ink/80 text-agency-cyan"
      )}>
        <div className="flex flex-col items-center gap-2">
          <Award className="h-12 w-12 opacity-50" />
          <div className="text-sm font-bold">{t('desktop.commendation.count')}{count}</div>
        </div>

        <button
          onClick={handleClick}
          className={cn(
            "w-full py-3 px-6 text-sm font-bold uppercase transition-all active:scale-95",
            isWin98
              ? "border-2 border-b-[#404040] border-l-[#ffffff] border-r-[#404040] border-t-[#ffffff] bg-[#c0c0c0] active:border-b-[#ffffff] active:border-l-[#404040] active:border-r-[#ffffff] active:border-t-[#404040]"
              : "border border-agency-cyan bg-agency-cyan/10 text-agency-cyan hover:bg-agency-cyan/20 rounded-lg shadow-[0_0_10px_rgba(7,240,255,0.2)]"
          )}
        >
          {t('desktop.commendation.submit')}
        </button>

        <div className="h-8 text-xs font-mono text-agency-muted">
          {feedback}
        </div>
      </div>
    </WindowFrame>
  )
}
