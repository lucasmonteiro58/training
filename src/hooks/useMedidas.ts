import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '../stores'
import { getMeasurements, saveMeasurement, deleteMeasurement } from '../lib/db/dexie'
import { syncMeasurementToFirestore, deleteMeasurementFromFirestore, subscribeToMeasurements } from '../lib/firestore/sync'
import type { BodyMeasurement } from '../types'

export function useMeasurements() {
  const user = useAuthStore((s) => s.user)
  const [medidas, setMedidas] = useState<BodyMeasurement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    // Load local first
    getMeasurements(user.uid).then((local) => {
      setMedidas(local)
      setLoading(false)
    })

    // Subscribe to Firestore for real-time sync
    const unsub = subscribeToMeasurements(user.uid, (remote) => {
      setMedidas(remote)
      setLoading(false)
    })

    return unsub
  }, [user])

  const adicionar = useCallback(
    async (medida: BodyMeasurement) => {
      await saveMeasurement(medida)
      setMedidas(prev => [medida, ...prev].sort((a, b) => b.data - a.data))
      syncMeasurementToFirestore(medida) // background
    },
    []
  )

  const remover = useCallback(
    async (id: string) => {
      await deleteMeasurement(id)
      setMedidas(prev => prev.filter(m => m.id !== id))
      deleteMeasurementFromFirestore(id) // background
    },
    []
  )

  return { medidas, loading, adicionar, remover }
}
