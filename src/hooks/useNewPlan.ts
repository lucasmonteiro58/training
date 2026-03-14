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
  const { criarPlano, atualizarPlano } = usePlans()
  const salvouRef = useRef(false)

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [exercicios, setExercicios] = useState<ExerciseInPlan[]>([])
  const [saving, setSaving] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [corSelecionada, setCorSelecionada] = useState(PLAN_COLORS[0])
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [showGroupMenu, setShowGroupMenu] = useState(false)

  const isDirty =
    nome.trim() !== '' ||
    descricao.trim() !== '' ||
    exercicios.length > 0 ||
    corSelecionada !== PLAN_COLORS[0]

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const criarAgrupamento = useCallback((tipo: GroupingType) => {
    setExercicios((prev) => {
      if (selecionados.size < 2) return prev
      const agrupamentoId = uuidv4()
      const sel = selecionados
      return prev.map((ex) =>
        sel.has(ex.id) ? { ...ex, agrupamentoId, tipoAgrupamento: tipo } : ex
      )
    })
    setSelecionados(new Set())
    setShowGroupMenu(false)
  }, [selecionados])

  const removerDoAgrupamento = useCallback((exId: string) => {
    setExercicios((prev) =>
      prev.map((ex) =>
        ex.id === exId
          ? { ...ex, agrupamentoId: undefined, tipoAgrupamento: undefined }
          : ex
      )
    )
  }, [])

  const toggleSelecionado = useCallback((id: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const adicionarExercicio = useCallback(
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

  const removerExercicio = useCallback((id: string) => {
    setExercicios((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const atualizarExercicio = useCallback(
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

  const salvar = useCallback(async () => {
    if (!nome.trim()) return
    setSaving(true)
    try {
      const plano = await criarPlano(
        nome.trim(),
        descricao.trim() || undefined
      )
      await atualizarPlano({ ...plano, exercicios, cor: corSelecionada })
      salvouRef.current = true
      navigate({ to: '/workouts' })
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar plano')
    } finally {
      setSaving(false)
    }
  }, [
    nome,
    descricao,
    exercicios,
    corSelecionada,
    criarPlano,
    atualizarPlano,
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
    nome,
    setNome,
    descricao,
    setDescricao,
    exercicios,
    saving,
    showPicker,
    setShowPicker,
    corSelecionada,
    setCorSelecionada,
    selecionados,
    setSelecionados,
    showGroupMenu,
    setShowGroupMenu,
    salvouRef,
    isDirty,
    sensors,
    criarAgrupamento,
    removerDoAgrupamento,
    toggleSelecionado,
    adicionarExercicio,
    removerExercicio,
    atualizarExercicio,
    handleDragOver,
    salvar,
    handleBack,
  }
}
