import { useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { solicitarPermissaoNotificacao } from '../lib/notifications'
import type { WorkoutPlan, WorkoutSession, RecordedSet, ExerciseInSession } from '../types'

interface UseStartWorkoutSessionParams {
  planId: string
  plano: WorkoutPlan | undefined
  user: { uid: string } | null
  sessions: WorkoutSession[]
  iniciado: boolean
  sessao: WorkoutSession | null
  iniciarTreino: (sessao: WorkoutSession) => void
}

export function useStartWorkoutSession({
  planId,
  plano,
  user,
  sessions,
  iniciado,
  sessao,
  iniciarTreino,
}: UseStartWorkoutSessionParams) {
  const startedForPlanoIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!plano || !user) return

    if (iniciado && sessao?.planId === planId) {
      startedForPlanoIdRef.current = planId
      return
    }
    // Trocar de plano: permitir iniciar sessão para o novo plano
    if (startedForPlanoIdRef.current !== null && startedForPlanoIdRef.current !== planId) {
      startedForPlanoIdRef.current = null
    }
    // Não re-iniciar sessão após cancelar/finalizar: já tratamos este plano nesta visita
    if (startedForPlanoIdRef.current === planId) return

    const lastSession = sessions
      .filter((s) => s.planId === planId && s.finishedAt)
      .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))[0]

    const exercisesInSession: ExerciseInSession[] = plano.exercises.map((ex) => {
      const exLastSession = lastSession?.exercises.find(
        (e) => e.exerciseId === ex.exerciseId
      )
      return {
        exerciseId: ex.exerciseId,
        exerciseName: ex.exercise.name,
        gifUrl: ex.exercise.gifUrl,
        muscleGroup: ex.exercise.muscleGroup,
        restSeconds: ex.restSeconds,
        order: ex.order,
        notes: ex.notes,
        instructions: ex.exercise.instructions,
        setType: ex.setType,
        targetDurationSeconds: ex.targetDurationSeconds,
        groupingId: ex.groupingId,
        groupingType: ex.groupingType,
        sets: Array.from({ length: ex.series }, (_, i) => {
          const weightPlan = ex.setsDetail?.[i]?.weight
          const repsPlan = ex.setsDetail?.[i]?.reps
          const weightSession = exLastSession?.sets[i]?.weight
          const repsSession = exLastSession?.sets[i]?.reps
          return {
            id: uuidv4(),
            order: i,
            reps: repsPlan || repsSession || ex.targetReps,
            weight: weightPlan || weightSession || (ex.targetWeight ?? 0),
            completed: false,
          } as RecordedSet
        }),
      }
    })

    const newSession: WorkoutSession = {
      id: uuidv4(),
      userId: user.uid,
      planId: plano.id,
      planName: plano.name,
      startedAt: Date.now(),
      exercises: exercisesInSession,
    }
    iniciarTreino(newSession)
    startedForPlanoIdRef.current = planId
    solicitarPermissaoNotificacao()
  }, [plano, user, planId, sessions, iniciado, sessao?.planId, iniciarTreino])
}
