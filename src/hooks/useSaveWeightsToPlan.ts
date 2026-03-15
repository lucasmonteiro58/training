import { useRef, useEffect, useCallback } from 'react'
import type { WorkoutPlan, WorkoutSession } from '../types'

export function useSaveWeightsToPlan(
  plan: WorkoutPlan | undefined,
  session: WorkoutSession | null,
  currentExerciseIndex: number,
  updatePlanById: (plan: WorkoutPlan) => Promise<void>,
  onExerciseChange?: () => void
) {
  const prevExIdxRef = useRef(currentExerciseIndex)

  const saveWeightsToPlan = useCallback(
    (exIdx?: number) => {
      if (!plan || !session) return
      const idx = exIdx ?? currentExerciseIndex
      const exInSession = session.exercises[idx]
      if (!exInSession) return
      const planExIdx = plan.exercises.findIndex(
        (e) => e.exerciseId === exInSession.exerciseId
      )
      if (planExIdx === -1) return
      const planEx = plan.exercises[planExIdx]
      const setsDetail = exInSession.sets.map((s, i) => ({
        ...(planEx.setsDetail?.[i] ?? {}),
        weight: s.weight,
        reps: s.reps,
      }))
      const changed = setsDetail.some((sd, i) => {
        const old = planEx.setsDetail?.[i]
        return (
          !old || old.weight !== sd.weight || old.reps !== sd.reps
        )
      })
      if (!changed) return
      const exercises = plan.exercises.map((ex, i) =>
        i === planExIdx ? { ...ex, setsDetail } : ex
      )
      updatePlanById({ ...plan, exercises })
    },
    [plan, session, currentExerciseIndex, updatePlanById]
  )

  useEffect(() => {
    if (prevExIdxRef.current !== currentExerciseIndex) {
      saveWeightsToPlan(prevExIdxRef.current)
      prevExIdxRef.current = currentExerciseIndex
    }
    onExerciseChange?.()
  }, [currentExerciseIndex, saveWeightsToPlan, onExerciseChange])

  return { saveWeightsToPlan }
}
