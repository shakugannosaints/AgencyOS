import { useCallback, useState, type ReactNode } from 'react'
import { createId } from '@/lib/utils'
import ToastContext, { type Toast, type ToastType } from './toast-context'
import { useIsTheme } from '@/lib/theme-utils'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

// Context and supporting types are exported from toast-context.ts

// `useToast` is exported from `use-toast.ts` to keep this file limited to components only.

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (type: ToastType, message: string, duration = 3000) => {
  const id = createId()
      const newToast: Toast = { id, type, message, duration }
      
      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id)
        }, duration)
      }
    },
    [dismissToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

const iconMap: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorMap: Record<ToastType, { border: string; text: string; bg: string }> = {
  success: {
    border: 'border-agency-cyan/60',
    text: 'text-agency-cyan',
    bg: 'bg-agency-cyan/10',
  },
  error: {
    border: 'border-agency-magenta/60',
    text: 'text-agency-magenta',
    bg: 'bg-agency-magenta/10',
  },
  warning: {
    border: 'border-agency-amber/60',
    text: 'text-agency-amber',
    bg: 'bg-agency-amber/10',
  },
  info: {
    border: 'border-agency-border',
    text: 'text-agency-muted',
    bg: 'bg-agency-ink/60',
  },
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const Icon = iconMap[toast.type]
  const colors = colorMap[toast.type]
  const isWin98 = useIsTheme('win98')

  // 构建 toast 容器的样式类
  const containerClass = `
    flex items-center gap-3 border px-4 py-3 shadow-lg backdrop-blur-sm
    animate-slide-in-right
    ${isWin98 ? 'rounded-none' : 'rounded-xl'}
    ${colors.border}
    ${colors.bg}
    min-w-[280px] max-w-[400px]
  `

  return (
    <div
      className={containerClass}
      role="alert"
    >
      <Icon className={`h-5 w-5 shrink-0 ${colors.text}`} />
      <p className={`flex-1 text-sm ${colors.text}`}>{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className={`shrink-0 p-1 transition-colors hover:opacity-70 ${colors.text}`}
        aria-label="关闭"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
