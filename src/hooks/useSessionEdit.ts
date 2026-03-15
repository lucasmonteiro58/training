import { useState, useCallback } from 'react'
import type { WorkoutSession } from '../types'
import { toast } from 'sonner'

export function useSessionEdit(
  session: WorkoutSession | undefined,
  saveSessionComplete: (session: WorkoutSession) => Promise<void>
) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<WorkoutSession | null>(null)

  const displaySession = isEditing && editData ? editData : session ?? null

  const startEditing = useCallback(() => {
    if (!session) return
    setEditData(JSON.parse(JSON.stringify(session)))
    setIsEditing(true)
  }, [session])

  const saveEdit = useCallback(async () => {
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
    setIsEditing(false)
    setEditData(null)
    toast.success('Sessão atualizada!')
  }, [editData, saveSessionComplete])

  const cancelEdit = useCallback(() => {
    setIsEditing(false)
    setEditData(null)
  }, [])

  const updateSet = useCallback(
    (
      exIdx: number,
      sIdx: number,
      changes: Partial<{
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
            sI === sIdx ? { ...s, ...changes } : s
          ),
        }
      })
      setEditData(updated)
    },
    [editData]
  )

  const updateDuration = useCallback((durationSeconds: number) => {
    setEditData((prev) => (prev ? { ...prev, durationSeconds } : null))
  }, [])

  const updateStartedAt = useCallback((startedAt: number) => {
    setEditData((prev) => (prev ? { ...prev, startedAt } : null))
  }, [])

  return {
    isEditing,
    editData,
    displaySession,
    startEditing,
    saveEdit,
    cancelEdit,
    updateSet,
    updateDuration,
    updateStartedAt,
  }
}
