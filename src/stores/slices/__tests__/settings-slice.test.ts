/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { createSettingsSlice } from '../settings-slice'
import type { SettingsSlice } from '../settings-slice'

describe('settings-slice', () => {
  it('defaults to enabling HTML in notes and toggles setter', () => {
    let state: any = { notesAllowHtml: undefined }
  const set = (fn: any) => {
      const next = typeof fn === 'function' ? fn(state) : fn
      state = { ...state, ...next }
    }
    const get = () => state

    const slice = createSettingsSlice(set as any, get as any, {} as any) as SettingsSlice

  // initial default exposed by slice return
  expect(slice.notesAllowHtml).toBe(false)
  expect(slice.dashboardReadOnlyStyle).toBe(false)

    // toggle to true
    slice.setNotesAllowHtml(true)
    expect(state.notesAllowHtml).toBe(true)

    // toggle back to false
    slice.setNotesAllowHtml(false)
    expect(state.notesAllowHtml).toBe(false)
  // toggle dashboardReadOnlyStyle
  slice.setDashboardReadOnlyStyle(true)
  expect(state.dashboardReadOnlyStyle).toBe(true)
  slice.setDashboardReadOnlyStyle(false)
  expect(state.dashboardReadOnlyStyle).toBe(false)
  })
})
