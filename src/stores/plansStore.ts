import { create } from 'zustand'
import type { WorkoutPlan } from '../types'

export interface PlansState {
  planos: WorkoutPlan[]
  loading: boolean
  setPlanos: (planos: WorkoutPlan[]) => void
  addPlano: (plano: WorkoutPlan) => void
  updatePlano: (plano: WorkoutPlan) => void
  removePlano: (id: string) => void
  setLoading: (v: boolean) => void
}

export const usePlansStore = create<PlansState>(set => ({
  planos: [],
  loading: true,
  setPlanos: planos => set({ planos }),
  addPlano: plano => set(s => ({ planos: [plano, ...s.planos] })),
  updatePlano: plano =>
    set(s => ({ planos: s.planos.map(p => (p.id === plano.id ? plano : p)) })),
  removePlano: id => set(s => ({ planos: s.planos.filter(p => p.id !== id) })),
  setLoading: loading => set({ loading }),
}))
