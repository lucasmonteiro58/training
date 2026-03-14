import { useRef, useEffect } from 'react'
import type { WorkoutSession } from '../types'
import {
  limparNotificacoesTreino,
  agendarNotificacaoDescanso,
  tocarAlertaDescanso,
  vibrarDescansoFim,
  onSwMessage,
} from '../lib/notifications'

interface UseNotificacoesDescansoParams {
  cronometroDescansoAtivo: boolean
  cronometroDescansoSegundos: number
  sessao: WorkoutSession | null
  exercicioAtualIndex: number
}

export function useRestNotifications({
  cronometroDescansoAtivo,
  cronometroDescansoSegundos,
  sessao,
  exercicioAtualIndex,
}: UseNotificacoesDescansoParams) {
  const descansoAcabouNaturalRef = useRef(false)
  const restEndAgendadoRef = useRef(false)

  useEffect(() => {
    if (cronometroDescansoAtivo && sessao) {
      const ex = sessao.exercicios[exercicioAtualIndex]
      descansoAcabouNaturalRef.current = true

      // Agenda uma única notificação para quando o descanso terminar (não a cada segundo)
      if (!restEndAgendadoRef.current) {
        restEndAgendadoRef.current = true
        agendarNotificacaoDescanso(cronometroDescansoSegundos, ex?.exercicioNome)
      }
    }

    if (!cronometroDescansoAtivo) {
      restEndAgendadoRef.current = false
      if (descansoAcabouNaturalRef.current) {
        tocarAlertaDescanso()
        vibrarDescansoFim()
        descansoAcabouNaturalRef.current = false
      }
      limparNotificacoesTreino()
    }
  }, [cronometroDescansoAtivo, cronometroDescansoSegundos, sessao, exercicioAtualIndex])

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
      cronometroDescansoAtivo &&
      cronometroDescansoSegundos > 0 &&
      cronometroDescansoSegundos <= 5
    ) {
      navigator.vibrate?.(cronometroDescansoSegundos === 1 ? [150, 50, 150] : [80])
    }
  }, [cronometroDescansoSegundos, cronometroDescansoAtivo])

  return { descansoAcabouNaturalRef }
}
