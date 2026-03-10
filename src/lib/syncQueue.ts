import { useSyncExternalStore } from 'react'

let pendingCount = 0
let listeners: Set<() => void> = new Set()

function emit() {
  listeners.forEach((l) => l())
}

export function incrementSync() {
  pendingCount++
  emit()
}

export function decrementSync() {
  pendingCount = Math.max(0, pendingCount - 1)
  emit()
}

export function usePendingSyncCount(): number {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    () => pendingCount,
  )
}
