import { useEffect, useCallback } from 'react'
import { useHistoricoStore, useAuthStore } from '../stores'
import { getSessoes, salvarSessao, deletarSessao } from '../lib/db/dexie'
import { syncSessaoParaFirestore, deletarSessaoFirestore, subscribeToSessoes } from '../lib/firestore/sync'
import type { SessaoDeTreino } from '../types'

export function useHistorico() {
  const user = useAuthStore((s) => s.user)
  const { sessoes, loading, setSessoes, addSessao, removeSessao, setLoading } = useHistoricoStore()

  useEffect(() => {
    if (!user) return

    getSessoes(user.uid).then((local) => {
      setSessoes(local)
      setLoading(false)
    })

    const unsub = subscribeToSessoes(user.uid, (remote) => {
      setSessoes(remote)
      setLoading(false)
    })

    return unsub
  }, [user, setSessoes, setLoading])

  const salvarSessaoCompleta = useCallback(
    async (sessao: SessaoDeTreino): Promise<void> => {
      await salvarSessao(sessao)
      addSessao(sessao)
      syncSessaoParaFirestore(sessao) // background
    },
    [addSessao]
  )

  const excluirSessao = useCallback(
    async (id: string): Promise<void> => {
      await deletarSessao(id)
      removeSessao(id)
      deletarSessaoFirestore(id) // background
    },
    [removeSessao]
  )

  return { sessoes, loading, salvarSessaoCompleta, excluirSessao }
}
