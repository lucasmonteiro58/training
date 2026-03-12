import { useSyncExternalStore, useEffect, useState } from 'react'
import { localDB } from './db/dexie'

// ─── Pending visual counter ──────────────────────────────────────────────────
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

// ─── Offline Write Queue (Dexie-backed) ──────────────────────────────────────

interface QueuedWrite {
  id?: number
  createdAt: number
  collection: string
  docId: string
  operation: 'set' | 'delete'
  data?: Record<string, unknown>
}

const syncQueueTable = localDB.table<QueuedWrite>('syncQueue')

export async function enqueueWrite(
  collectionName: string,
  docId: string,
  operation: 'set' | 'delete',
  data?: Record<string, unknown>,
): Promise<void> {
  await syncQueueTable.add({
    createdAt: Date.now(),
    collection: collectionName,
    docId,
    operation,
    data,
  })
}

export async function processQueue(): Promise<void> {
  if (!navigator.onLine) return

  const { doc, setDoc, deleteDoc } = await import('firebase/firestore')
  const { db } = await import('./firebase')

  const items = await syncQueueTable.orderBy('createdAt').toArray()
  for (const item of items) {
    try {
      const ref = doc(db, item.collection, item.docId)
      if (item.operation === 'set' && item.data) {
        await setDoc(ref, item.data)
      } else if (item.operation === 'delete') {
        await deleteDoc(ref)
      }
      await syncQueueTable.delete(item.id!)
    } catch (err) {
      console.warn('Sync queue: falha ao processar item, tentará novamente:', err)
      break // Stop processing on failure, retry later
    }
  }
}

// Process queue when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    processQueue()
  })
  // Process any leftover items on startup
  if (navigator.onLine) {
    setTimeout(() => processQueue(), 3000)
  }
}

// ─── Hooks para UI ───────────────────────────────────────────────────────────

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('online', cb)
      window.addEventListener('offline', cb)
      return () => {
        window.removeEventListener('online', cb)
        window.removeEventListener('offline', cb)
      }
    },
    () => navigator.onLine,
    () => true, // SSR: assume online
  )
}

export function useQueuedWriteCount(): number {
  const [count, setCount] = useState(0)
  const online = useOnlineStatus()

  useEffect(() => {
    let mounted = true
    const refresh = () => {
      syncQueueTable.count().then((n) => { if (mounted) setCount(n) })
    }
    refresh()
    // Re-check when online status changes or on interval while offline
    const interval = !online ? setInterval(refresh, 5000) : undefined
    if (online) refresh()
    return () => { mounted = false; if (interval) clearInterval(interval) }
  }, [online])

  return count
}
