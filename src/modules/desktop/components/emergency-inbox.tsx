import { useState } from 'react'
import { WindowFrame } from '@/components/ui/window-frame'
import { useThemeStore } from '@/stores/theme-store'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { Mail, AlertTriangle, FileWarning } from 'lucide-react'

interface EmergencyInboxProps {
  isOpen: boolean
  onClose: () => void
}

export function EmergencyInbox({ isOpen, onClose }: EmergencyInboxProps) {
  const { t } = useTranslation()
  const isWin98 = useThemeStore((state) => state.mode === 'win98')
  const [selectedMail, setSelectedMail] = useState<number | null>(null)

  const mails = [
    { id: 1, icon: AlertTriangle, subject: 'desktop.emergency.mail1.subject', from: 'CENTRAL_COMMAND', date: 'xxxx-05-12' },
    { id: 2, icon: Mail, subject: 'desktop.emergency.mail2.subject', from: 'HR_DEPT', date: 'xxxx-05-13' },
    { id: 3, icon: FileWarning, subject: 'desktop.emergency.mail3.subject', from: 'UNKNOWN', date: '????-??-??' },
  ]

  return (
    <WindowFrame
      title={t('desktop.emergency.title')}
      isOpen={isOpen}
      onClose={onClose}
      initialSize={{ width: 600, height: 400 }}
    >
      <div className={cn(
        "flex h-full",
        isWin98 ? "bg-[#dfdfdf] text-black" : "bg-agency-ink/80 text-agency-cyan"
      )}>
        {/* Mail List */}
        <div className={cn(
          "w-1/3 border-r flex flex-col",
          isWin98 ? "border-[#808080]" : "border-agency-border"
        )}>
          {mails.map((mail) => (
            <button
              key={mail.id}
              onClick={() => setSelectedMail(mail.id)}
              className={cn(
                "flex flex-col gap-1 p-2 text-left text-xs border-b transition-colors",
                isWin98 
                  ? "border-[#808080] hover:bg-[#000080] hover:text-white" 
                  : "border-agency-border hover:bg-agency-cyan/10",
                selectedMail === mail.id && (isWin98 ? "bg-[#000080] text-white" : "bg-agency-cyan/20")
              )}
            >
              <div className="flex items-center gap-2 font-bold truncate">
                <mail.icon className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{t(mail.subject)}</span>
              </div>
              <div className="flex justify-between opacity-70 text-[10px]">
                <span>{mail.from}</span>
                <span>{mail.date}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Mail Content */}
        <div className="flex-1 p-4 overflow-auto">
          {selectedMail ? (
            <div className="flex flex-col gap-4">
              <div className="border-b pb-2 mb-2 border-dashed border-opacity-50">
                <h3 className="font-bold text-sm">{t(`desktop.emergency.mail${selectedMail}.subject`)}</h3>
                <div className="text-xs opacity-70 mt-1">
                  From: {mails.find(m => m.id === selectedMail)?.from}
                </div>
              </div>
              <div className="text-sm font-mono whitespace-pre-wrap leading-relaxed">
                {t(`desktop.emergency.mail${selectedMail}.body`)}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs opacity-50">
              {t('desktop.emergency.noSelection')}
            </div>
          )}
        </div>
      </div>
    </WindowFrame>
  )
}
