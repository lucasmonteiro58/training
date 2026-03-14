import { createFileRoute, useNavigate, useBlocker } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { usePlanos } from '../../hooks/usePlanos'
import { Plus, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import type { ExercicioNoPlano, TipoAgrupamento } from '../../types'
import { CORES_PLANO, AGRUPAMENTO_CONFIG } from '../../types'
import { ExercicioPicker } from '../../components/common/ExercicioPicker'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { NovoPlanoHeader } from './components/-NovoPlanoHeader'
import { PlanDetailsCard } from './components/-PlanDetailsCard'
import { ExercicioNoPlanoCard } from './components/-ExercicioNoPlanoCard'
import { CancelarCriacaoModal } from './components/-CancelarCriacaoModal'
import { GroupTypeModal } from './components/-GroupTypeModal'

export const Route = createFileRoute('/treinos/novo')({
  component: NovoPlanoPage,
})

function NovoPlanoPage() {
  const navigate = useNavigate()
  const { criarPlano, atualizarPlano } = usePlanos()
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [exercicios, setExercicios] = useState<ExercicioNoPlano[]>([])
  const [saving, setSaving] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [corSelecionada, setCorSelecionada] = useState(CORES_PLANO[0])
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [showGroupMenu, setShowGroupMenu] = useState(false)
  const salvouRef = useRef(false)

  const isDirty =
    nome.trim() !== '' ||
    descricao.trim() !== '' ||
    exercicios.length > 0 ||
    corSelecionada !== CORES_PLANO[0]

  const criarAgrupamento = (tipo: TipoAgrupamento) => {
    if (selecionados.size < 2) return
    const agrupamentoId = uuidv4()
    setExercicios(prev =>
      prev.map(ex => (selecionados.has(ex.id) ? { ...ex, agrupamentoId, tipoAgrupamento: tipo } : ex))
    )
    setSelecionados(new Set())
    setShowGroupMenu(false)
  }

  const removerDoAgrupamento = (exId: string) => {
    setExercicios(prev =>
      prev.map(ex => (ex.id === exId ? { ...ex, agrupamentoId: undefined, tipoAgrupamento: undefined } : ex))
    )
  }

  const toggleSelecionado = (id: string) => {
    setSelecionados(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const { status: blockerStatus, proceed: blockerProceed, reset: blockerReset } = useBlocker({
    shouldBlockFn: () => isDirty && !salvouRef.current,
    withResolver: true,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const adicionarExercicio = (ex: ExercicioNoPlano) => {
    const seriesPadrao = Array(3).fill({ peso: 0, repeticoes: 10 })
    setExercicios(prev => [...prev, { ...ex, seriesDetalhadas: seriesPadrao, ordem: prev.length }])
  }

  const removerExercicio = (id: string) => {
    setExercicios(prev => prev.filter(e => e.id !== id))
  }

  const atualizarExercicio = (id: string, campo: Partial<ExercicioNoPlano>) => {
    setExercicios(prev => prev.map(e => (e.id === id ? { ...e, ...campo } : e)))
  }

  const handleDragEnd = (_event: DragEndEvent) => {}

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setExercicios(items => {
        const oldIndex = items.findIndex(i => i.id === active.id)
        const newIndex = items.findIndex(i => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex).map((ex, idx) => ({ ...ex, ordem: idx }))
      })
    }
  }

  const salvar = async () => {
    if (!nome.trim()) return
    setSaving(true)
    try {
      const plano = await criarPlano(nome.trim(), descricao.trim() || undefined)
      await atualizarPlano({ ...plano, exercicios, cor: corSelecionada })
      salvouRef.current = true
      navigate({ to: '/treinos' })
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar plano')
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (isDirty) blockerProceed?.()
    else navigate({ to: '/treinos' })
  }

  return (
    <>
      <div className="page-container pt-4">
        <NovoPlanoHeader
          onBack={handleBack}
          onSave={salvar}
          saving={saving}
          saveDisabled={!nome.trim()}
        />

        <PlanDetailsCard
          nome={nome}
          onNomeChange={setNome}
          descricao={descricao}
          onDescricaoChange={setDescricao}
          corSelecionada={corSelecionada}
          onCorChange={setCorSelecionada}
        />

        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-text">EXERCÍCIOS ({exercicios.length})</h2>
            {exercicios.length >= 2 && (
              <div className="flex items-center gap-2">
                {selecionados.size >= 2 && (
                  <button
                    type="button"
                    onClick={() => setShowGroupMenu(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-lg"
                  >
                    <Link2 size={12} />
                    Agrupar ({selecionados.size})
                  </button>
                )}
                {selecionados.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelecionados(new Set())}
                    className="text-xs text-text-muted"
                  >
                    Limpar
                  </button>
                )}
              </div>
            )}
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={exercicios.map(ex => ex.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {(() => {
                  const rendered = new Set<string>()
                  return exercicios.map(ex => {
                    if (ex.agrupamentoId && !rendered.has(ex.agrupamentoId)) {
                      rendered.add(ex.agrupamentoId)
                      const groupExs = exercicios.filter(e => e.agrupamentoId === ex.agrupamentoId)
                      const config = AGRUPAMENTO_CONFIG[ex.tipoAgrupamento ?? 'superset']
                      return (
                        <div
                          key={`group-${ex.agrupamentoId}`}
                          className="rounded-2xl border-l-4 pl-1"
                          style={{ borderColor: config.cor }}
                        >
                          <div className="flex items-center justify-between px-2 py-1.5">
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: config.cor }}
                            >
                              {config.label} ({groupExs.length})
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            {groupExs.map(gex => (
                              <ExercicioNoPlanoCard
                                key={gex.id}
                                exercicio={gex}
                                onUpdate={campo => atualizarExercicio(gex.id, campo)}
                                onRemove={() => removerExercicio(gex.id)}
                                isSelected={selecionados.has(gex.id)}
                                onToggleSelect={() => toggleSelecionado(gex.id)}
                                showSelect={exercicios.length >= 2}
                                onRemoveFromGroup={() => removerDoAgrupamento(gex.id)}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    }
                    if (ex.agrupamentoId && rendered.has(ex.agrupamentoId)) return null
                    return (
                      <ExercicioNoPlanoCard
                        key={ex.id}
                        exercicio={ex}
                        onUpdate={campo => atualizarExercicio(ex.id, campo)}
                        onRemove={() => removerExercicio(ex.id)}
                        isSelected={selecionados.has(ex.id)}
                        onToggleSelect={() => toggleSelecionado(ex.id)}
                        showSelect={exercicios.length >= 2}
                      />
                    )
                  })
                })()}
              </div>
            </SortableContext>
          </DndContext>

          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="mt-3 w-full py-4 rounded-2xl border-2 border-dashed border-border-strong text-text-muted flex items-center justify-center gap-2 text-sm font-medium hover:border-accent  hover:text-accent transition-colors"
          >
            <Plus size={18} />
            Adicionar Exercício
          </button>
        </div>
      </div>

      {blockerStatus === 'blocked' && (
        <CancelarCriacaoModal onConfirm={() => blockerProceed?.()} onCancel={blockerReset} />
      )}

      {showPicker && (
        <ExercicioPicker
          onSelect={ex => {
            adicionarExercicio({
              id: uuidv4(),
              exercicioId: ex.id,
              exercicio: ex,
              series: 3,
              repeticoesMeta: 10,
              pesoMeta: 0,
              descansoSegundos: 60,
              ordem: exercicios.length,
            })
            setShowPicker(false)
          }}
          onClose={() => setShowPicker(false)}
        />
      )}

      {showGroupMenu && (
        <GroupTypeModal onSelect={criarAgrupamento} onClose={() => setShowGroupMenu(false)} />
      )}
    </>
  )
}
