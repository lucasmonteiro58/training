import { useRef, useEffect } from 'react'
import type { WorkoutSession } from '../types'
import {
  clearWorkoutNotifications,
  scheduleRestNotification,
  playRestAlert,
  vibrateRestEnd,
  onSwMessage,
} from '../lib/notifications'

interface UseRestNotificationsParams {
  restTimerActive: boolean
  restTimerSeconds: number
  session: WorkoutSession | null
  currentExerciseIndex: number
}

export function useRestNotifications({
  restTimerActive,
  restTimerSeconds,
  session,
  currentExerciseIndex,
}: UseRestNotificationsParams) {
  const restEndedNaturalRef = useRef(false)
  const restEndScheduledRef = useRef(false)

  useEffect(() => {
    if (restTimerActive && session) {
      const ex = session.exercises[currentExerciseIndex]
      restEndedNaturalRef.current = true

      if (!restEndScheduledRef.current) {
        restEndScheduledRef.current = true
        scheduleRestNotification(restTimerSeconds, ex?.exerciseName)
      }
    }

    if (!restTimerActive) {
      restEndScheduledRef.current = false
      if (restEndedNaturalRef.current) {
        playRestAlert()
        vibrateRestEnd()
        restEndedNaturalRef.current = false
      }
      clearWorkoutNotifications()
    }
  }, [restTimerActive, restTimerSeconds, session, currentExerciseIndex])

  useEffect(() => {
    return onSwMessage((msg) => {
      if (msg?.type === 'REST_ENDED') {
        playRestAlert()
        vibrateRestEnd()
      }
    })
  }, [])

  useEffect(() => {
    if (
      restTimerActive &&
      restTimerSeconds > 0 &&
      restTimerSeconds <= 5
    ) {
      navigator.vibrate?.(restTimerSeconds === 1 ? [150, 50, 150] : [80])
    }
  }, [restTimerSeconds, restTimerActive])

  return { restEndedNaturalRef }
}
