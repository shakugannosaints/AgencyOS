import { describe, it, expect } from 'vitest'
import { generatePalette, excludeHueRanges } from '../palette-utils'

const parseHue = (hsl: string) => {
  const match = /hsl\((\d+),/.exec(hsl)
  return match ? Number(match[1]) : null
}

const isHueExcluded = (hue: number) => {
  return excludeHueRanges.some(([s, e]) => {
    return hue >= s && hue < e
  })
}

describe('generatePalette', () => {
  it('generates correct number of colors', () => {
    const n = 7
    const palette = generatePalette(n)
    expect(Array.isArray(palette)).toBe(true)
    expect(palette.length).toBe(n)
  })

  it('does not include excluded hues (yellow/green/cyan ranges) for several offsets', () => {
    const n = 24
    const offsets = [0, 20, 200, 10]
    for (const offset of offsets) {
      const palette = generatePalette(n, offset)
      const hues = palette.map((c) => parseHue(c)).filter((h) => h !== null) as number[]
      expect(hues.length).toBe(n)
      for (const hue of hues) {
        expect(isHueExcluded(hue)).toBe(false)
      }
    }
  })
})
