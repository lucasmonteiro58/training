import { useRef, useCallback } from 'react'
import { prepareAudio } from '../lib/notifications'
import { detectNewPR } from '../lib/records'
import type { WorkoutSession } from '../types'
import type { ExerciseRecord } from '../lib/records'

interface UseCompleteWorkoutSetParams {
  session: WorkoutSession | null
  currentExerciseIndex: number
  records: Map<string, ExerciseRecord>
  saveWeightsToPlan: (exIdx?: number) => void
  markSetCompleted: (exerciseIdx: number, setIdx: number) => void
  updateSet: (
    exerciseIdx: number,
    setIdx: number,
    data: Partial<{ reps: number; weight: number; completed: boolean }>
  ) => void
  startRest: (seconds: number) => void
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
  records,
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
  const prDisplayedRef = useRef<Map<string, number>>(new Map())

  const handleCompleteSet = useCallback(
    (setIdx: number) => {
      const currentExercise = session?.exercises[currentExerciseIndex]
      if (!currentExercise || !session) return
      const set = currentExercise.sets[setIdx]
      const newlyCompleted = !set.completed

      if (newlyCompleted) {
        markSetCompleted(currentExerciseIndex, setIdx)
        setTimeout(() => saveWeightsToPlan(), 0)

        const currentSet = currentExercise.sets[setIdx]
        const exId = currentExercise.exerciseId
        const celebratedWeight = prDisplayedRef.current.get(exId) ?? 0
        if (currentSet.weight > celebratedWeight) {
          const prCheck = detectNewPR(
            { ...currentSet, completed: true },
            exId,
            records,
          )
          if (prCheck && prCheck.type === 'peso') {
            prDisplayedRef.current.set(exId, currentSet.weight)
            onPrDetected?.()
          }
        }

        prepareAudio()

        const isInGroup = !!currentExercise.groupingId
        const groupExercises = isInGroup
          ? session.exercises
              .map((ex, idx) => ({ ex, idx }))
              .filter(({ ex }) => ex.groupingId === currentExercise.groupingId)
          : []
        const currentGroupPos = groupExercises.findIndex(
          (g) => g.idx === currentExerciseIndex
        )
        const nextInGroup =
          currentGroupPos >= 0 && currentGroupPos < groupExercises.length - 1
            ? groupExercises[currentGroupPos + 1]
            : null

        const allSetsInExerciseComplete = currentExercise.sets.every((s, i) =>
          i === setIdx ? true : s.completed
        )

        if (allSetsInExerciseComplete && isInGroup && nextInGroup) {
          setTimeout(() => {
            const target = nextInGroup.idx
            const diff = target - currentExerciseIndex
            for (let i = 0; i < diff; i++) nextExercise()
          }, 600)
        } else if (allSetsInExerciseComplete && isInGroup && !nextInGroup) {
          prepareAudio()
          startRest(currentExercise.restSeconds)
          const allGroupDone = groupExercises.every(({ idx }) =>
            session.exercises[idx].sets.every((s, i) =>
              idx === currentExerciseIndex
                ? i === setIdx
                  ? true
                  : s.completed
                : s.completed
            )
          )
          if (allGroupDone) {
            const lastGroupIdx = groupExercises[groupExercises.length - 1].idx
            const isLastExercise =
              lastGroupIdx === session.exercises.length - 1
            if (!isLastExercise) {
              setTimeout(() => {
                const target = lastGroupIdx + 1
                const diff = target - currentExerciseIndex
                for (let i = 0; i < diff; i++) nextExercise()
              }, 800)
            } else {
              const wholeWorkoutComplete = session.exercises.every((ex, eIdx) =>
                ex.sets.every((s, i) =>
                  eIdx === currentExerciseIndex && i === setIdx
                    ? true
                    : s.completed
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
          prepareAudio()
          startRest(currentExercise.restSeconds)

          const isLastExercise =
            currentExerciseIndex === session.exercises.length - 1
          if (allSetsInExerciseComplete) {
            if (!isLastExercise) {
              setTimeout(() => nextExercise(), 800)
            } else {
              const wholeWorkoutComplete = session.exercises.every((ex, eIdx) => {
                if (eIdx === currentExerciseIndex) {
                  return ex.sets.every((s, i) =>
                    i === setIdx ? true : s.completed
                  )
                }
                return ex.sets.every((s) => s.completed)
              })
              if (wholeWorkoutComplete) {
                setTimeout(() => onWorkoutComplete?.(), 800)
              }
            }
          }
        }
      } else {
        updateSet(currentExerciseIndex, setIdx, { completed: false })
        restEndedNaturalRef.current = false
        cancelRestNotification()
        stopRest()
      }
    },
    [
      session,
      currentExerciseIndex,
      records,
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
