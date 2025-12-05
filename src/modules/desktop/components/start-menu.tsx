import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/theme-store'
import { useTranslation } from 'react-i18next'
import { 
  Book, Eye, Mail, CheckSquare, Tornado, Trash2, 
  Power, Settings
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface StartMenuProps {
  isOpen: boolean
  onClose: () => void
  onOpenProgram: (id: string) => void
}

export function StartMenu({ isOpen, onClose, onOpenProgram }: StartMenuProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const themeMode = useThemeStore((state) => state.mode)
  const win98TitleBarColor = useThemeStore((state) => state.win98TitleBarColor)
  const isWin98 = themeMode === 'win98'
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Check if the click target is the start button (we'll handle this by checking a specific class or id if needed, 
        // but usually the parent handles the toggle. If we close it here, the parent's toggle might re-open it.
        // A simple way is to check if the click is NOT on the start button.
        // For now, we'll rely on the parent to handle the button click, and we handle clicks elsewhere.
        // Actually, if we click the start button while open, this fires first (closing it), then the button click fires (opening it again).
        // We can prevent this by using a backdrop or checking the event target.
        const target = event.target as HTMLElement
        if (target.closest('[data-start-button]')) return
        
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const items = [
    { id: 'manual', icon: Book, label: 'desktop.icons.manual', action: () => onOpenProgram('manual') },
    { id: 'emergency', icon: Mail, label: 'desktop.icons.emergency', action: () => onOpenProgram('emergency') },
    { id: 'chaos', icon: Tornado, label: 'desktop.icons.chaos', action: () => onOpenProgram('chaos') },
    { id: 'commendation', icon: CheckSquare, label: 'desktop.icons.commendation', action: () => onOpenProgram('commendation') },
    { id: 'schedule', icon: Trash2, label: 'desktop.icons.schedule', action: () => onOpenProgram('schedule') },
    { type: 'separator' },
    { id: 'antivirus', icon: Eye, label: 'desktop.icons.antivirus', action: () => onOpenProgram('antivirus') },
    { id: 'settings', icon: Settings, label: 'app.nav.settings', action: () => { navigate('/settings'); onClose(); } },
    { type: 'separator' },
    { id: 'logoff', icon: Power, label: 'desktop.startMenu.logoff', action: () => onOpenProgram('logoff') },
  ]

  return (
    <div 
      ref={menuRef}
      className={cn(
        "absolute bottom-12 left-2 w-64 flex z-[60]",
        isWin98 
          ? "win98-raised bg-[#c0c0c0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#404040] border-b-[#404040] shadow-[2px_2px_5px_rgba(0,0,0,0.5)]" 
          : "bg-agency-panel border border-agency-cyan/30 backdrop-blur-md rounded-lg overflow-hidden shadow-panel"
      )}
    >
      {/* Side Strip */}
      <div 
        className={cn(
          "w-8 flex items-end justify-center pb-2 relative overflow-hidden",
          isWin98 
            ? "win98-title-bar text-white" 
            : "bg-agency-cyan/10 text-agency-cyan"
        )}
        style={isWin98 && win98TitleBarColor === 'red' ? { background: 'linear-gradient(180deg, #800000, #d01010)' } : undefined}
      >
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 -rotate-90 whitespace-nowrap font-bold text-lg tracking-widest origin-bottom-left">
          {t('desktop.startMenu.agencyOS')}
        </span>
      </div>

      {/* Items */}
      <div className="flex-1 py-1">
        {items.map((item, index) => {
          if (item.type === 'separator') {
            return <div key={index} className={cn("my-1 border-t mx-2", isWin98 ? "border-[#808080] border-b-[#ffffff]" : "border-agency-cyan/20")} />
          }
          
          const Icon = item.icon as React.ElementType
          return (
            <button
              key={item.id || index}
              onClick={() => {
                item.action?.()
                onClose()
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2 text-sm group transition-colors",
                isWin98 
                  ? "text-black hover:bg-[#000080] hover:text-white" 
                  : "text-agency-cyan hover:bg-agency-cyan/20"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="truncate">{t(item.label!)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
