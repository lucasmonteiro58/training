import { useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { requestNotificationPermission } from '../lib/notifications'
import type { WorkoutPlan, WorkoutSession, RecordedSet, ExerciseInSession } from '../types'

interface UseStartWorkoutSessionParams {
  planId: string
  plan: WorkoutPlan | undefined
  user: { uid: string } | null
  sessions: WorkoutSession[]
  started: boolean
  session: WorkoutSession | null
  startWorkout: (session: WorkoutSession) => void
}

export function useStartWorkoutSession({
  planId,
  plan,
  user,
  sessions,
  started,
  session,
  startWorkout,
}: UseStartWorkoutSessionParams) {
  const startedForPlanIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!plan || !user) return
    if (!plan.exercises?.length) return

    if (started && session?.planId === planId) {
      startedForPlanIdRef.current = planId
      return
    }
    if (startedForPlanIdRef.current !== null && startedForPlanIdRef.current !== planId) {
      startedForPlanIdRef.current = null
    }
    if (startedForPlanIdRef.current === planId) return

    const lastSession = sessions
      .filter((s) => s.planId === planId && s.finishedAt)
      .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))[0]

    const exercisesInSession: ExerciseInSession[] = plan.exercises.map((ex) => {
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
      planId: plan.id,
      planName: plan.name,
      startedAt: Date.now(),
      exercises: exercisesInSession,
    }
    startWorkout(newSession)
    startedForPlanIdRef.current = planId
    requestNotificationPermission()
  }, [plan, user, planId, sessions, started, session?.planId, startWorkout])
}
