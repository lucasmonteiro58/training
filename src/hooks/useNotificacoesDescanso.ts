import { useRef, useEffect } from 'react'
import type { SessaoDeTreino } from '../types'
import {
  enviarNotificacaoTreino,
  limparNotificacoesTreino,
  agendarNotificacaoDescanso,
  tocarAlertaDescanso,
  vibrarDescansoFim,
  onSwMessage,
} from '../lib/notifications'

interface UseNotificacoesDescansoParams {
  cronometroDescansoAtivo: boolean
  cronometroDescansoSegundos: number
  sessao: SessaoDeTreino | null
  exercicioAtualIndex: number
}

export function useNotificacoesDescanso({
  cronometroDescansoAtivo,
  cronometroDescansoSegundos,
  sessao,
  exercicioAtualIndex,
}: UseNotificacoesDescansoParams) {
  const descansoAcabouNaturalRef = useRef(false)

  useEffect(() => {
    if (cronometroDescansoAtivo && sessao) {
      const ex = sessao.exercicios[exercicioAtualIndex]
      descansoAcabouNaturalRef.current = true

      enviarNotificacaoTreino(
        `⏱ Descanso – ${cronometroDescansoSegundos}s`,
        `Próximo: ${ex?.exercicioNome ?? ''}`,
      )

      agendarNotificacaoDescanso(cronometroDescansoSegundos, ex?.exercicioNome)
    }

    if (!cronometroDescansoAtivo) {
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
