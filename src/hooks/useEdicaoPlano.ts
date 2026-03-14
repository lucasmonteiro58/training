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
  PlanoDeTreino,
  ExercicioNoPlano,
  SeriePlano,
  TipoSerie,
  TipoAgrupamento,
} from '../types'

export function useEdicaoPlano(
  plano: PlanoDeTreino | undefined,
  atualizarPlano: (plano: PlanoDeTreino) => Promise<void>
) {
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState(plano?.nome ?? '')
  const [exerciciosEdit, setExerciciosEdit] = useState<ExercicioNoPlano[]>(
    plano?.exercicios ?? []
  )
  const [expandedEx, setExpandedEx] = useState<Set<string>>(new Set())
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [showGroupMenu, setShowGroupMenu] = useState(false)

  useEffect(() => {
    if (plano) {
      setNome(plano.nome)
      setExerciciosEdit(plano.exercicios)
    }
  }, [plano?.id])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const salvarEdicao = useCallback(async () => {
    if (!plano) return
    await atualizarPlano({ ...plano, nome, exercicios: exerciciosEdit })
    setEditando(false)
  }, [plano, nome, exerciciosEdit, atualizarPlano])

  const iniciarEdicao = useCallback(() => {
    if (!plano) return
    setEditando(true)
    setNome(plano.nome)
    setExerciciosEdit(plano.exercicios)
  }, [plano])

  const adicionarEx = useCallback((ex: { id: string; [key: string]: any }) => {
    setExerciciosEdit((prev) => [
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

  const removerEx = useCallback((id: string) => {
    setExerciciosEdit((p) => p.filter((e) => e.id !== id))
  }, [])

  const atualizarSerieEdit = useCallback(
    (exId: string, sIdx: number, campo: Partial<SeriePlano>) => {
      setExerciciosEdit((prev) =>
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

  const atualizarExercicioEdit = useCallback(
    (exId: string, campos: Partial<ExercicioNoPlano['exercicio']>) => {
      setExerciciosEdit((prev) =>
        prev.map((ex) =>
          ex.id === exId
            ? { ...ex, exercicio: { ...ex.exercicio, ...campos } }
            : ex
        )
      )
    },
    []
  )

  const atualizarDescansoEdit = useCallback((exId: string, segundos: number) => {
    setExerciciosEdit((prev) =>
      prev.map((ex) =>
        ex.id === exId ? { ...ex, descansoSegundos: segundos } : ex
      )
    )
  }, [])

  const atualizarTipoSerieEdit = useCallback((exId: string, tipo: TipoSerie) => {
    setExerciciosEdit((prev) =>
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
      setExerciciosEdit((items) => {
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

  const criarAgrupamento = useCallback((tipo: TipoAgrupamento) => {
    if (selecionados.size < 2) return
    const agrupamentoId = uuidv4()
    const sel = selecionados
    setExerciciosEdit((prev) =>
      prev.map((ex) =>
        sel.has(ex.id) ? { ...ex, agrupamentoId, tipoAgrupamento: tipo } : ex
      )
    )
    setSelecionados(new Set())
    setShowGroupMenu(false)
  }, [selecionados])

  const removerDoAgrupamento = useCallback((exId: string) => {
    setExerciciosEdit((prev) =>
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

  return {
    editando,
    setEditando,
    nome,
    setNome,
    exerciciosEdit,
    expandedEx,
    selecionados,
    showGroupMenu,
    setShowGroupMenu,
    setSelecionados,
    sensors,
    salvarEdicao,
    iniciarEdicao,
    adicionarEx,
    removerEx,
    atualizarSerieEdit,
    atualizarExercicioEdit,
    atualizarDescansoEdit,
    atualizarTipoSerieEdit,
    handleDragEnd,
    toggleExpandedEx,
    criarAgrupamento,
    removerDoAgrupamento,
    toggleSelecionado,
  }
}
