import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(value: string | number | Date) {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/**
 * 生成短 ID，优先使用 crypto.randomUUID，如不可用则回退到 Math.random
 */
export function createId() {
  try {
    const g = globalThis as unknown as { crypto?: { randomUUID?: () => string } }
    if (g?.crypto && typeof g.crypto.randomUUID === 'function') {
      return g.crypto.randomUUID()
    }
  } catch {
    // ignore
  }
  return Math.random().toString(36).slice(2, 10)
}

/**
 * 计算两个字符串之间的 Levenshtein 编辑距离（区分大小写判定可在调用处统一处理）
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const dp: number[] = new Array(n + 1)
  for (let j = 0; j <= n; j++) dp[j] = j
  for (let i = 1; i <= m; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j]
      const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1
      dp[j] = Math.min(
        dp[j] + 1, // deletion
        dp[j - 1] + 1, // insertion
        prev + cost, // substitution
      )
      prev = tmp
    }
  }
  return dp[n]
}
