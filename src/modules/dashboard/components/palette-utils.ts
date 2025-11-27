export const excludeHueRanges: [number, number][] = [
  [35, 200], // 全部黄色绿色青色一起删掉
]

// subtract exclude intervals from full [0, 360) and return allowed ranges
const computeAllowedRanges = (): [number, number][] => {
  const excluded = excludeHueRanges.slice().sort((a, b) => a[0] - b[0])
  const allowed: [number, number][] = []
  let cursor = 0
  for (const [start, end] of excluded) {
    if (start > cursor) {
      allowed.push([cursor, start])
    }
    cursor = Math.max(cursor, end)
  }
  if (cursor < 360) allowed.push([cursor, 360])
  return allowed
}

export const generatePalette = (n: number, offset = 0) => {
  if (n <= 0) return [] as string[]
  const allowed = computeAllowedRanges()
  const spans = allowed.map(([s, e]) => e - s)
  const totalSpan = spans.reduce((s, v) => s + v, 0)
  if (totalSpan <= 0) {
    // fallback to full spectrum if everything somehow excluded
    return Array.from({ length: n }).map((_, i) => {
      const hue = Math.round((i * (360 / n) + offset) % 360)
      return `hsl(${hue},62%,52%)`
    })
  }
  const palette: string[] = []
  for (let i = 0; i < n; i += 1) {
    // pick position evenly across the available hue span
    const pos = ((i + 0.5) / n * totalSpan + offset) % totalSpan
    // find which allowed range contains this 'pos'
    let rem = pos
    let hue = 0
    for (let j = 0; j < allowed.length; j += 1) {
      const [start] = allowed[j]
      const span = spans[j]
      if (rem < span) {
        hue = start + rem
        break
      }
      rem -= span
    }
     hue = Math.floor(hue) % 360
    palette.push(`hsl(${hue},62%,52%)`)
  }
  return palette
}

export default generatePalette
