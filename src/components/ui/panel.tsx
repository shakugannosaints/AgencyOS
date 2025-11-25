import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'
import { useThemeStore } from '@/stores/theme-store'

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const themeMode = useThemeStore((state) => state.mode)
  const isWin98 = themeMode === 'win98'

  return (
    <div
      className={cn(
        isWin98
          ? 'rounded-none border-2 border-agency-border bg-agency-panel p-3 text-agency-cyan'
          : 'rounded-2xl border border-agency-border bg-agency-panel/90 p-4 text-agency-cyan shadow-panel backdrop-blur-lg',
        className,
      )}
      {...props}
    />
  )
}
