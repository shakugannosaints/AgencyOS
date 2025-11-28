import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useTrans } from '@/lib/i18n-utils'
import { levenshtein } from '@/lib/utils'
import type { FC } from 'react'

// Import the pre-made JSON file. The path navigates up to the project root then into docs.
import coreRules from '../../../../docs/CoreRule.json'

type RuleEntry = {
  title: string
  summary: string
  page: string | number
}

function normalizeText(v: unknown) {
  return String(v ?? '').trim().toLowerCase()
}

export const RulesPage: FC = () => {
  const t = useTrans()
  const [query, setQuery] = useState('')

  const rules = Array.isArray(coreRules) ? (coreRules as RuleEntry[]) : []

  const results = useMemo(() => {
    const q = normalizeText(query)
    if (!q) return []
  const scored = rules.map((r) => {
      const title = normalizeText(r.title)
      const summary = normalizeText(r.summary)
      const page = normalizeText(r.page)
      const titleDistance = levenshtein(title, q)
      const summaryDistance = levenshtein(summary, q)
      const pageDistance = levenshtein(page, q)
      const best = Math.min(titleDistance, summaryDistance, pageDistance)
      const titleContains = title.includes(q) || titleDistance <= 1
      const fieldContains = title.includes(q) || summary.includes(q) || page.includes(q)
      return {
        entry: r,
        best,
        titleContains,
        fieldContains,
      }
    })
    // sort: titleContains first, then fieldContains, then by best distance
    scored.sort((a, b) => {
      if (a.titleContains === b.titleContains) {
        if (a.fieldContains === b.fieldContains) return a.best - b.best
        return a.fieldContains ? -1 : 1
      }
      return a.titleContains ? -1 : 1
    })
    return scored
  }, [query, rules])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  return (
    <div className="h-full flex flex-col space-y-6 p-8 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('rules.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('rules.description')}</p>
        </div>
      </div>

      <div>
        <input
          value={query}
          onChange={handleChange}
          placeholder={t('rules.placeholder')}
          className="w-full rounded-md border border-input px-4 py-2"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-10">
        {query.trim().length === 0 ? (
          <p className="text-muted-foreground">{t('rules.description')}</p>
        ) : results.length === 0 ? (
          <p className="text-muted-foreground">{t('rules.noResults')}</p>
        ) : (
          <ul className="space-y-2">
            {results.map(({ entry }, idx) => (
              <li key={`${entry.title}-${idx}`} className="border border-agency-border/60 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-mono text-base">{entry.title}</h2>
                  <span className="text-sm text-agency-muted">{entry.page}</span>
                </div>
                <p className="mt-2 text-sm text-agency-muted">{entry.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default RulesPage
