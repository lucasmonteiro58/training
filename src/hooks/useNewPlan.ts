import { useState, useRef, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { v4 as uuidv4 } from 'uuid'
import { usePlans } from './usePlans'
import { toast } from 'sonner'
import type { ExerciseInPlan, GroupingType } from '../types'
import { PLAN_COLORS } from '../types'
import {
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  type DragOverEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'

export function useNewPlan() {
  const navigate = useNavigate()
  const { createPlan, updatePlanById } = usePlans()
  const savedRef = useRef(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [exercicios, setExercicios] = useState<ExerciseInPlan[]>([])
  const [saving, setSaving] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [selectedColor, setSelectedColor] = useState(PLAN_COLORS[0])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showGroupMenu, setShowGroupMenu] = useState(false)

  const isDirty =
    name.trim() !== '' ||
    description.trim() !== '' ||
    exercicios.length > 0 ||
    selectedColor !== PLAN_COLORS[0]

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const createGrouping = useCallback((tipo: GroupingType) => {
    setExercicios((prev) => {
      if (selected.size < 2) return prev
      const agrupamentoId = uuidv4()
      const sel = selected
      return prev.map((ex) =>
        sel.has(ex.id) ? { ...ex, agrupamentoId, tipoAgrupamento: tipo } : ex
      )
    })
    setSelected(new Set())
    setShowGroupMenu(false)
  }, [selected])

  const removeFromGrouping = useCallback((exId: string) => {
    setExercicios((prev) =>
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

  const addExercise = useCallback(
    (ex: Partial<ExerciseInPlan> & { exercicio: any }) => {
      const seriesPadrao = Array(3).fill({ peso: 0, repeticoes: 10 })
      setExercicios((prev) => [
        ...prev,
        {
          ...ex,
          id: ex.id ?? uuidv4(),
          seriesDetalhadas:
            (ex as ExerciseInPlan).seriesDetalhadas ?? seriesPadrao,
          ordem: ex.ordem ?? prev.length,
        } as ExerciseInPlan,
      ])
    },
    []
  )

  const removeExercise = useCallback((id: string) => {
    setExercicios((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const updateExercise = useCallback(
    (id: string, campo: Partial<ExerciseInPlan>) => {
      setExercicios((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...campo } : e))
      )
    },
    []
  )

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setExercicios((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex).map((ex, idx) => ({
          ...ex,
          ordem: idx,
        }))
      })
    }
  }, [])

  const save = useCallback(async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const plan = await createPlan(
        name.trim(),
        description.trim() || undefined
      )
      await updatePlanById({ ...plan, exercicios, cor: selectedColor })
      savedRef.current = true
      navigate({ to: '/workouts' })
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar plano')
    } finally {
      setSaving(false)
    }
  }, [
    name,
    description,
    exercicios,
    selectedColor,
    createPlan,
    updatePlanById,
    navigate,
  ])

  const handleBack = useCallback(() => {
    if (isDirty) {
      // Caller will use blocker proceed
    } else {
      navigate({ to: '/workouts' })
    }
  }, [isDirty, navigate])

  return {
    name,
    setName,
    description,
    setDescription,
    exercicios,
    saving,
    showPicker,
    setShowPicker,
    selectedColor,
    setSelectedColor,
    selected,
    setSelected,
    showGroupMenu,
    setShowGroupMenu,
    savedRef,
    isDirty,
    sensors,
    createGrouping,
    removeFromGrouping,
    toggleSelected,
    addExercise,
    removeExercise,
    updateExercise,
    handleDragOver,
    save,
    handleBack,
  }
}
