import { useRef, useCallback } from 'react'
import { prepararAudio } from '../lib/notifications'
import { detectarNovoPR } from '../lib/records'
import type { WorkoutSession } from '../types'
import type { RecordeExercicio } from '../lib/records'

interface UseCompleteWorkoutSetParams {
  session: WorkoutSession | null
  currentExerciseIndex: number
  recordes: Map<string, RecordeExercicio>
  saveWeightsToPlan: (exIdx?: number) => void
  markSetCompleted: (exercicioIdx: number, serieIdx: number) => void
  updateSet: (
    exercicioIdx: number,
    serieIdx: number,
    dados: Partial<{ repeticoes: number; peso: number; completada: boolean }>
  ) => void
  startRest: (segundos: number) => void
  nextExercise: () => void
  previousExercise: () => void
  stopRest: () => void
  cancelRestNotification: () => void
  restEndedNaturalRef: React.MutableRefObject<boolean>
  onPrDetected?: () => void
  onWorkoutComplete?: () => void
}

export function useCompleteWorkoutSet({
  session,
  currentExerciseIndex,
  recordes,
  saveWeightsToPlan,
  markSetCompleted,
  updateSet,
  startRest,
  nextExercise,
  previousExercise,
  stopRest,
  cancelRestNotification,
  restEndedNaturalRef,
  onPrDetected,
  onWorkoutComplete,
}: UseCompleteWorkoutSetParams) {
  const prExibidoRef = useRef<Map<string, number>>(new Map())

  const handleCompleteSet = useCallback(
    (serieIdx: number) => {
      const currentExercise = session?.exercicios[currentExerciseIndex]
      if (!currentExercise || !session) return
      const serie = currentExercise.series[serieIdx]
      const newlyCompleted = !serie.completada

      if (newlyCompleted) {
        markSetCompleted(currentExerciseIndex, serieIdx)
        setTimeout(() => saveWeightsToPlan(), 0)

        const currentSet = currentExercise.series[serieIdx]
        const exId = currentExercise.exercicioId
        const pesoCelebrado = prExibidoRef.current.get(exId) ?? 0
        if (currentSet.peso > pesoCelebrado) {
          const prCheck = detectarNovoPR(
            { ...currentSet, completada: true },
            exId,
            recordes,
          )
          if (prCheck && prCheck.tipo === 'peso') {
            prExibidoRef.current.set(exId, currentSet.peso)
            onPrDetected?.()
          }
        }

        prepararAudio()

        const isInGroup = !!currentExercise.agrupamentoId
        const groupExercises = isInGroup
          ? session.exercicios
              .map((ex, idx) => ({ ex, idx }))
              .filter(({ ex }) => ex.agrupamentoId === currentExercise.agrupamentoId)
          : []
        const currentGroupPos = groupExercises.findIndex(
          (g) => g.idx === currentExerciseIndex
        )
        const nextInGroup =
          currentGroupPos >= 0 && currentGroupPos < groupExercises.length - 1
            ? groupExercises[currentGroupPos + 1]
            : null

        const allSetsInExerciseComplete = currentExercise.series.every((s, i) =>
          i === serieIdx ? true : s.completada
        )

        if (allSetsInExerciseComplete && isInGroup && nextInGroup) {
          setTimeout(() => {
            const target = nextInGroup.idx
            const diff = target - currentExerciseIndex
            for (let i = 0; i < diff; i++) nextExercise()
          }, 600)
        } else if (allSetsInExerciseComplete && isInGroup && !nextInGroup) {
          prepararAudio()
          startRest(currentExercise.descansoSegundos)
          const allGroupDone = groupExercises.every(({ idx }) =>
            session.exercicios[idx].series.every((s, i) =>
              idx === currentExerciseIndex
                ? i === serieIdx
                  ? true
                  : s.completada
                : s.completada
            )
          )
          if (allGroupDone) {
            const lastGroupIdx = groupExercises[groupExercises.length - 1].idx
            const isLastExercise =
              lastGroupIdx === session.exercicios.length - 1
            if (!isLastExercise) {
              setTimeout(() => {
                const target = lastGroupIdx + 1
                const diff = target - currentExerciseIndex
                for (let i = 0; i < diff; i++) nextExercise()
              }, 800)
            } else {
              const wholeWorkoutComplete = session.exercicios.every((ex, eIdx) =>
                ex.series.every((s, i) =>
                  eIdx === currentExerciseIndex && i === serieIdx
                    ? true
                    : s.completada
                )
              )
              if (wholeWorkoutComplete) {
                setTimeout(() => onWorkoutComplete?.(), 800)
              }
            }
          } else {
            setTimeout(() => {
              const target = groupExercises[0].idx
              const diff = currentExerciseIndex - target
              for (let i = 0; i < diff; i++) previousExercise()
            }, 800)
          }
        } else {
          prepararAudio()
          startRest(currentExercise.descansoSegundos)

          const isLastExercise =
            currentExerciseIndex === session.exercicios.length - 1
          if (allSetsInExerciseComplete) {
            if (!isLastExercise) {
              setTimeout(() => nextExercise(), 800)
            } else {
              const wholeWorkoutComplete = session.exercicios.every((ex, eIdx) => {
                if (eIdx === currentExerciseIndex) {
                  return ex.series.every((s, i) =>
                    i === serieIdx ? true : s.completada
                  )
                }
                return ex.series.every((s) => s.completada)
              })
              if (wholeWorkoutComplete) {
                setTimeout(() => onWorkoutComplete?.(), 800)
              }
            }
          }
        }
      } else {
        updateSet(currentExerciseIndex, serieIdx, { completada: false })
        restEndedNaturalRef.current = false
        cancelRestNotification()
        stopRest()
      }
    },
    [
      session,
      currentExerciseIndex,
      recordes,
      saveWeightsToPlan,
      markSetCompleted,
      updateSet,
      startRest,
      nextExercise,
      previousExercise,
      stopRest,
      cancelRestNotification,
      restEndedNaturalRef,
      onPrDetected,
      onWorkoutComplete,
    ]
  )

  return { handleCompleteSet }
}
