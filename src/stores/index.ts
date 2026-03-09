import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from 'firebase/auth'
import type { PlanoDeTreino, SessaoDeTreino, Exercicio } from '../types'

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

// ============================================================
// Histórico / Sessões Store
// ============================================================
interface HistoricoState {
  sessoes: SessaoDeTreino[]
  loading: boolean
  setSessoes: (sessoes: SessaoDeTreino[]) => void
  addSessao: (sessao: SessaoDeTreino) => void
  removeSessao: (id: string) => void
  setLoading: (v: boolean) => void
}

export const useHistoricoStore = create<HistoricoState>((set) => ({
  sessoes: [],
  loading: true,
  setSessoes: (sessoes) => set({ sessoes }),
  addSessao: (sessao) =>
    set((s) => ({
      sessoes: [sessao, ...s.sessoes].sort((a, b) => b.iniciadoEm - a.iniciadoEm),
    })),
  removeSessao: (id) => set((s) => ({ sessoes: s.sessoes.filter((s2) => s2.id !== id) })),
  setLoading: (loading) => set({ loading }),
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
  iniciarDescanso: (segundos: number) => void
  pararDescanso: () => void
  tickGeral: () => void
  tickDescanso: () => void
  atualizarCronometroGeral: (segundos: number) => void
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

      iniciarTreino: (sessao) =>
        set({
          sessao,
          exercicioAtualIndex: 0,
          serieAtualIndex: 0,
          cronometroGeralSegundos: 0,
          cronometroDescansoSegundos: 0,
          cronometroDescansoAtivo: false,
          pausado: false,
          iniciado: true,
        }),

      finalizarTreino: () => {
        const { sessao, cronometroGeralSegundos } = get()
        if (!sessao) return null
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
        })
        return finalizada
      },

      pausarTreino: () => set({ pausado: true }),
      retomar: () => set({ pausado: false }),

      proximoExercicio: () =>
        set((s) => {
          const total = s.sessao?.exercicios.length ?? 0
          const next = Math.min(s.exercicioAtualIndex + 1, total - 1)
          return { exercicioAtualIndex: next, serieAtualIndex: 0 }
        }),

      exercicioAnterior: () =>
        set((s) => ({
          exercicioAtualIndex: Math.max(0, s.exercicioAtualIndex - 1),
          serieAtualIndex: 0,
        })),

      atualizarSerie: (exercicioIdx, serieIdx, dados) =>
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
        }),

      iniciarDescanso: (segundos) =>
        set({ cronometroDescansoSegundos: segundos, cronometroDescansoAtivo: true }),

      pararDescanso: () =>
        set({ cronometroDescansoAtivo: false, cronometroDescansoSegundos: 0 }),

      tickGeral: () =>
        set((s) => {
          if (s.pausado || !s.iniciado) return {}
          return { cronometroGeralSegundos: s.cronometroGeralSegundos + 1 }
        }),

      tickDescanso: () =>
        set((s) => {
          if (!s.cronometroDescansoAtivo) return {}
          const next = s.cronometroDescansoSegundos - 1
          if (next <= 0)
            return { cronometroDescansoSegundos: 0, cronometroDescansoAtivo: false }
          return { cronometroDescansoSegundos: next }
        }),

      atualizarCronometroGeral: (segundos) => set({ cronometroGeralSegundos: segundos }),
    }),
    {
      name: 'fittrack-treino-ativo',
      partialize: (s) => ({
        sessao: s.sessao,
        exercicioAtualIndex: s.exercicioAtualIndex,
        serieAtualIndex: s.serieAtualIndex,
        cronometroGeralSegundos: s.cronometroGeralSegundos,
        iniciado: s.iniciado,
      }),
    }
  )
)

function calcularVolume(sessao: SessaoDeTreino): number {
  return sessao.exercicios.reduce((total, ex) => {
    return (
      total +
      ex.series
        .filter((s) => s.completada)
        .reduce((sum, s) => sum + s.peso * s.repeticoes, 0)
    )
  }, 0)
}
