import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '../stores'
import { getMedidas, salvarMedida, deletarMedida } from '../lib/db/dexie'
import { syncMedidaParaFirestore, deletarMedidaFirestore, subscribeToMedidas } from '../lib/firestore/sync'
import type { MedidaCorporal } from '../types'

export function useMedidas() {
  const user = useAuthStore((s) => s.user)
  const [medidas, setMedidas] = useState<MedidaCorporal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    // Load local first
    getMedidas(user.uid).then((local) => {
      setMedidas(local)
      setLoading(false)
    })

    // Subscribe to Firestore for real-time sync
    const unsub = subscribeToMedidas(user.uid, (remote) => {
      setMedidas(remote)
      setLoading(false)
    })

    return unsub
  }, [user])

  const adicionar = useCallback(
    async (medida: MedidaCorporal) => {
      await salvarMedida(medida)
      setMedidas(prev => [medida, ...prev].sort((a, b) => b.data - a.data))
      syncMedidaParaFirestore(medida) // background
    },
    []
  )

  const remover = useCallback(
    async (id: string) => {
      await deletarMedida(id)
      setMedidas(prev => prev.filter(m => m.id !== id))
      deletarMedidaFirestore(id) // background
    },
    []
  )

  return { medidas, loading, adicionar, remover }
}
