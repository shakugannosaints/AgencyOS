import { describe, it, expect } from 'vitest'
import { levenshtein } from '@/lib/utils'

describe('rules search behavior', () => {
  it('prioritizes title matches and sorts by edit distance', () => {
    const query = 'R7'
    const entries = [
      { title: 'R7', summary: 'Refined senses', page: '261' },
      { title: 'Refined Senses', summary: 'R7 refined', page: '261' },
      { title: 'Other', summary: 'Some random text', page: '50' },
    ]

    const scored = entries.map((r) => {
      const title = r.title.toLowerCase()
      const summary = r.summary.toLowerCase()
      const page = String(r.page).toLowerCase()
      const q = query.toLowerCase()
      const titleDistance = levenshtein(title, q)
      const summaryDistance = levenshtein(summary, q)
      const pageDistance = levenshtein(page, q)
      const best = Math.min(titleDistance, summaryDistance, pageDistance)
      const titleContains = title.includes(q) || titleDistance <= 1
      const fieldContains = title.includes(q) || summary.includes(q) || page.includes(q)
      return { r, best, titleContains, fieldContains }
    })

    scored.sort((a, b) => {
      if (a.titleContains === b.titleContains) {
        if (a.fieldContains === b.fieldContains) return a.best - b.best
        return a.fieldContains ? -1 : 1
      }
      return a.titleContains ? -1 : 1
    })

  // debug print removed
  expect(scored[0].r.title).toBe('R7')
    // second should be Refined Senses due to summary match and relatively low distance
    expect(scored[1].r.title).toBe('Refined Senses')
    expect(scored[2].r.title).toBe('Other')
  })
})
