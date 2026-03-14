import { useEffect, useCallback } from 'react'
import { useHistoryStore, useAuthStore } from '../stores'
import { getSessions, saveSession, deleteSession } from '../lib/db/dexie'
import { syncSessionToFirestore, deleteSessionFromFirestore, subscribeToSessions, fetchSessions } from '../lib/firestore/sync'
import type { WorkoutSession } from '../types'

export function useHistory() {
  const user = useAuthStore((s) => s.user)
  const { sessoes, loading, setSessoes, addSessao, removeSessao, setLoading } = useHistoryStore()

  useEffect(() => {
    if (!user) return

    getSessions(user.uid).then((local) => {
      setSessoes(local)
      setLoading(false)
    })

    const unsub = subscribeToSessions(user.uid, (remote) => {
      setSessoes(remote)
      setLoading(false)
    })

    return unsub
  }, [user, setSessoes, setLoading])

  const salvarSessaoCompleta = useCallback(
    async (sessao: WorkoutSession): Promise<void> => {
      await saveSession(sessao)
      addSessao(sessao)
      syncSessionToFirestore(sessao) // background
    },
    [addSessao]
  )

  const excluirSessao = useCallback(
    async (id: string): Promise<void> => {
      await deleteSession(id)
      removeSessao(id)
      deleteSessionFromFirestore(id) // background
    },
    [removeSessao]
  )

  const sincronizar = useCallback(async () => {
    if (!user) return
    const remote = await fetchSessions(user.uid)
    if (remote.length > 0) setSessoes(remote)
  }, [user, setSessoes])

  return { sessoes, loading, salvarSessaoCompleta, excluirSessao, sincronizar }
}
