/* eslint-disable @typescript-eslint/no-explicit-any */
import { createId } from '@/lib/utils'

/**
 * Minimal helper to create common CRUD handlers for a slice.
 * It intentionally keeps types light to avoid excessive coupling with Zustand types.
 *
 * Usage: const { create, update, remove } = makeCrud<T>('agents', set, get)
 */
export function makeCrud<T extends { id?: string }>(
  itemsKey: string,
  set: any,
  get: any,
  opts?: {
    onCreate?: (item: T) => T | void
    onDelete?: (id: string, item?: T) => void
    onUpdate?: (id: string, prev: T, next: T) => void
  }
) {
  const create = (payload: Partial<Omit<T, 'id'>>) => {
    let item = { ...(payload as any), id: (payload as any)?.id ?? createId() } as T
    if (opts?.onCreate) {
      const maybe = opts.onCreate(item)
      if (maybe) item = maybe as T
    }
    set((state: any) => ({ [itemsKey]: [...(state as any)[itemsKey], item] }))
    return item
  }

  const update = (id: string, patch: Partial<T>) => {
    const prev: T | undefined = (get() as any)[itemsKey].find((it: T) => it.id === id)
    const next: T | undefined = prev ? ({ ...(prev as any), ...(patch as any), id } as T) : undefined
    set((state: any) => ({
      [itemsKey]: (state as any)[itemsKey].map((item: T) => (item.id === id ? (next as T) : item)),
    }))
    if (opts?.onUpdate && prev && next) opts.onUpdate(id, prev, next)
  }

  const remove = (id: string) => {
    const state = get()
    const existing: T | undefined = (state as any)[itemsKey].find((it: T) => it.id === id)
    set((s: any) => ({ [itemsKey]: s[itemsKey].filter((item: T) => item.id !== id) }))
    if (opts?.onDelete) {
      opts.onDelete(id, existing)
    }
  }

  const upsert = (payload: Partial<T> & { id?: string }) => {
    if (payload.id) {
      const prev = get()[itemsKey].find((it: any) => it.id === payload.id)
      if (prev) {
        update(payload.id, payload as Partial<T>)
        return payload as T
      }
    }
    return create(payload as any)
  }

  const reorder = (ids: string[]) => {
    set((state: any) => {
      const items = (state as any)[itemsKey]
      const itemMap = new Map(items.map((it: any) => [it.id, it]))
      const newItems = ids.map((id) => itemMap.get(id)).filter(Boolean)
      return { [itemsKey]: newItems }
    })
  }

  return { create, update, remove, upsert, reorder }
}

export default makeCrud
