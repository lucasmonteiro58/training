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
      const exInSession = session.exercicios[idx]
      if (!exInSession) return
      const planExIdx = plan.exercicios.findIndex(
        (e) => e.exercicioId === exInSession.exercicioId
      )
      if (planExIdx === -1) return
      const planEx = plan.exercicios[planExIdx]
      const seriesDetalhadas = exInSession.series.map((s, i) => ({
        ...(planEx.seriesDetalhadas?.[i] ?? {}),
        peso: s.peso,
        repeticoes: s.repeticoes,
      }))
      const changed = seriesDetalhadas.some((sd, i) => {
        const old = planEx.seriesDetalhadas?.[i]
        return (
          !old || old.peso !== sd.peso || old.repeticoes !== sd.repeticoes
        )
      })
      if (!changed) return
      const exercicios = plan.exercicios.map((ex, i) =>
        i === planExIdx ? { ...ex, seriesDetalhadas } : ex
      )
      updatePlanById({ ...plan, exercicios })
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
