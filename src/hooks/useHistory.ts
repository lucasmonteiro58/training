import { useEffect, useCallback } from 'react'
import { useHistoryStore, useAuthStore } from '../stores'
import { getSessions, saveSession, deleteSession } from '../lib/db/dexie'
import { syncSessionToFirestore, deleteSessionFromFirestore, subscribeToSessions, fetchSessions } from '../lib/firestore/sync'
import type { WorkoutSession } from '../types'

export function useHistory() {
  const user = useAuthStore((s) => s.user)
  const { sessions, loading, setSessions, addSession, removeSession, setLoading } = useHistoryStore()

  useEffect(() => {
    if (!user) return

    getSessions(user.uid).then((local) => {
      setSessions(local)
      setLoading(false)
    })

    const unsub = subscribeToSessions(user.uid, (remote) => {
      setSessions(remote)
      setLoading(false)
    })

    return unsub
  }, [user, setSessions, setLoading])

  const saveSessionComplete = useCallback(
    async (session: WorkoutSession): Promise<void> => {
      await saveSession(session)
      addSession(session)
      syncSessionToFirestore(session)
    },
    [addSession]
  )

  const deleteSessionById = useCallback(
    async (id: string): Promise<void> => {
      await deleteSession(id)
      removeSession(id)
      deleteSessionFromFirestore(id)
    },
    [removeSession]
  )

  const sync = useCallback(async () => {
    if (!user) return
    const remote = await fetchSessions(user.uid)
    if (remote.length > 0) setSessions(remote)
  }, [user, setSessions])

  return { sessions, loading, saveSessionComplete, deleteSessionById, sync }
}
