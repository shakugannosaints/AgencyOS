import { useState } from 'react'
import { WindowFrame } from '@/components/ui/window-frame'
import { useThemeStore } from '@/stores/theme-store'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface DesktopNotepadProps {
  isOpen: boolean
  onClose: () => void
}

export function DesktopNotepad({ isOpen, onClose }: DesktopNotepadProps) {
  const { t } = useTranslation()
  const [content, setContent] = useState<string>(() => {
    try {
      if (typeof window === 'undefined') return ''
      return localStorage.getItem('agency-notepad-content') ?? ''
    } catch {
      return ''
    }
  })
  const isWin98 = useThemeStore((state) => state.mode === 'win98')

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    localStorage.setItem('agency-notepad-content', newContent)
  }

  return (
    <WindowFrame
      title={t('desktop.notepad.title')}
      isOpen={isOpen}
      onClose={onClose}
      initialSize={{ width: 500, height: 400 }}
    >
      <textarea
        className={cn(
          "h-full w-full resize-none p-2 text-sm outline-none font-mono",
          isWin98 ? "bg-white text-black" : "bg-agency-ink text-agency-cyan"
        )}
        value={content}
        onChange={handleChange}
        placeholder={t('desktop.notepad.placeholder')}
        spellCheck={false}
      />
    </WindowFrame>
  )
}
