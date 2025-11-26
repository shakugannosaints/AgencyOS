import { useState, useEffect, useRef } from 'react'
import { Bold, Italic, Palette, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

const FONT_OPTIONS = [
  { value: '', label: 'default font' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: '"Times New Roman", serif', label: 'Times New Roman' },
  { value: '"Courier New", monospace', label: 'Courier New' },
  { value: '"SimSun", serif', label: '宋体' },
  { value: '"Microsoft YaHei", sans-serif', label: '微软雅黑' },
  { value: '"KaiTi", serif', label: '楷体' },
]

interface NoteEditorProps {
  initialContent: string
  onSave: (content: string) => void
  className?: string
}

export function NoteEditor({ initialContent, onSave, className }: NoteEditorProps) {
  const { t } = useTranslation()
  const editorRef = useRef<HTMLDivElement>(null)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialContent) {
      editorRef.current.innerHTML = initialContent
    }
  }, [initialContent])

  const handleInput = () => {
    setIsDirty(true)
    if (editorRef.current) {
      const updatedContent = editorRef.current.innerHTML;
      onSave(updatedContent); // Save the updated content immediately
    }
  }

  // Simple auto-save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isDirty && editorRef.current) {
        onSave(editorRef.current.innerHTML)
        setIsDirty(false)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [isDirty, onSave])

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const applyItalic = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    if (range.collapsed) return

    const parentElement = range.commonAncestorContainer.parentElement

    if (parentElement && parentElement.style.fontStyle === 'italic') {
      // Remove italic style
      parentElement.style.fontStyle = ''
      parentElement.style.transform = ''
    } else {
      // Apply italic style
      const span = document.createElement('span')
      span.style.fontStyle = 'italic'
      span.style.transform = 'skewX(-8deg)'
      span.style.display = 'inline-block'

      try {
        range.surroundContents(span)
      } catch {
        // If surroundContents fails (e.g., partial selection), fallback to execCommand
        execCommand('italic')
      }
    }

    editorRef.current?.focus()
    setIsDirty(true)
  }

  const applyFont = (fontFamily: string) => {
    if (!fontFamily) {
      execCommand('removeFormat')
      return
    }

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      execCommand('fontName', fontFamily)
      return
    }

    const range = selection.getRangeAt(0)
    if (range.collapsed) {
      execCommand('fontName', fontFamily)
      return
    }

    const span = document.createElement('span')
    span.style.fontFamily = fontFamily

    try {
      range.surroundContents(span)
    } catch {
      execCommand('fontName', fontFamily)
    }

    editorRef.current?.focus()
    setIsDirty(true)
  }

  return (
    <div className={cn("flex flex-col border rounded-md overflow-hidden bg-background", className)}>
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
        <button
          onClick={() => execCommand('bold')}
          className="p-1.5 hover:bg-accent rounded transition-colors"
          title={t('notes.editor.bold')}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={applyItalic}
          className="p-1.5 hover:bg-accent rounded transition-colors"
          title={t('notes.editor.italic')}
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          onClick={() => execCommand('foreColor', '#ef4444')} // Red
          className="p-1.5 hover:bg-accent rounded transition-colors text-red-500"
          title={t('notes.editor.colorRed')}
        >
          <Palette className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCommand('foreColor', '#3b82f6')} // Blue
          className="p-1.5 hover:bg-accent rounded transition-colors text-blue-500"
          title={t('notes.editor.colorBlue')}
        >
          <Palette className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCommand('foreColor', '#f59e0b')} // Yellow
          className="p-1.5 hover:bg-accent rounded transition-colors text-yellow-500"
          title={t('notes.editor.colorYellow')}
        >
          <Palette className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCommand('foreColor', '#000000')} // Black
          className="p-1.5 hover:bg-accent rounded transition-colors text-black"
          title={t('notes.editor.colorBlack')}
        >
          <Palette className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <select
          onChange={(e) => applyFont(e.target.value)}
          className="h-7 px-2 text-sm rounded border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
          defaultValue=""
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
        
        <div className="flex-1" />
        {isDirty && <Save className="w-4 h-4 text-muted-foreground animate-pulse" />}
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="flex-1 p-4 focus:outline-none min-h-[200px] prose prose-sm dark:prose-invert max-w-none"
        onInput={handleInput}
        onBlur={() => {
          if (editorRef.current) {
            onSave(editorRef.current.innerHTML)
            setIsDirty(false)
          }
        }}
      />
    </div>
  )
}
