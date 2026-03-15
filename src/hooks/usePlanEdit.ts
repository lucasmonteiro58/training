import { useState, useCallback, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  type DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import type {
  WorkoutPlan,
  ExerciseInPlan,
  PlanSet,
  SetType,
  GroupingType,
} from '../types'

export function usePlanEdit(
  plan: WorkoutPlan | undefined,
  updatePlanById: (plan: WorkoutPlan) => Promise<void>
) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(plan?.nome ?? '')
  const [exercisesEdit, setExercisesEdit] = useState<ExerciseInPlan[]>(
    plan?.exercicios ?? []
  )
  const [expandedEx, setExpandedEx] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showGroupMenu, setShowGroupMenu] = useState(false)

  useEffect(() => {
    if (plan) {
      setName(plan.nome)
      setExercisesEdit(plan.exercicios)
    }
  }, [plan?.id])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const saveEdit = useCallback(async () => {
    if (!plan) return
    await updatePlanById({ ...plan, nome: name, exercicios: exercisesEdit })
    setEditing(false)
  }, [plan, name, exercisesEdit, updatePlanById])

  const startEdit = useCallback(() => {
    if (!plan) return
    setEditing(true)
    setName(plan.nome)
    setExercisesEdit(plan.exercicios)
  }, [plan])

  const addExercise = useCallback((ex: { id: string; [key: string]: any }) => {
    setExercisesEdit((prev) => [
      ...prev,
      {
        id: uuidv4(),
        exercicioId: ex.id,
        exercicio: ex,
        series: 3,
        repeticoesMeta: 10,
        pesoMeta: 0,
        descansoSegundos: 60,
        ordem: prev.length,
        seriesDetalhadas: [
          { peso: 0, repeticoes: 10 },
          { peso: 0, repeticoes: 10 },
          { peso: 0, repeticoes: 10 },
        ],
      },
    ])
  }, [])

  const removeExercise = useCallback((id: string) => {
    setExercisesEdit((p) => p.filter((e) => e.id !== id))
  }, [])

  const updateSetEdit = useCallback(
    (exId: string, sIdx: number, campo: Partial<PlanSet>) => {
      setExercisesEdit((prev) =>
        prev.map((ex) => {
          if (ex.id !== exId) return ex
          const base =
            ex.seriesDetalhadas ??
            Array.from({ length: ex.series }, () => ({
              peso: ex.pesoMeta ?? 0,
              repeticoes: ex.repeticoesMeta,
            }))
          const novas = base.map((s, i) =>
            i === sIdx ? { ...s, ...campo } : s
          )
          return { ...ex, seriesDetalhadas: novas }
        })
      )
    },
    []
  )

  const updateExerciseEdit = useCallback(
    (exId: string, campos: Partial<ExerciseInPlan['exercicio']>) => {
      setExercisesEdit((prev) =>
        prev.map((ex) =>
          ex.id === exId
            ? { ...ex, exercicio: { ...ex.exercicio, ...campos } }
            : ex
        )
      )
    },
    []
  )

  const updateRestEdit = useCallback((exId: string, segundos: number) => {
    setExercisesEdit((prev) =>
      prev.map((ex) =>
        ex.id === exId ? { ...ex, descansoSegundos: segundos } : ex
      )
    )
  }, [])

  const updateSetTypeEdit = useCallback((exId: string, tipo: SetType) => {
    setExercisesEdit((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex
        const base =
          ex.seriesDetalhadas ??
          Array.from({ length: ex.series }, () => ({
            peso: ex.pesoMeta ?? 0,
            repeticoes: ex.repeticoesMeta,
          }))
        const seriesDetalhadas =
          tipo === 'tempo' ? base.map((s) => ({ ...s, repeticoes: 1 })) : base
        return { ...ex, tipoSerie: tipo, seriesDetalhadas }
      })
    )
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setExercisesEdit((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex).map((ex, idx) => ({
          ...ex,
          ordem: idx,
        }))
      })
    }
  }, [])

  const toggleExpandedEx = useCallback((id: string) => {
    setExpandedEx((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const createGrouping = useCallback((tipo: GroupingType) => {
    if (selected.size < 2) return
    const agrupamentoId = uuidv4()
    const sel = selected
    setExercisesEdit((prev) =>
      prev.map((ex) =>
        sel.has(ex.id) ? { ...ex, agrupamentoId, tipoAgrupamento: tipo } : ex
      )
    )
    setSelected(new Set())
    setShowGroupMenu(false)
  }, [selected])

  const removeFromGrouping = useCallback((exId: string) => {
    setExercisesEdit((prev) =>
      prev.map((ex) =>
        ex.id === exId
          ? { ...ex, agrupamentoId: undefined, tipoAgrupamento: undefined }
          : ex
      )
    )
  }, [])

  const toggleSelected = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return {
    editing,
    setEditing,
    name,
    setName,
    exercisesEdit,
    expandedEx,
    selected,
    showGroupMenu,
    setShowGroupMenu,
    setSelected,
    sensors,
    saveEdit,
    startEdit,
    addExercise,
    removeExercise,
    updateSetEdit,
    updateExerciseEdit,
    updateRestEdit,
    updateSetTypeEdit,
    handleDragEnd,
    toggleExpandedEx,
    createGrouping,
    removeFromGrouping,
    toggleSelected,
  }
}
