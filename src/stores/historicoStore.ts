import { create } from 'zustand'
import type { SessaoDeTreino } from '../types'

export interface SnapshotAutoEncerrado {
  sessao: SessaoDeTreino
  exercicioAtualIndex: number
  serieAtualIndex: number
  cronometroGeralSegundos: number
}

export interface HistoricoState {
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

export const useHistoricoStore = create<HistoricoState>(set => ({
  sessoes: [],
  loading: true,
  sessaoAutoEncerrada: null,
  setSessoes: sessoes => set({ sessoes }),
  addSessao: sessao =>
    set(s => {
      const exists = s.sessoes.some(x => x.id === sessao.id)
      const next = exists
        ? s.sessoes.map(x => (x.id === sessao.id ? sessao : x))
        : [sessao, ...s.sessoes]
      return { sessoes: next.sort((a, b) => b.iniciadoEm - a.iniciadoEm) }
    }),
  removeSessao: id => set(s => ({ sessoes: s.sessoes.filter(s2 => s2.id !== id) })),
  setLoading: loading => set({ loading }),
  setSessaoAutoEncerrada: sessaoAutoEncerrada => set({ sessaoAutoEncerrada }),
}))
