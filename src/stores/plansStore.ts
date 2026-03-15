import { create } from 'zustand'
import type { WorkoutPlan } from '../types'

export interface PlansState {
  plans: WorkoutPlan[]
  loading: boolean
  setPlans: (plans: WorkoutPlan[]) => void
  addPlan: (plan: WorkoutPlan) => void
  updatePlan: (plan: WorkoutPlan) => void
  removePlan: (id: string) => void
  setLoading: (v: boolean) => void
}

export const usePlansStore = create<PlansState>(set => ({
  plans: [],
  loading: true,
  setPlans: plans => set({ plans }),
  addPlan: plan => set(s => ({ plans: [plan, ...s.plans] })),
  updatePlan: plan =>
    set(s => ({ plans: s.plans.map(p => (p.id === plan.id ? plan : p)) })),
  removePlan: id => set(s => ({ plans: s.plans.filter(p => p.id !== id) })),
  setLoading: loading => set({ loading }),
}))
