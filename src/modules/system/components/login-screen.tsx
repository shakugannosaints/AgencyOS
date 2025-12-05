import { useState, useEffect } from 'react'
import { useThemeStore } from '@/stores/theme-store'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { KeyRound, User } from 'lucide-react'

interface LoginScreenProps {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { t } = useTranslation()
  const isWin98 = useThemeStore((state) => state.mode === 'win98')
  
  // Phases: 'logging-off' -> 'login-form' -> 'logging-in'
  const [phase, setPhase] = useState<'logging-off' | 'login-form' | 'logging-in'>('logging-off')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    // Simulate logging off delay
    const timer = setTimeout(() => {
      setPhase('login-form')
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPhase('logging-in')
    
    // Simulate logging in delay
    setTimeout(() => {
      onLogin()
    }, 2000)
  }

  if (phase === 'logging-off') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <svg viewBox="0 0 24 24" className="h-16 w-16 text-red-600 animate-pulse" fill="currentColor">
            <path d="M12 2L22 22H2L12 2Z" />
          </svg>
          <div className="font-mono text-lg animate-pulse">{t('desktop.login.loggingOff')}</div>
        </div>
      </div>
    )
  }

  if (phase === 'logging-in') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <svg viewBox="0 0 24 24" className="h-16 w-16 text-red-600 animate-pulse" fill="currentColor">
            <path d="M12 2L22 22H2L12 2Z" />
          </svg>
          <div className="font-mono text-lg animate-pulse">{t('desktop.login.loggingIn')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex items-center justify-center",
      isWin98 ? "bg-[#008080]" : "bg-agency-ink"
    )}>
      <div className={cn(
        "w-[400px] p-1",
        isWin98 
          ? "win98-raised bg-[#c0c0c0] shadow-xl" 
          : "bg-agency-panel border border-agency-cyan/30 rounded-xl shadow-2xl backdrop-blur-md"
      )}>
        {/* Title Bar */}
        <div className={cn(
          "flex items-center justify-between px-2 py-1 mb-4",
          isWin98 
            ? "bg-gradient-to-r from-[#000080] to-[#1084d0] text-white" 
            : "border-b border-agency-cyan/20 text-agency-cyan"
        )}>
          <span className="font-bold text-sm">{t('desktop.login.title')}</span>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              "h-16 w-16 flex items-center justify-center rounded-full",
              isWin98 ? "bg-white border-2 border-inset border-[#808080]" : "bg-agency-cyan/10 text-agency-cyan"
            )}>
              <KeyRound className="h-8 w-8" />
            </div>
            <div className={cn("text-sm", isWin98 ? "text-black" : "text-agency-muted")}>
              {t('desktop.login.title')}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-1">
              <label className={cn("text-xs font-bold", isWin98 ? "text-black" : "text-agency-cyan")}>
                {t('desktop.login.username')}
              </label>
              <div className="flex items-center gap-2">
                <User className={cn("h-4 w-4", isWin98 ? "text-black" : "text-agency-muted")} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={cn(
                    "flex-1 px-2 py-1 text-sm outline-none",
                    isWin98 
                      ? "border-2 border-t-[#404040] border-l-[#404040] border-r-[#ffffff] border-b-[#ffffff] bg-white text-black" 
                      : "bg-agency-ink/50 border border-agency-border rounded text-agency-cyan focus:border-agency-cyan"
                  )}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={cn("text-xs font-bold", isWin98 ? "text-black" : "text-agency-cyan")}>
                {t('desktop.login.password')}
              </label>
              <div className="flex items-center gap-2">
                <KeyRound className={cn("h-4 w-4", isWin98 ? "text-black" : "text-agency-muted")} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "flex-1 px-2 py-1 text-sm outline-none",
                    isWin98 
                      ? "border-2 border-t-[#404040] border-l-[#404040] border-r-[#ffffff] border-b-[#ffffff] bg-white text-black" 
                      : "bg-agency-ink/50 border border-agency-border rounded text-agency-cyan focus:border-agency-cyan"
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className={cn(
                  "px-6 py-1 text-sm font-bold uppercase transition-all",
                  isWin98
                    ? "border-2 border-b-[#404040] border-l-[#ffffff] border-r-[#404040] border-t-[#ffffff] bg-[#c0c0c0] active:border-b-[#ffffff] active:border-l-[#404040] active:border-r-[#ffffff] active:border-t-[#404040] text-black"
                    : "border border-agency-cyan bg-agency-cyan/10 text-agency-cyan hover:bg-agency-cyan/20 rounded"
                )}
              >
                {t('desktop.login.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
