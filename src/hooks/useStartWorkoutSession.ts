import { useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { solicitarPermissaoNotificacao } from '../lib/notifications'
import type { WorkoutPlan, WorkoutSession, RecordedSet, ExerciseInSession } from '../types'

interface UseStartWorkoutSessionParams {
  planoId: string
  plano: WorkoutPlan | undefined
  user: { uid: string } | null
  sessions: WorkoutSession[]
  iniciado: boolean
  sessao: WorkoutSession | null
  iniciarTreino: (sessao: WorkoutSession) => void
}

export function useStartWorkoutSession({
  planoId,
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

    if (iniciado && sessao?.planoId === planoId) {
      startedForPlanoIdRef.current = planoId
      return
    }
    // Trocar de plano: permitir iniciar sessão para o novo plano
    if (startedForPlanoIdRef.current !== null && startedForPlanoIdRef.current !== planoId) {
      startedForPlanoIdRef.current = null
    }
    // Não re-iniciar sessão após cancelar/finalizar: já tratamos este plano nesta visita
    if (startedForPlanoIdRef.current === planoId) return

    const lastSession = sessions
      .filter((s) => s.planoId === planoId && s.finalizadoEm)
      .sort((a, b) => (b.finalizadoEm ?? 0) - (a.finalizadoEm ?? 0))[0]

    const exerciciosNaSessao: ExerciseInSession[] = plano.exercicios.map((ex) => {
      const exLastSession = lastSession?.exercicios.find(
        (e) => e.exercicioId === ex.exercicioId
      )
      return {
        exercicioId: ex.exercicioId,
        exercicioNome: ex.exercicio.nome,
        gifUrl: ex.exercicio.gifUrl,
        grupoMuscular: ex.exercicio.grupoMuscular,
        descansoSegundos: ex.descansoSegundos,
        ordem: ex.ordem,
        notas: ex.notas,
        instrucoes: ex.exercicio.instrucoes,
        tipoSerie: ex.tipoSerie,
        duracaoMetaSegundos: ex.duracaoMetaSegundos,
        agrupamentoId: ex.agrupamentoId,
        tipoAgrupamento: ex.tipoAgrupamento,
        series: Array.from({ length: ex.series }, (_, i) => {
          const pesoPlano = ex.seriesDetalhadas?.[i]?.peso
          const repsPlano = ex.seriesDetalhadas?.[i]?.repeticoes
          const pesoSessao = exLastSession?.series[i]?.peso
          const repsSessao = exLastSession?.series[i]?.repeticoes
          return {
            id: uuidv4(),
            ordem: i,
            repeticoes: repsPlano || repsSessao || ex.repeticoesMeta,
            peso: pesoPlano || pesoSessao || (ex.pesoMeta ?? 0),
            completada: false,
          } as RecordedSet
        }),
      }
    })

    const novaSessao: WorkoutSession = {
      id: uuidv4(),
      userId: user.uid,
      planoId: plano.id,
      planoNome: plano.nome,
      iniciadoEm: Date.now(),
      exercicios: exerciciosNaSessao,
    }
    iniciarTreino(novaSessao)
    startedForPlanoIdRef.current = planoId
    solicitarPermissaoNotificacao()
  }, [plano, user, planoId, sessions, iniciado, sessao?.planoId, iniciarTreino])
}
