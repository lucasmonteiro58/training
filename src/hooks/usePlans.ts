import { useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { usePlansStore } from '../stores'
import { useAuthStore } from '../stores'
import { getPlans, savePlan, deletePlan } from '../lib/db/dexie'
import { syncPlanToFirestore, deletePlanFromFirestore, subscribeToPlans, subscribeToExercises, fetchPlans } from '../lib/firestore/sync'
import type { WorkoutPlan } from '../types'
import { PLAN_COLORS } from '../types'

export function usePlans() {
  const user = useAuthStore((s) => s.user)
  const { plans, loading, setPlans, addPlan, updatePlan, removePlan, setLoading } =
    usePlansStore()

  useEffect(() => {
    if (!user) return

    getPlans(user.uid).then((local) => {
      // Não sobrescrever com [] quando IndexedDB está vazio mas o store já tem planos
      // (ex.: planos vieram do Firestore na tela anterior; ao montar active-workout
      // getPlans() pode retornar [] e apagava a lista, travando em "Carregando treino...")
      if (local.length > 0) setPlans(local)
      setLoading(false)
    })

    const unsubPlans = subscribeToPlans(user.uid, (remote) => {
      setPlans(remote)
      setLoading(false)
    })

    const unsubExercises = subscribeToExercises(user.uid, () => {})

    return () => {
      unsubPlans()
      unsubExercises()
    }
  }, [user, setPlans, setLoading])

  const createPlan = useCallback(
    async (name: string, description?: string): Promise<WorkoutPlan> => {
      if (!user) throw new Error('Usuário não autenticado')
      const randomColor = PLAN_COLORS[Math.floor(Math.random() * PLAN_COLORS.length)]
      const plan: WorkoutPlan = {
        id: uuidv4(),
        userId: user.uid,
        name,
        description,
        exercises: [],
        color: randomColor,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      await savePlan(plan)
      addPlan(plan)
      syncPlanToFirestore(plan)
      return plan
    },
    [user, addPlan]
  )

  const updatePlanById = useCallback(
    async (plan: WorkoutPlan): Promise<void> => {
      const updated = { ...plan, updatedAt: Date.now() }
      await savePlan(updated)
      updatePlan(updated)
      syncPlanToFirestore(updated)
    },
    [updatePlan]
  )

  const deletePlanById = useCallback(
    async (id: string): Promise<void> => {
      await deletePlan(id)
      removePlan(id)
      deletePlanFromFirestore(id)
    },
    [removePlan]
  )

  const sync = useCallback(async () => {
    if (!user) return
    const remote = await fetchPlans(user.uid)
    if (remote.length > 0) setPlans(remote)
  }, [user, setPlans])

  const archivePlan = useCallback(
    async (id: string): Promise<void> => {
      const plan = plans.find(p => p.id === id)
      if (!plan) return
      const updated = { ...plan, archived: true, updatedAt: Date.now() }
      await savePlan(updated)
      updatePlan(updated)
      syncPlanToFirestore(updated)
    },
    [plans, updatePlan]
  )

  const unarchivePlan = useCallback(
    async (id: string): Promise<void> => {
      const plan = plans.find(p => p.id === id)
      if (!plan) return
      const updated = { ...plan, archived: false, updatedAt: Date.now() }
      await savePlan(updated)
      updatePlan(updated)
      syncPlanToFirestore(updated)
    },
    [plans, updatePlan]
  )

  const reorderPlans = useCallback(
    async (orderedIds: string[]): Promise<void> => {
      const updatedList = plans.map((p) => {
        const idx = orderedIds.indexOf(p.id)
        if (idx === -1) return p
        const updated = { ...p, order: idx, updatedAt: Date.now() }
        savePlan(updated)
        syncPlanToFirestore(updated)
        return updated
      })
      setPlans(updatedList)
    },
    [plans, setPlans]
  )

  const clonePlan = useCallback(
    async (planId: string): Promise<WorkoutPlan | null> => {
      if (!user) throw new Error('Usuário não autenticado')
      const original = plans.find(p => p.id === planId)
      if (!original) return null
      const clone: WorkoutPlan = {
        ...original,
        id: uuidv4(),
        name: `${original.name} (cópia)`,
        exercises: original.exercises.map((ex) => ({
          ...ex,
          id: uuidv4(),
        })),
        archived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncedAt: undefined,
      }
      await savePlan(clone)
      addPlan(clone)
      syncPlanToFirestore(clone)
      return clone
    },
    [user, plans, addPlan]
  )

  const activePlans = plans
    .filter((p) => !p.archived)
    .sort((a, b) => (a.order ?? a.createdAt) - (b.order ?? b.createdAt))
  const archivedPlans = plans.filter((p) => p.archived)

  return {
    plans,
    activePlans,
    archivedPlans,
    loading,
    createPlan,
    updatePlanById,
    deletePlanById,
    archivePlan,
    unarchivePlan,
    reorderPlans,
    clonePlan,
    sync,
  }
}
