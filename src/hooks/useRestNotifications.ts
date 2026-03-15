import { useRef, useEffect } from 'react'
import type { WorkoutSession } from '../types'
import {
  limparNotificacoesTreino,
  agendarNotificacaoDescanso,
  tocarAlertaDescanso,
  vibrarDescansoFim,
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
  const restEndAgendadoRef = useRef(false)

  useEffect(() => {
    if (restTimerActive && session) {
      const ex = session.exercicios[currentExerciseIndex]
      restEndedNaturalRef.current = true

      if (!restEndAgendadoRef.current) {
        restEndAgendadoRef.current = true
        agendarNotificacaoDescanso(restTimerSeconds, ex?.exercicioNome)
      }
    }

    if (!restTimerActive) {
      restEndAgendadoRef.current = false
      if (restEndedNaturalRef.current) {
        tocarAlertaDescanso()
        vibrarDescansoFim()
        restEndedNaturalRef.current = false
      }
      limparNotificacoesTreino()
    }
  }, [restTimerActive, restTimerSeconds, session, currentExerciseIndex])

  useEffect(() => {
    return onSwMessage((msg) => {
      if (msg?.type === 'REST_ENDED') {
        tocarAlertaDescanso()
        vibrarDescansoFim()
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
