import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from 'firebase/auth'
import type { PlanoDeTreino, SessaoDeTreino } from '../types'
import { syncProgressoTreinoParaFirestore, limparProgressoTreinoFirestore } from '../lib/firestore/sync'

// ============================================================
// Auth Store
// ============================================================
interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}))

// ============================================================
// Planos Store
// ============================================================
interface PlanosState {
  planos: PlanoDeTreino[]
  loading: boolean
  setPlanos: (planos: PlanoDeTreino[]) => void
  addPlano: (plano: PlanoDeTreino) => void
  updatePlano: (plano: PlanoDeTreino) => void
  removePlano: (id: string) => void
  setLoading: (v: boolean) => void
}

export const usePlanosStore = create<PlanosState>((set) => ({
  planos: [],
  loading: true,
  setPlanos: (planos) => set({ planos }),
  addPlano: (plano) => set((s) => ({ planos: [plano, ...s.planos] })),
  updatePlano: (plano) =>
    set((s) => ({ planos: s.planos.map((p) => (p.id === plano.id ? plano : p)) })),
  removePlano: (id) => set((s) => ({ planos: s.planos.filter((p) => p.id !== id) })),
  setLoading: (loading) => set({ loading }),
}))

// Snapshot do treino no momento do auto-encerramento (para opção "Retornar")
export interface SnapshotAutoEncerrado {
  sessao: SessaoDeTreino
  exercicioAtualIndex: number
  serieAtualIndex: number
  cronometroGeralSegundos: number
}

// ============================================================
// Histórico / Sessões Store
// ============================================================
interface HistoricoState {
  sessoes: SessaoDeTreino[]
  loading: boolean
  /** Preenchido quando um treino foi encerrado automaticamente por inatividade (20 min) */
  sessaoAutoEncerrada: SnapshotAutoEncerrado | null
  setSessoes: (sessoes: SessaoDeTreino[]) => void
  addSessao: (sessao: SessaoDeTreino) => void
  removeSessao: (id: string) => void
  setLoading: (v: boolean) => void
  setSessaoAutoEncerrada: (snapshot: SnapshotAutoEncerrado | null) => void
}

export const useHistoricoStore = create<HistoricoState>((set) => ({
  sessoes: [],
  loading: true,
  sessaoAutoEncerrada: null,
  setSessoes: (sessoes) => set({ sessoes }),
  addSessao: (sessao) =>
    set((s) => {
      const exists = s.sessoes.some((x) => x.id === sessao.id)
      const next = exists
        ? s.sessoes.map((x) => (x.id === sessao.id ? sessao : x))
        : [sessao, ...s.sessoes]
      return { sessoes: next.sort((a, b) => b.iniciadoEm - a.iniciadoEm) }
    }),
  removeSessao: (id) => set((s) => ({ sessoes: s.sessoes.filter((s2) => s2.id !== id) })),
  setLoading: (loading) => set({ loading }),
  setSessaoAutoEncerrada: (sessaoAutoEncerrada) => set({ sessaoAutoEncerrada }),
}))

// ============================================================
// Treino Ativo Store — persiste para não perder dados ao fechar
// ============================================================
export interface TreinoAtivoStoreState {
  sessao: SessaoDeTreino | null
  exercicioAtualIndex: number
  serieAtualIndex: number
  cronometroGeralSegundos: number
  cronometroDescansoSegundos: number
  cronometroDescansoAtivo: boolean
  pausado: boolean
  iniciado: boolean
  // Novos campos para precisão baseada em data
  tempoPausadoTotal: number
  ultimaPausaRecordada: number | null
  timestampDescansoFim: number | null
  // Undo
  ultimaSerieCompletada: { exercicioIdx: number; serieIdx: number } | null
  // Ações
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
  /** Restaura um treino que foi auto-encerrado (coloca de volta como ativo e sincroniza) */
  restaurarDeAutoEncerrado: (snapshot: SnapshotAutoEncerrado) => void
  /** Atualiza updatedAt no Firestore (heartbeat para não encerrar por inatividade) */
  heartbeat: () => void
  /** Coloca uma sessão do histórico de volta como treino ativo (para continuar/editando) */
  restaurarDeHistorico: (sessao: SessaoDeTreino) => void
}

export const INATIVIDADE_AUTO_ENCERRAR_MS = 20 * 60 * 1000 // 20 minutos

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

      iniciarTreino: (sessao) => {
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
        set((s) => {
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
        set((s) => {
          const total = s.sessao?.exercicios.length ?? 0
          const next = Math.min(s.exercicioAtualIndex + 1, total - 1)
          return { exercicioAtualIndex: next, serieAtualIndex: 0 }
        })
        syncAtivo(get())
      },

      exercicioAnterior: () => {
        set((s) => ({
          exercicioAtualIndex: Math.max(0, s.exercicioAtualIndex - 1),
          serieAtualIndex: 0,
        }))
        syncAtivo(get())
      },

      atualizarSerie: (exercicioIdx, serieIdx, dados) => {
        set((s) => {
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
        set((s) => {
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
        set((s) => {
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

      iniciarDescanso: (segundos) => {
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
        set((s) => {
          if (!s.iniciado || !s.sessao) return {}

          const agora = Date.now()
          let tempoPausadoAcumulado = s.tempoPausadoTotal

          // Se estiver pausado, somamos o tempo decorrido desde o início da pausa atual
          if (s.pausado && s.ultimaPausaRecordada) {
            tempoPausadoAcumulado += agora - s.ultimaPausaRecordada
          }

          const tempoAtivoMs = agora - s.sessao.iniciadoEm - tempoPausadoAcumulado
          const novosSegundos = Math.max(0, Math.floor(tempoAtivoMs / 1000))

          if (novosSegundos === s.cronometroGeralSegundos) return {}
          return { cronometroGeralSegundos: novosSegundos }
        }),

      tickDescanso: () =>
        set((s) => {
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

      atualizarCronometroGeral: (segundos) => set({ cronometroGeralSegundos: segundos }),

      restaurarDeExterno: (dados) =>
        set({
          sessao: dados.sessao,
          exercicioAtualIndex: dados.exercicioAtualIndex ?? 0,
          serieAtualIndex: dados.serieAtualIndex ?? 0,
          pausado: dados.pausado ?? false,
          tempoPausadoTotal: dados.tempoPausadoTotal ?? 0,
          ultimaPausaRecordada: dados.ultimaPausaRecordada ?? null,
          timestampDescansoFim: dados.timestampDescansoFim ?? null,
          cronometroDescansoAtivo: dados.timestampDescansoFim != null && dados.timestampDescansoFim > Date.now(),
          iniciado: true,
          cronometroGeralSegundos: dados.cronometroGeralSegundos ?? 0,
          cronometroDescansoSegundos: 0,
        }),

      sincronizarEstadoExterno: (dados) =>
        set({
          sessao: dados.sessao,
          exercicioAtualIndex: dados.exercicioAtualIndex ?? 0,
          serieAtualIndex: dados.serieAtualIndex ?? 0,
          pausado: dados.pausado ?? false,
          tempoPausadoTotal: dados.tempoPausadoTotal ?? 0,
          ultimaPausaRecordada: dados.ultimaPausaRecordada ?? null,
          timestampDescansoFim: dados.timestampDescansoFim ?? null,
          cronometroDescansoAtivo: dados.timestampDescansoFim != null && dados.timestampDescansoFim > Date.now(),
        }),

      atualizarNotas: (notas) => {
        set((s) => {
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

      restaurarDeAutoEncerrado: (snapshot) => {
        const sessaoAtiva = {
          ...snapshot.sessao,
          finalizadoEm: undefined,
          duracaoSegundos: undefined,
          autoEncerrado: undefined,
          // Mantém a data original em que o treino foi criado/iniciado
        }
        set({
          sessao: sessaoAtiva,
          exercicioAtualIndex: snapshot.exercicioAtualIndex,
          serieAtualIndex: snapshot.serieAtualIndex,
          cronometroGeralSegundos: snapshot.cronometroGeralSegundos,
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

      restaurarDeHistorico: (sessao) => {
        const duracaoSegundos = sessao.duracaoSegundos ?? 0
        const sessaoAtiva = {
          ...sessao,
          finalizadoEm: undefined,
          duracaoSegundos: undefined,
          autoEncerrado: undefined,
          // Mantém a data original em que o treino foi criado/iniciado
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
      partialize: (s) => ({
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

export function calcularVolume(sessao: SessaoDeTreino): number {
  return sessao.exercicios.reduce((total, ex) => {
    return (
      total +
      ex.series
        .filter((s) => s.completada)
        .reduce((sum, s) => sum + s.peso * s.repeticoes, 0)
    )
  }, 0)
}
