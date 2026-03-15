import { useState, useCallback } from 'react'
import type { WorkoutSession } from '../types'
import { toast } from 'sonner'

export function useSessionEdit(
  session: WorkoutSession | undefined,
  saveSessionComplete: (session: WorkoutSession) => Promise<void>
) {
  const [editando, setEditando] = useState(false)
  const [editData, setEditData] = useState<WorkoutSession | null>(null)

  const displaySessao = editando && editData ? editData : session ?? null

  const iniciarEdicao = useCallback(() => {
    if (!session) return
    setEditData(JSON.parse(JSON.stringify(session)))
    setEditando(true)
  }, [session])

  const salvarEdicao = useCallback(async () => {
    if (!editData) return
    const totalVolume = editData.exercises.reduce(
      (sum, ex) =>
        sum +
        ex.sets
          .filter((s) => s.completed)
          .reduce((s, sr) => s + (sr.weight ?? 0) * (sr.reps ?? 0), 0),
      0
    )
    await saveSessionComplete({ ...editData, totalVolume })
    setEditando(false)
    setEditData(null)
    toast.success('Sessão atualizada!')
  }, [editData, saveSessionComplete])

  const cancelarEdicao = useCallback(() => {
    setEditando(false)
    setEditData(null)
  }, [])

  const updateSerie = useCallback(
    (
      exIdx: number,
      sIdx: number,
      campo: Partial<{
        weight: number
        reps: number
        completed: boolean
      }>
    ) => {
      if (!editData) return
      const updated = { ...editData }
      updated.exercises = updated.exercises.map((ex, eI) => {
        if (eI !== exIdx) return ex
        return {
          ...ex,
          sets: ex.sets.map((s, sI) =>
            sI === sIdx ? { ...s, ...campo } : s
          ),
        }
      })
      setEditData(updated)
    },
    [editData]
  )

  const updateDuracao = useCallback((durationSeconds: number) => {
    setEditData((prev) => (prev ? { ...prev, durationSeconds } : null))
  }, [])

  const updateIniciadoEm = useCallback((startedAt: number) => {
    setEditData((prev) => (prev ? { ...prev, startedAt } : null))
  }, [])

  return {
    editando,
    editData,
    displaySessao,
    iniciarEdicao,
    salvarEdicao,
    cancelarEdicao,
    updateSerie,
    updateDuracao,
    updateIniciadoEm,
  }
}
