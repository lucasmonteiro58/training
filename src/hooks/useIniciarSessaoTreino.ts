import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { solicitarPermissaoNotificacao } from '../lib/notifications'
import type { PlanoDeTreino, SessaoDeTreino, SerieRegistrada, ExercicioNaSessao } from '../types'

interface UseIniciarSessaoTreinoParams {
  planoId: string
  plano: PlanoDeTreino | undefined
  user: { uid: string } | null
  sessoes: SessaoDeTreino[]
  iniciado: boolean
  sessao: SessaoDeTreino | null
  iniciarTreino: (sessao: SessaoDeTreino) => void
}

export function useIniciarSessaoTreino({
  planoId,
  plano,
  user,
  sessoes,
  iniciado,
  sessao,
  iniciarTreino,
}: UseIniciarSessaoTreinoParams) {
  useEffect(() => {
    if (!plano || !user) return
    if (iniciado && sessao?.planoId === planoId) return

    const ultimaSessao = sessoes
      .filter((s) => s.planoId === planoId && s.finalizadoEm)
      .sort((a, b) => (b.finalizadoEm ?? 0) - (a.finalizadoEm ?? 0))[0]

    const exerciciosNaSessao: ExercicioNaSessao[] = plano.exercicios.map((ex) => {
      const exUltimaSessao = ultimaSessao?.exercicios.find(
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
          const pesoSessao = exUltimaSessao?.series[i]?.peso
          const repsSessao = exUltimaSessao?.series[i]?.repeticoes
          return {
            id: uuidv4(),
            ordem: i,
            repeticoes: repsPlano || repsSessao || ex.repeticoesMeta,
            peso: pesoPlano || pesoSessao || (ex.pesoMeta ?? 0),
            completada: false,
          } as SerieRegistrada
        }),
      }
    })

    const novaSessao: SessaoDeTreino = {
      id: uuidv4(),
      userId: user.uid,
      planoId: plano.id,
      planoNome: plano.nome,
      iniciadoEm: Date.now(),
      exercicios: exerciciosNaSessao,
    }
    iniciarTreino(novaSessao)
    solicitarPermissaoNotificacao()
  }, [plano, user, planoId, sessoes, iniciado, sessao?.planoId, iniciarTreino])
}
