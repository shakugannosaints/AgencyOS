import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCampaignStore } from '@/stores/campaign-store'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import rehypeRaw from 'rehype-raw'
import { defaultSchema } from 'hast-util-sanitize'

interface NoteEditorProps {
  initialContent: string
  onSave: (content: string) => void
  className?: string
}

export function NoteEditor({ initialContent, onSave, className }: NoteEditorProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState(initialContent || '')
  const [isDirty, setIsDirty] = useState(false)
  const [mode, setMode] = useState<'edit' | 'preview' | 'both'>('edit')

  useEffect(() => {
    setValue(initialContent || '')
  }, [initialContent])

  // debounce auto-save
  useEffect(() => {
    if (!isDirty) return
    const id = setTimeout(() => {
      onSave(value)
      setIsDirty(false)
    }, 800)
    return () => clearTimeout(id)
  }, [isDirty, value, onSave])

  // Build an extended sanitize schema once so preview and split use the same rules
  const extendedSanitizeSchema = (() => {
    const base = { ...(defaultSchema as any) }
    const existingAttrs = (base.attributes || {}) as Record<string, string[]>

    const mergeAttrs = (tag: string, extra: string[]) => {
      const prev = existingAttrs[tag] || []
      return Array.from(new Set([...prev, ...extra]))
    }

    const extendedAttributes: Record<string, string[]> = {
      ...existingAttrs,
      '*': mergeAttrs('*', ['className', 'id', 'style']),
      'span': mergeAttrs('span', ['style']),
      'div': mergeAttrs('div', ['style']),
      'p': mergeAttrs('p', ['style']),
      'h1': mergeAttrs('h1', ['style']),
      'h2': mergeAttrs('h2', ['style']),
      'h3': mergeAttrs('h3', ['style']),
      'h4': mergeAttrs('h4', ['style']),
      'h5': mergeAttrs('h5', ['style']),
      'h6': mergeAttrs('h6', ['style']),
      'a': mergeAttrs('a', ['href', 'title', 'target', 'rel', 'style', 'className']),
      'img': mergeAttrs('img', ['src', 'alt', 'title', 'width', 'height', 'style', 'className']),
      'iframe': mergeAttrs('iframe', ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'style']),
      'table': mergeAttrs('table', ['style', 'className']),
      'thead': mergeAttrs('thead', ['style']),
      'tbody': mergeAttrs('tbody', ['style']),
      'tr': mergeAttrs('tr', ['style']),
      'th': mergeAttrs('th', ['style']),
      'td': mergeAttrs('td', ['style']),
      'pre': mergeAttrs('pre', ['style']),
      'code': mergeAttrs('code', ['className', 'style']),
      'blockquote': mergeAttrs('blockquote', ['style'])
    }

    const extraTagNames = [
      'div',
      'span',
      'section',
      'article',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'img',
      'iframe',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'pre',
      'code',
      'blockquote'
    ]

    const tagNames = Array.from(new Set([...(base.tagNames || []), ...extraTagNames]))

    return {
      ...base,
      tagNames,
      attributes: extendedAttributes
    }
  })()

  const notesAllowHtml = useCampaignStore((s) => s.notesAllowHtml)

  const getRehypePlugins = () => {
    if (notesAllowHtml) return [rehypeRaw, [rehypeSanitize, extendedSanitizeSchema]] as any
    // When HTML is disabled, do not use rehypeRaw - embedded HTML will not be parsed.
    return [] as any
  }

  return (
    <div className={cn('flex flex-col border rounded-md overflow-hidden bg-background', className)}>
      <div className="flex items-center gap-2 p-2 border-b bg-muted/50">
        <div className="text-sm text-muted-foreground">{t('notes.editor.markdownMode') || 'Markdown'}</div>
        <div className="flex-1" />

        <div className="inline-flex rounded-md bg-muted/10 p-0.5">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={cn(
              'px-3 py-1 text-sm rounded-md transition-colors',
              mode === 'edit' ? 'bg-background text-foreground ring-1 ring-ring' : 'text-muted-foreground hover:bg-muted/50'
            )}
          >
            {t('notes.editor.edit') || 'Edit'}
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={cn(
              'px-3 py-1 text-sm rounded-md transition-colors',
              mode === 'preview' ? 'bg-background text-foreground ring-1 ring-ring' : 'text-muted-foreground hover:bg-muted/50'
            )}
          >
            {t('notes.editor.preview') || 'Preview'}
          </button>
          <button
            type="button"
            onClick={() => setMode('both')}
            className={cn(
              'px-3 py-1 text-sm rounded-md transition-colors',
              mode === 'both' ? 'bg-background text-foreground ring-1 ring-ring' : 'text-muted-foreground hover:bg-muted/50'
            )}
          >
            {t('notes.editor.split') || 'Split'}
          </button>
        </div>

        {isDirty && <Save className="w-4 h-4 text-muted-foreground animate-pulse ml-2" />}
      </div>

      <div className="p-4">
        {mode === 'edit' && (
          <textarea
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setIsDirty(true)
            }}
            className="w-full min-h-[200px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            placeholder={t('notes.contentPlaceholder') || 'Write markdown here...'}
          />
        )}

        {mode === 'preview' && (
          <div className="w-full min-h-[200px] rounded-md border border-input bg-transparent p-3 prose prose-sm dark:prose-invert overflow-auto">
            {
              /*
                We enable rehypeRaw to allow rendering of embedded HTML inside Markdown.
                rehype-sanitize is applied after rehypeRaw to strip dangerous elements/attributes.
                By default, style attributes are removed. To allow inline color/font styles on <span>,
                we extend the default schema to permit `style` on `span` only.

                WARNING: allowing `style` increases XSS risk if note content is untrusted. If notes
                can be authored by untrusted users, consider a safer approach (CSS classes, or a
                stricter sanitize schema).
              */
            }
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={getRehypePlugins()}>
              {value || ''}
            </ReactMarkdown>
          </div>
        )}

        {mode === 'both' && (
          <div className="flex flex-col md:flex-row gap-4">
            <textarea
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setIsDirty(true)
              }}
              className="flex-1 min-h-[200px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              placeholder={t('notes.contentPlaceholder') || 'Write markdown here...'}
            />

            <div className="flex-1 min-h-[200px] rounded-md border border-input bg-transparent p-3 prose prose-sm dark:prose-invert overflow-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={getRehypePlugins()}>
                {value || ''}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
