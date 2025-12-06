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
  const win98TitleBarColor = useThemeStore((state) => state.win98TitleBarColor)
  
  // Phases: 'logging-off' -> 'login-form' -> 'logging-in'
  const [phase, setPhase] = useState<'logging-off' | 'login-form' | 'logging-in'>('logging-off')
  // Whether login form should be visible (hidden during first part of logging-off animation)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // animation timing constants (ms) - increased to slow animations down
  const TRIANGLE_EXPAND_DURATION = 800 // duration for triangle expand / contract
  const TRIANGLE_MASK_DURATION = 800 // duration for the reveal/shrink mask
  const TRIANGLE_FADE_DURATION = 200 // duration for triangle fade animations

  useEffect(() => {
    // Show login form after first part of logging-off animation (TRIANGLE_MASK_DURATION)
    const showFormTimer = setTimeout(() => {
      setShowLoginForm(true)
    }, TRIANGLE_MASK_DURATION)
    
    // Complete logging-off phase after full animation (TRIANGLE_MASK_DURATION + TRIANGLE_EXPAND_DURATION)
    const phaseTimer = setTimeout(() => {
      setPhase('login-form')
    }, TRIANGLE_MASK_DURATION + TRIANGLE_EXPAND_DURATION)
    return () => {
      clearTimeout(showFormTimer)
      clearTimeout(phaseTimer)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPhase('logging-in')
    
    // Call onLogin after the red triangle fully covers the screen (TRIANGLE_EXPAND_DURATION)
    // Parent will then run the reveal mask after a short delay to allow painting
    setTimeout(() => {
      onLogin()
    }, TRIANGLE_EXPAND_DURATION)
  }

  return (
    <>
      {showLoginForm && (
        <div className={cn(
          "fixed inset-0 z-[100] flex items-center justify-center",
          isWin98 ? "bg-agency-ink/95 text-white" : "bg-agency-ink"
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
              ? "win98-title-bar mb-4" 
              : "border-b border-agency-cyan/20 text-agency-cyan"
          )}
          style={isWin98 && win98TitleBarColor === 'red' ? { background: 'linear-gradient(90deg, #800000, #d01010)' } : undefined}
          >
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
              <div className={cn("text-sm", isWin98 ? "text-white" : "text-agency-muted")}>
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
      )}

      {phase === 'logging-in' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
          <style>{`
            @keyframes triangle-scale-in {
              0% { transform: scale(0.001); }
              100% { transform: scale(1); }
            }
            @keyframes triangle-fade-in {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
          `}</style>
          {/* Red Triangle Layer - only the expanding part, reveal animation handled by parent */}
          <svg 
            className="absolute"
            style={{ 
              overflow: 'visible',
              width: '300vmax',
              height: '300vmax',
              left: '50%',
              top: '50%',
              marginLeft: '-150vmax',
              marginTop: '-150vmax'
            }}
            viewBox="0 0 100 100" 
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Red triangle that expands - large enough to cover screen */}
            <polygon 
              points="50,-100 -86.6,150 186.6,150" 
              fill="#dc2626"
              style={{
                transformOrigin: '50px 50px',
                animation: `triangle-scale-in ${TRIANGLE_EXPAND_DURATION}ms ease-in forwards, triangle-fade-in ${TRIANGLE_FADE_DURATION}ms ease-in forwards`,
                transform: 'scale(0.001)',
                opacity: 0
              }}
            />
          </svg>
        </div>
      )}

      {phase === 'logging-off' && (
        <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
          <style>{`
            @keyframes triangle-scale-out {
              0% { transform: scale(1); }
              100% { transform: scale(0.001); }
            }
            @keyframes triangle-mask-shrink {
              0% { transform: scale(1); }
              100% { transform: scale(0); }
            }
            @keyframes triangle-fade-out {
              0% { opacity: 1; }
              100% { opacity: 0; }
            }
          `}</style>
          {/* Red Triangle Layer with animated mask - reverse of login */}
          <svg 
            className="absolute"
            style={{ 
              overflow: 'visible',
              width: '300vmax',
              height: '300vmax',
              left: '50%',
              top: '50%',
              marginLeft: '-150vmax',
              marginTop: '-150vmax'
            }}
            viewBox="0 0 100 100" 
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Mask that shrinks from full to nothing, revealing content */}
              <mask id="shrink-mask">
                <rect x="-500" y="-500" width="1100" height="1100" fill="white" />
                <polygon 
                  points="50,-100 -86.6,150 186.6,150" 
                  fill="black"
                  style={{
                    transformOrigin: '50px 50px',
                        animation: `triangle-mask-shrink ${TRIANGLE_MASK_DURATION}ms ease-in forwards`,
                    transform: 'scale(1)'
                  }}
                />
              </mask>
            </defs>
            {/* Red triangle that shrinks after mask closes - large enough to cover screen */}
            <polygon 
              points="50,-100 -86.6,150 186.6,150" 
              fill="#dc2626"
              mask="url(#shrink-mask)"
              style={{
                transformOrigin: '50px 50px',
                animation: `triangle-scale-out ${TRIANGLE_EXPAND_DURATION}ms ease-out ${TRIANGLE_MASK_DURATION}ms forwards, triangle-fade-out ${TRIANGLE_FADE_DURATION}ms ease-out ${TRIANGLE_MASK_DURATION}ms forwards`,
                transform: 'scale(1)'
              }}
            />
          </svg>
        </div>
      )}
    </>
  )
}
