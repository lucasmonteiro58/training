import { create } from 'zustand'
import type { PlanoDeTreino } from '../types'

export interface PlanosState {
  planos: PlanoDeTreino[]
  loading: boolean
  setPlanos: (planos: PlanoDeTreino[]) => void
  addPlano: (plano: PlanoDeTreino) => void
  updatePlano: (plano: PlanoDeTreino) => void
  removePlano: (id: string) => void
  setLoading: (v: boolean) => void
}

export const usePlanosStore = create<PlanosState>(set => ({
  planos: [],
  loading: true,
  setPlanos: planos => set({ planos }),
  addPlano: plano => set(s => ({ planos: [plano, ...s.planos] })),
  updatePlano: plano =>
    set(s => ({ planos: s.planos.map(p => (p.id === plano.id ? plano : p)) })),
  removePlano: id => set(s => ({ planos: s.planos.filter(p => p.id !== id) })),
  setLoading: loading => set({ loading }),
}))
