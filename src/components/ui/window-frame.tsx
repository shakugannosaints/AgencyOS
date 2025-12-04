import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/theme-store'

interface WindowFrameProps {
  title: string
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  initialPosition?: { x: number; y: number }
  initialSize?: { width: number; height: number }
  minSize?: { width: number; height: number }
  titleBarColor?: 'blue' | 'red'
}

export function WindowFrame({
  title,
  isOpen,
  onClose,
  children,
  initialPosition,
  initialSize = { width: 400, height: 300 },
  minSize = { width: 200, height: 150 },
  titleBarColor = 'blue'
}: WindowFrameProps) {
  const themeMode = useThemeStore((state) => state.mode)
  const win98TitleBarColor = useThemeStore((state) => state.win98TitleBarColor)
  const isWin98 = themeMode === 'win98'

  const [position, setPosition] = useState(initialPosition || { x: 0, y: 0 })
  const [size, setSize] = useState(initialSize)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  
  const dragStartRef = useRef({ x: 0, y: 0 })
  const posStartRef = useRef({ x: 0, y: 0 })
  const sizeStartRef = useRef({ width: 0, height: 0 })
  const initializedRef = useRef(false)

  // Center window on first open if no position provided
  useEffect(() => {
    if (!initializedRef.current && !initialPosition && typeof window !== 'undefined') {
      setPosition({
        x: Math.max(0, window.innerWidth / 2 - size.width / 2),
        y: Math.max(0, window.innerHeight / 2 - size.height / 2)
      })
      initializedRef.current = true
    }
  }, [initialPosition, size.width, size.height])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStartRef.current.x
        const dy = e.clientY - dragStartRef.current.y
        setPosition({
          x: posStartRef.current.x + dx,
          y: posStartRef.current.y + dy
        })
      }
      if (isResizing) {
        const dx = e.clientX - dragStartRef.current.x
        const dy = e.clientY - dragStartRef.current.y
        setSize({
          width: Math.max(minSize.width, sizeStartRef.current.width + dx),
          height: Math.max(minSize.height, sizeStartRef.current.height + dy)
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, minSize])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget && (e.target as HTMLElement).closest('button')) return
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    posStartRef.current = { ...position }
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    sizeStartRef.current = { ...size }
  }

  if (!isOpen) return null

  // Determine effective title bar color (prop overrides store if provided explicitly, otherwise use store for win98)
  const effectiveTitleBarColor = isWin98 ? win98TitleBarColor : titleBarColor

  return (
    <div 
      className={cn(
        "fixed z-40 flex flex-col shadow-2xl",
        isWin98 
          ? "border-2 border-b-[#404040] border-l-[#dfdfdf] border-r-[#404040] border-t-[#dfdfdf] bg-[#c0c0c0] p-[2px]" 
          : "rounded-xl border border-agency-border bg-agency-panel/95 backdrop-blur overflow-hidden"
      )}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height
      }}
    >
       {/* Window Title Bar */}
       <div 
         className={cn(
           "flex items-center justify-between px-2 py-1 select-none cursor-move",
           isWin98 
             ? "win98-title-bar mb-[2px]" 
             : "bg-agency-ink/50 border-b border-agency-border"
         )}
         style={isWin98 && effectiveTitleBarColor === 'red' ? { background: 'linear-gradient(90deg, #800000, #d01010)' } : undefined}
         onMouseDown={handleMouseDown}
       >
          <span className={cn("text-xs font-bold", isWin98 ? "text-white" : "text-agency-cyan")}>
            {title}
          </span>
          <div className="flex gap-1">
             <button 
               onClick={onClose}
               className={cn(
                 "flex h-4 w-4 items-center justify-center",
                 isWin98 
                   ? "bg-[#c0c0c0] text-black shadow-[inset_-1px_-1px_#000000,inset_1px_1px_#ffffff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] active:shadow-[inset_1px_1px_#000000,inset_-1px_-1px_#ffffff,inset_2px_2px_#808080,inset_-2px_-2px_#dfdfdf]" 
                   : "hover:text-agency-cyan"
               )}
             >
               <X className="h-3 w-3" />
             </button>
          </div>
       </div>

       {/* Content Area */}
       <div className={cn("flex flex-col flex-1 min-h-0 relative", isWin98 ? "bg-white border border-[#808080] shadow-[inset_1px_1px_#000000]" : "")}>
          {children}
       </div>

       {/* Resize Handle */}
       <div 
         className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize z-50"
         onMouseDown={handleResizeStart}
       >
         {isWin98 && (
           <div className="absolute bottom-[2px] right-[2px] h-[2px] w-[2px] bg-[#808080] shadow-[2px_0_0_#808080,4px_0_0_#808080,0_-2px_0_#808080,2px_-2px_0_#808080,0_-4px_0_#808080]" />
         )}
       </div>
    </div>
  )
}
