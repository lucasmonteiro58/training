import { useRef, useCallback } from 'react'
import { prepararAudio } from '../lib/notifications'
import { detectarNovoPR } from '../lib/records'
import type { WorkoutSession } from '../types'
import type { RecordeExercicio } from '../lib/records'

interface UseCompletarSerieTreinoParams {
  sessao: WorkoutSession | null
  exercicioAtualIndex: number
  recordes: Map<string, RecordeExercicio>
  salvarPesosNoPlano: (exIdx?: number) => void
  marcarSerieCompletada: (exercicioIdx: number, serieIdx: number) => void
  atualizarSerie: (
    exercicioIdx: number,
    serieIdx: number,
    dados: Partial<{ repeticoes: number; peso: number; completada: boolean }>
  ) => void
  iniciarDescanso: (segundos: number) => void
  proximoExercicio: () => void
  exercicioAnterior: () => void
  pararDescanso: () => void
  cancelarNotificacaoDescanso: () => void
  descansoAcabouNaturalRef: React.MutableRefObject<boolean>
  onPrDetected?: () => void
  onWorkoutComplete?: () => void
}

export function useCompleteWorkoutSet({
  sessao,
  exercicioAtualIndex,
  recordes,
  salvarPesosNoPlano,
  marcarSerieCompletada,
  atualizarSerie,
  iniciarDescanso,
  proximoExercicio,
  exercicioAnterior,
  pararDescanso,
  cancelarNotificacaoDescanso,
  descansoAcabouNaturalRef,
  onPrDetected,
  onWorkoutComplete,
}: UseCompletarSerieTreinoParams) {
  const prExibidoRef = useRef<Map<string, number>>(new Map())

  const handleCompletarSerie = useCallback(
    (serieIdx: number) => {
      const exercicioAtual = sessao?.exercicios[exercicioAtualIndex]
      if (!exercicioAtual || !sessao) return
      const serie = exercicioAtual.series[serieIdx]
      const novaCompletada = !serie.completada

      if (novaCompletada) {
        marcarSerieCompletada(exercicioAtualIndex, serieIdx)
        setTimeout(() => salvarPesosNoPlano(), 0)

        const serieAtual = exercicioAtual.series[serieIdx]
        const exId = exercicioAtual.exercicioId
        const pesoCelebrado = prExibidoRef.current.get(exId) ?? 0
        if (serieAtual.peso > pesoCelebrado) {
          const prCheck = detectarNovoPR(
            { ...serieAtual, completada: true },
            exId,
            recordes,
          )
          if (prCheck && prCheck.tipo === 'peso') {
            prExibidoRef.current.set(exId, serieAtual.peso)
            onPrDetected?.()
          }
        }

        prepararAudio()

        const isInGroup = !!exercicioAtual.agrupamentoId
        const groupExercises = isInGroup
          ? sessao.exercicios
              .map((ex, idx) => ({ ex, idx }))
              .filter(({ ex }) => ex.agrupamentoId === exercicioAtual.agrupamentoId)
          : []
        const currentGroupPos = groupExercises.findIndex(
          (g) => g.idx === exercicioAtualIndex
        )
        const nextInGroup =
          currentGroupPos >= 0 && currentGroupPos < groupExercises.length - 1
            ? groupExercises[currentGroupPos + 1]
            : null

        const todasExercicioCompletas = exercicioAtual.series.every((s, i) =>
          i === serieIdx ? true : s.completada
        )

        if (todasExercicioCompletas && isInGroup && nextInGroup) {
          setTimeout(() => {
            const target = nextInGroup.idx
            const diff = target - exercicioAtualIndex
            for (let i = 0; i < diff; i++) proximoExercicio()
          }, 600)
        } else if (todasExercicioCompletas && isInGroup && !nextInGroup) {
          prepararAudio()
          iniciarDescanso(exercicioAtual.descansoSegundos)
          const allGroupDone = groupExercises.every(({ idx }) =>
            sessao.exercicios[idx].series.every((s, i) =>
              idx === exercicioAtualIndex
                ? i === serieIdx
                  ? true
                  : s.completada
                : s.completada
            )
          )
          if (allGroupDone) {
            const lastGroupIdx = groupExercises[groupExercises.length - 1].idx
            const isLastExercicio =
              lastGroupIdx === sessao.exercicios.length - 1
            if (!isLastExercicio) {
              setTimeout(() => {
                const target = lastGroupIdx + 1
                const diff = target - exercicioAtualIndex
                for (let i = 0; i < diff; i++) proximoExercicio()
              }, 800)
            } else {
              const todosTreinoCompleto = sessao.exercicios.every((ex, eIdx) =>
                ex.series.every((s, i) =>
                  eIdx === exercicioAtualIndex && i === serieIdx
                    ? true
                    : s.completada
                )
              )
              if (todosTreinoCompleto) {
                setTimeout(() => onWorkoutComplete?.(), 800)
              }
            }
          } else {
            setTimeout(() => {
              const target = groupExercises[0].idx
              const diff = exercicioAtualIndex - target
              for (let i = 0; i < diff; i++) exercicioAnterior()
            }, 800)
          }
        } else {
          prepararAudio()
          iniciarDescanso(exercicioAtual.descansoSegundos)

          const isLastExercicio =
            exercicioAtualIndex === sessao.exercicios.length - 1
          if (todasExercicioCompletas) {
            if (!isLastExercicio) {
              setTimeout(() => proximoExercicio(), 800)
            } else {
              const todosTreinoCompleto = sessao.exercicios.every((ex, eIdx) => {
                if (eIdx === exercicioAtualIndex) {
                  return ex.series.every((s, i) =>
                    i === serieIdx ? true : s.completada
                  )
                }
                return ex.series.every((s) => s.completada)
              })
              if (todosTreinoCompleto) {
                setTimeout(() => onWorkoutComplete?.(), 800)
              }
            }
          }
        }
      } else {
        atualizarSerie(exercicioAtualIndex, serieIdx, { completada: false })
        descansoAcabouNaturalRef.current = false
        cancelarNotificacaoDescanso()
        pararDescanso()
      }
    },
    [
      sessao,
      exercicioAtualIndex,
      recordes,
      salvarPesosNoPlano,
      marcarSerieCompletada,
      atualizarSerie,
      iniciarDescanso,
      proximoExercicio,
      exercicioAnterior,
      pararDescanso,
      cancelarNotificacaoDescanso,
      descansoAcabouNaturalRef,
      onPrDetected,
      onWorkoutComplete,
    ]
  )

  return { handleCompletarSerie }
}
