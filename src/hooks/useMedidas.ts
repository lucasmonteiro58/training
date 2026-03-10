import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '../stores'
import { getMedidas, salvarMedida, deletarMedida } from '../lib/db/dexie'
import type { MedidaCorporal } from '../types'

export function useMedidas() {
  const user = useAuthStore((s) => s.user)
  const [medidas, setMedidas] = useState<MedidaCorporal[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    if (!user) return
    const data = await getMedidas(user.uid)
    setMedidas(data)
    setLoading(false)
  }, [user])

  useEffect(() => {
    carregar()
  }, [carregar])

  const adicionar = useCallback(
    async (medida: MedidaCorporal) => {
      await salvarMedida(medida)
      await carregar()
    },
    [carregar]
  )

  const remover = useCallback(
    async (id: string) => {
      await deletarMedida(id)
      await carregar()
    },
    [carregar]
  )

  return { medidas, loading, adicionar, remover }
}
