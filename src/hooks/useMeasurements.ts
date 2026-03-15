import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '../stores'
import { getMeasurements, saveMeasurement, deleteMeasurement } from '../lib/db/dexie'
import { syncMeasurementToFirestore, deleteMeasurementFromFirestore, subscribeToMeasurements } from '../lib/firestore/sync'
import type { BodyMeasurement } from '../types'

export function useMeasurements() {
  const user = useAuthStore((s) => s.user)
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    getMeasurements(user.uid).then((local) => {
      setMeasurements(local)
      setLoading(false)
    })

    const unsub = subscribeToMeasurements(user.uid, (remote) => {
      setMeasurements(remote)
      setLoading(false)
    })

    return unsub
  }, [user])

  const add = useCallback(
    async (medida: BodyMeasurement) => {
      await saveMeasurement(medida)
      setMeasurements(prev => [medida, ...prev].sort((a, b) => b.data - a.data))
      syncMeasurementToFirestore(medida)
    },
    []
  )

  const remove = useCallback(
    async (id: string) => {
      await deleteMeasurement(id)
      setMeasurements(prev => prev.filter(m => m.id !== id))
      deleteMeasurementFromFirestore(id)
    },
    []
  )

  return { measurements, loading, add, remove }
}
