import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SessaoDeTreino } from '../types'
import { syncProgressoTreinoParaFirestore, limparProgressoTreinoFirestore } from '../lib/firestore/sync'
import type { SnapshotAutoEncerrado } from './historicoStore'

export function calcularVolume(sessao: SessaoDeTreino): number {
  return sessao.exercicios.reduce((total, ex) => {
    return (
      total +
      ex.series
        .filter(s => s.completada)
        .reduce((sum, s) => sum + s.peso * s.repeticoes, 0)
    )
  }, 0)
}

export const INATIVIDADE_AUTO_ENCERRAR_MS = 20 * 60 * 1000 // 20 minutos

export interface TreinoAtivoStoreState {
  sessao: SessaoDeTreino | null
  exercicioAtualIndex: number
  serieAtualIndex: number
  cronometroGeralSegundos: number
  cronometroDescansoSegundos: number
  cronometroDescansoAtivo: boolean
  pausado: boolean
  iniciado: boolean
  tempoPausadoTotal: number
  ultimaPausaRecordada: number | null
  timestampDescansoFim: number | null
  ultimaSerieCompletada: { exercicioIdx: number; serieIdx: number } | null
  iniciarTreino: (sessao: SessaoDeTreino) => void
  finalizarTreino: () => SessaoDeTreino | null
  pausarTreino: () => void
  retomar: () => void
  proximoExercicio: () => void
  exercicioAnterior: () => void
  atualizarSerie: (
    exercicioIdx: number,
    serieIdx: number,
    dados: Partial<{ repeticoes: number; peso: number; completada: boolean }>
  ) => void
  marcarSerieCompletada: (exercicioIdx: number, serieIdx: number) => void
  desfazerUltimaSerie: () => void
  iniciarDescanso: (segundos: number) => void
  pararDescanso: () => void
  tickGeral: () => void
  tickDescanso: () => void
  atualizarCronometroGeral: (segundos: number) => void
  restaurarDeExterno: (dados: {
    sessao: SessaoDeTreino
    exercicioAtualIndex: number
    serieAtualIndex: number
    pausado?: boolean
    tempoPausadoTotal?: number
    ultimaPausaRecordada?: number | null
    timestampDescansoFim?: number | null
    cronometroGeralSegundos?: number
  }) => void
  sincronizarEstadoExterno: (dados: {
    sessao: SessaoDeTreino
    exercicioAtualIndex: number
    serieAtualIndex: number
    pausado: boolean
    tempoPausadoTotal?: number
    ultimaPausaRecordada?: number | null
    timestampDescansoFim?: number | null
  }) => void
  atualizarNotas: (notas: string) => void
  limparLocal: () => void
  restaurarDeAutoEncerrado: (snapshot: SnapshotAutoEncerrado) => void
  heartbeat: () => void
  restaurarDeHistorico: (sessao: SessaoDeTreino) => void
}

const syncAtivo = (state: TreinoAtivoStoreState) => {
  if (state.iniciado && state.sessao?.userId && state.sessao) {
    syncProgressoTreinoParaFirestore(state.sessao.userId, {
      sessao: state.sessao,
      exercicioAtualIndex: state.exercicioAtualIndex,
      serieAtualIndex: state.serieAtualIndex,
      iniciado: state.iniciado,
      pausado: state.pausado,
      tempoPausadoTotal: state.tempoPausadoTotal,
      ultimaPausaRecordada: state.ultimaPausaRecordada,
      timestampDescansoFim: state.timestampDescansoFim,
      cronometroGeralSegundos: state.cronometroGeralSegundos,
      updatedAt: Date.now(),
    })
  }
}

export const useTreinoAtivoStore = create<TreinoAtivoStoreState>()(
  persist(
    (set, get) => ({
      sessao: null,
      exercicioAtualIndex: 0,
      serieAtualIndex: 0,
      cronometroGeralSegundos: 0,
      cronometroDescansoSegundos: 0,
      cronometroDescansoAtivo: false,
      pausado: false,
      iniciado: false,
      tempoPausadoTotal: 0,
      ultimaPausaRecordada: null,
      timestampDescansoFim: null,
      ultimaSerieCompletada: null,

      iniciarTreino: sessao => {
        set({
          sessao,
          exercicioAtualIndex: 0,
          serieAtualIndex: 0,
          cronometroGeralSegundos: 0,
          cronometroDescansoSegundos: 0,
          cronometroDescansoAtivo: false,
          pausado: false,
          iniciado: true,
          tempoPausadoTotal: 0,
          ultimaPausaRecordada: null,
          timestampDescansoFim: null,
          ultimaSerieCompletada: null,
        })
        syncAtivo(get())
      },

      finalizarTreino: () => {
        const { sessao, cronometroGeralSegundos } = get()
        if (!sessao) return null
        const userId = sessao.userId
        const finalizada: SessaoDeTreino = {
          ...sessao,
          finalizadoEm: Date.now(),
          duracaoSegundos: cronometroGeralSegundos,
          volumeTotal: calcularVolume(sessao),
        }
        set({
          sessao: null,
          iniciado: false,
          exercicioAtualIndex: 0,
          serieAtualIndex: 0,
          cronometroGeralSegundos: 0,
          cronometroDescansoAtivo: false,
          tempoPausadoTotal: 0,
          ultimaPausaRecordada: null,
          timestampDescansoFim: null,
          ultimaSerieCompletada: null,
        })
        if (userId) limparProgressoTreinoFirestore(userId)
        return finalizada
      },

      pausarTreino: () => {
        set({ pausado: true, ultimaPausaRecordada: Date.now() })
        syncAtivo(get())
      },
      retomar: () => {
        set(s => {
          const pausaRecente = s.ultimaPausaRecordada ? Date.now() - s.ultimaPausaRecordada : 0
          return {
            pausado: false,
            tempoPausadoTotal: s.tempoPausadoTotal + pausaRecente,
            ultimaPausaRecordada: null,
          }
        })
        syncAtivo(get())
      },

      proximoExercicio: () => {
        set(s => {
          const total = s.sessao?.exercicios.length ?? 0
          const next = Math.min(s.exercicioAtualIndex + 1, total - 1)
          return { exercicioAtualIndex: next, serieAtualIndex: 0 }
        })
        syncAtivo(get())
      },

      exercicioAnterior: () => {
        set(s => ({
          exercicioAtualIndex: Math.max(0, s.exercicioAtualIndex - 1),
          serieAtualIndex: 0,
        }))
        syncAtivo(get())
      },

      atualizarSerie: (exercicioIdx, serieIdx, dados) => {
        set(s => {
          if (!s.sessao) return {}
          const exercicios = s.sessao.exercicios.map((ex, eIdx) => {
            if (eIdx !== exercicioIdx) return ex
            return {
              ...ex,
              series: ex.series.map((serie, sIdx) => {
                if (sIdx !== serieIdx) return serie
                return { ...serie, ...dados }
              }),
            }
          })
          return { sessao: { ...s.sessao, exercicios } }
        })
        syncAtivo(get())
      },

      marcarSerieCompletada: (exercicioIdx, serieIdx) => {
        set(s => {
          if (!s.sessao) return {}
          const exercicios = s.sessao.exercicios.map((ex, eIdx) => {
            if (eIdx !== exercicioIdx) return ex
            return {
              ...ex,
              series: ex.series.map((serie, sIdx) => {
                if (sIdx !== serieIdx) return serie
                return { ...serie, completada: true }
              }),
            }
          })
          return {
            sessao: { ...s.sessao, exercicios },
            ultimaSerieCompletada: { exercicioIdx, serieIdx },
          }
        })
        syncAtivo(get())
      },

      desfazerUltimaSerie: () => {
        const { ultimaSerieCompletada } = get()
        if (!ultimaSerieCompletada) return
        const { exercicioIdx, serieIdx } = ultimaSerieCompletada
        set(s => {
          if (!s.sessao) return {}
          const exercicios = s.sessao.exercicios.map((ex, eIdx) => {
            if (eIdx !== exercicioIdx) return ex
            return {
              ...ex,
              series: ex.series.map((serie, sIdx) => {
                if (sIdx !== serieIdx) return serie
                return { ...serie, completada: false }
              }),
            }
          })
          return {
            sessao: { ...s.sessao, exercicios },
            ultimaSerieCompletada: null,
            cronometroDescansoAtivo: false,
            cronometroDescansoSegundos: 0,
            timestampDescansoFim: null,
          }
        })
        syncAtivo(get())
      },

      iniciarDescanso: segundos => {
        set({
          cronometroDescansoSegundos: segundos,
          cronometroDescansoAtivo: true,
          timestampDescansoFim: Date.now() + segundos * 1000,
        })
        syncAtivo(get())
      },

      pararDescanso: () => {
        set({
          cronometroDescansoAtivo: false,
          cronometroDescansoSegundos: 0,
          timestampDescansoFim: null,
        })
        syncAtivo(get())
      },

      tickGeral: () =>
        set(s => {
          if (!s.iniciado || !s.sessao) return {}

          const agora = Date.now()
          let tempoPausadoAcumulado = s.tempoPausadoTotal

          if (s.pausado && s.ultimaPausaRecordada) {
            tempoPausadoAcumulado += agora - s.ultimaPausaRecordada
          }

          const tempoAtivoMs = agora - s.sessao.iniciadoEm - tempoPausadoAcumulado
          const novosSegundos = Math.max(0, Math.floor(tempoAtivoMs / 1000))

          if (novosSegundos === s.cronometroGeralSegundos) return {}
          return { cronometroGeralSegundos: novosSegundos }
        }),

      tickDescanso: () =>
        set(s => {
          if (!s.cronometroDescansoAtivo || !s.timestampDescansoFim) return {}
          const agora = Date.now()
          const restante = Math.ceil((s.timestampDescansoFim - agora) / 1000)

          if (restante <= 0)
            return {
              cronometroDescansoSegundos: 0,
              cronometroDescansoAtivo: false,
              timestampDescansoFim: null,
            }
          return { cronometroDescansoSegundos: restante }
        }),

      atualizarCronometroGeral: segundos => set({ cronometroGeralSegundos: segundos }),

      restaurarDeExterno: dados =>
        set({
          sessao: dados.sessao,
          exercicioAtualIndex: dados.exercicioAtualIndex ?? 0,
          serieAtualIndex: dados.serieAtualIndex ?? 0,
          pausado: dados.pausado ?? false,
          tempoPausadoTotal: dados.tempoPausadoTotal ?? 0,
          ultimaPausaRecordada: dados.ultimaPausaRecordada ?? null,
          timestampDescansoFim: dados.timestampDescansoFim ?? null,
          cronometroDescansoAtivo:
            dados.timestampDescansoFim != null && dados.timestampDescansoFim > Date.now(),
          iniciado: true,
          cronometroGeralSegundos: dados.cronometroGeralSegundos ?? 0,
          cronometroDescansoSegundos: 0,
        }),

      sincronizarEstadoExterno: dados =>
        set({
          sessao: dados.sessao,
          exercicioAtualIndex: dados.exercicioAtualIndex ?? 0,
          serieAtualIndex: dados.serieAtualIndex ?? 0,
          pausado: dados.pausado ?? false,
          tempoPausadoTotal: dados.tempoPausadoTotal ?? 0,
          ultimaPausaRecordada: dados.ultimaPausaRecordada ?? null,
          timestampDescansoFim: dados.timestampDescansoFim ?? null,
          cronometroDescansoAtivo:
            dados.timestampDescansoFim != null && dados.timestampDescansoFim > Date.now(),
        }),

      atualizarNotas: notas => {
        set(s => {
          if (!s.sessao) return {}
          return { sessao: { ...s.sessao, notas } }
        })
        syncAtivo(get())
      },

      limparLocal: () =>
        set({
          sessao: null,
          iniciado: false,
          exercicioAtualIndex: 0,
          serieAtualIndex: 0,
          cronometroGeralSegundos: 0,
          cronometroDescansoSegundos: 0,
          cronometroDescansoAtivo: false,
          tempoPausadoTotal: 0,
          ultimaPausaRecordada: null,
          timestampDescansoFim: null,
          ultimaSerieCompletada: null,
        }),

      restaurarDeAutoEncerrado: snapshot => {
        const tempoOciosoSegundos = Math.floor(INATIVIDADE_AUTO_ENCERRAR_MS / 1000)
        const cronometroAtivo = Math.max(0, snapshot.cronometroGeralSegundos - tempoOciosoSegundos)
        const sessaoAtiva = {
          ...snapshot.sessao,
          finalizadoEm: undefined,
          duracaoSegundos: undefined,
          tempoOciosoDescontadoSegundos: undefined,
          autoEncerrado: undefined,
        }
        set({
          sessao: sessaoAtiva,
          exercicioAtualIndex: snapshot.exercicioAtualIndex,
          serieAtualIndex: snapshot.serieAtualIndex,
          cronometroGeralSegundos: cronometroAtivo,
          cronometroDescansoSegundos: 0,
          cronometroDescansoAtivo: false,
          pausado: false,
          tempoPausadoTotal: 0,
          ultimaPausaRecordada: null,
          timestampDescansoFim: null,
          ultimaSerieCompletada: null,
          iniciado: true,
        })
        syncAtivo(get())
      },

      heartbeat: () => {
        syncAtivo(get())
      },

      restaurarDeHistorico: sessao => {
        const duracaoSegundos = sessao.duracaoSegundos ?? 0
        const sessaoAtiva = {
          ...sessao,
          finalizadoEm: undefined,
          duracaoSegundos: undefined,
          autoEncerrado: undefined,
        }
        set({
          sessao: sessaoAtiva,
          exercicioAtualIndex: 0,
          serieAtualIndex: 0,
          cronometroGeralSegundos: duracaoSegundos,
          cronometroDescansoSegundos: 0,
          cronometroDescansoAtivo: false,
          pausado: false,
          tempoPausadoTotal: 0,
          ultimaPausaRecordada: null,
          timestampDescansoFim: null,
          ultimaSerieCompletada: null,
          iniciado: true,
        })
        syncAtivo(get())
      },
    }),
    {
      name: 'training-treino-ativo',
      partialize: s => ({
        sessao: s.sessao,
        exercicioAtualIndex: s.exercicioAtualIndex,
        serieAtualIndex: s.serieAtualIndex,
        cronometroGeralSegundos: s.cronometroGeralSegundos,
        iniciado: s.iniciado,
        pausado: s.pausado,
        tempoPausadoTotal: s.tempoPausadoTotal,
        ultimaPausaRecordada: s.ultimaPausaRecordada,
        timestampDescansoFim: s.timestampDescansoFim,
      }),
    }
  )
)
