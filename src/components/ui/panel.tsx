import { type HTMLAttributes, forwardRef } from 'react'
import { usePanelClassnames } from '@/lib/theme-utils'

export const Panel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const baseClass = usePanelClassnames()

    return (
      <div
        ref={ref}
        className={`${baseClass} ${className || ''}`}
        {...props}
      />
    )
  }
)

Panel.displayName = 'Panel'
