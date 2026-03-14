import { useRef, useEffect, useCallback } from 'react'
import type { WorkoutPlan, WorkoutSession } from '../types'

export function useSaveWeightsToPlan(
  plano: WorkoutPlan | undefined,
  sessao: WorkoutSession | null,
  exercicioAtualIndex: number,
  atualizarPlano: (plano: WorkoutPlan) => Promise<void>,
  onExerciseChange?: () => void
) {
  const prevExIdxRef = useRef(exercicioAtualIndex)

  const salvarPesosNoPlano = useCallback(
    (exIdx?: number) => {
      if (!plano || !sessao) return
      const idx = exIdx ?? exercicioAtualIndex
      const exSessao = sessao.exercicios[idx]
      if (!exSessao) return
      const planoExIdx = plano.exercicios.findIndex(
        (e) => e.exercicioId === exSessao.exercicioId
      )
      if (planoExIdx === -1) return
      const exPlano = plano.exercicios[planoExIdx]
      const seriesDetalhadas = exSessao.series.map((s, i) => ({
        ...(exPlano.seriesDetalhadas?.[i] ?? {}),
        peso: s.peso,
        repeticoes: s.repeticoes,
      }))
      const changed = seriesDetalhadas.some((sd, i) => {
        const old = exPlano.seriesDetalhadas?.[i]
        return (
          !old || old.peso !== sd.peso || old.repeticoes !== sd.repeticoes
        )
      })
      if (!changed) return
      const exercicios = plano.exercicios.map((ex, i) =>
        i === planoExIdx ? { ...ex, seriesDetalhadas } : ex
      )
      atualizarPlano({ ...plano, exercicios })
    },
    [plano, sessao, exercicioAtualIndex, atualizarPlano]
  )

  useEffect(() => {
    if (prevExIdxRef.current !== exercicioAtualIndex) {
      salvarPesosNoPlano(prevExIdxRef.current)
      prevExIdxRef.current = exercicioAtualIndex
    }
    onExerciseChange?.()
  }, [exercicioAtualIndex, salvarPesosNoPlano, onExerciseChange])

  return { salvarPesosNoPlano }
}
