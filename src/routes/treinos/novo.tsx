import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { usePlanos } from '../../hooks/usePlanos'
import { useAuthStore } from '../../stores'
import { ArrowLeft, Plus, Trash2, GripVertical, ChevronDown, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { ExercicioNoPlano, SeriePlano } from '../../types'
import { CORES_PLANO } from '../../types'
import { ExercicioPicker } from '../../components/exercicios/ExercicioPicker'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export const Route = createFileRoute('/treinos/novo')({
  component: NovoPlanoPage,
})

function NovoPlanoPage() {
  const navigate = useNavigate()
  const id = uuidv4()
  const user = useAuthStore((s) => s.user)
  const { criarPlano, atualizarPlano } = usePlanos()
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [exercicios, setExercicios] = useState<ExercicioNoPlano[]>([])
  const [saving, setSaving] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [corSelecionada, setCorSelecionada] = useState(CORES_PLANO[0])
  const [showConfirmVoltar, setShowConfirmVoltar] = useState(false)

  const isDirty = nome.trim() !== '' || descricao.trim() !== '' || exercicios.length > 0 || corSelecionada !== CORES_PLANO[0]

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const adicionarExercicio = (ex: ExercicioNoPlano) => {
    // Inicializar com 3 séries padrão
    const seriesPadrao = Array(3).fill({ peso: 0, repeticoes: 10 })
    setExercicios((prev) => [
      ...prev,
      { ...ex, seriesDetalhadas: seriesPadrao, ordem: prev.length },
    ])
  }

  const removerExercicio = (id: string) => {
    setExercicios((prev) => prev.filter((e) => e.id !== id))
  }

  const atualizarExercicio = (id: string, campo: Partial<ExercicioNoPlano>) => {
    setExercicios((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...campo } : e))
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
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
  }

  const salvar = async () => {
    if (!nome.trim()) return
    setSaving(true)
    try {
      const plano = await criarPlano(nome.trim(), descricao.trim() || undefined)
      await atualizarPlano({ ...plano, exercicios, cor: corSelecionada })
      navigate({ to: '/treinos' })
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar plano')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="page-container pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => isDirty ? setShowConfirmVoltar(true) : navigate({ to: '/treinos' })}
            className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-muted hover:text-text transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-text">Novo Plano</h1>
          <div className="ml-auto">
            <button
              onClick={salvar}
              disabled={!nome.trim() || saving}
              className="btn-primary py-2.5 px-5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        {/* Plan Details */}
        <div className="card p-4 mb-4 animate-fade-up">
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-text-muted font-medium mb-1.5 block">
                NOME DO PLANO *
              </label>
              <input
                className="input"
                placeholder="Ex: Treino A – Peito e Tríceps"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                maxLength={60}
              />
            </div>
            <div>
              <label className="text-xs text-text-muted font-medium mb-1.5 block">
                DESCRIÇÃO (opcional)
              </label>
              <textarea
                className="input resize-none"
                placeholder="Ex: Foco em hipertrofia..."
                rows={2}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            {/* Color */}
            <div>
              <label className="text-xs text-text-muted font-medium mb-1.5 block">
                COR
              </label>
              <div className="flex gap-2 flex-wrap">
                {CORES_PLANO.map((cor) => (
                  <button
                    key={cor}
                    className={`w-8 h-8 rounded-full transition-transform ${corSelecionada === cor ? 'scale-105 ring-2 ring-offset-2 ring-offset-surface ring-white' : 'opacity-60 hover:opacity-100 hover:scale-110'}`}
                    style={{ background: cor }}
                    onClick={() => setCorSelecionada(cor)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Exercícios */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-text">
              EXERCÍCIOS ({exercicios.length})
            </h2>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={exercicios.map((ex) => ex.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2">
                {exercicios.map((ex) => (
                  <ExercicioNoPlanoCard
                    key={ex.id}
                    exercicio={ex}
                    onUpdate={(campo) => atualizarExercicio(ex.id, campo)}
                    onRemove={() => removerExercicio(ex.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            onClick={() => setShowPicker(true)}
            className="mt-3 w-full py-4 rounded-2xl border-2 border-dashed border-border-strong text-text-muted flex items-center justify-center gap-2 text-sm font-medium hover:border-accent hover:text-accent transition-colors"
          >
            <Plus size={18} />
            Adicionar Exercício
          </button>
        </div>
      </div>

      {showConfirmVoltar && (
        <div className="modal-overlay" onClick={() => setShowConfirmVoltar(false)}>
          <div className="modal-content text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-3xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-danger" />
            </div>
            <h2 className="text-xl font-bold text-text mb-2">Cancelar criação?</h2>
            <p className="text-text-muted text-sm mb-6">
              As alterações feitas serão perdidas e o plano não será salvo.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate({ to: '/treinos' })}
                className="btn-danger w-full py-4 text-base"
              >
                Sim, Descartar
              </button>
              <button
                onClick={() => setShowConfirmVoltar(false)}
                className="btn-ghost w-full py-3"
              >
                Continuar Editando
              </button>
            </div>
          </div>
        </div>
      )}

      {showPicker && (
        <ExercicioPicker
          onSelect={(ex) => {
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
    </>
  )
}

function ExercicioNoPlanoCard({
  exercicio,
  onUpdate,
  onRemove,
}: {
  exercicio: ExercicioNoPlano
  onUpdate: (campo: Partial<ExercicioNoPlano>) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [applyAll, setApplyAll] = useState<{ field: 'peso' | 'repeticoes'; sIdx: number; value: number } | null>(null)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: exercicio.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  const series = exercicio.seriesDetalhadas || []

  const addSerie = () => {
    const ultima = series[series.length - 1]
    const nova = ultima ? { ...ultima } : { peso: 0, repeticoes: 10 }
    const novasSeries = [...series, nova]
    onUpdate({
      series: novasSeries.length,
      seriesDetalhadas: novasSeries,
    })
  }

  const removeSerie = (idx: number) => {
    const novasSeries = series.filter((_, i: number) => i !== idx)
    onUpdate({
      series: novasSeries.length,
      seriesDetalhadas: novasSeries,
    })
  }

  const updateSerie = (idx: number, campo: Partial<SeriePlano>) => {
    const novasSeries = series.map((s: SeriePlano, i: number) =>
      i === idx ? { ...s, ...campo } : s
    )
    onUpdate({ seriesDetalhadas: novasSeries })
    if (series.length > 1) {
      if ('peso' in campo && campo.peso !== undefined) {
        setApplyAll({ field: 'peso', sIdx: idx, value: campo.peso as number })
      } else if ('repeticoes' in campo && campo.repeticoes !== undefined) {
        setApplyAll({ field: 'repeticoes', sIdx: idx, value: campo.repeticoes as number })
      }
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card p-3 transition-opacity ${isDragging ? 'opacity-50' : 'animate-scale-in'}`}
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
          <GripVertical size={16} className="text-text-subtle shrink-0" />
        </div>
        {exercicio.exercicio.gifUrl ? (
          <img
            src={exercicio.exercicio.gifUrl}
            alt={exercicio.exercicio.nome}
            className="w-10 h-10 rounded-lg object-cover bg-surface-2"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center">
            <span className="text-lg">💪</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-text font-semibold text-sm truncate">
            {exercicio.exercicio.nome}
          </p>
          <p className="text-text-muted text-xs">
            {series.length} séries {series.length > 0 && `(Meta: ${series[0].repeticoes} reps)`}
          </p>
        </div>
        <button onClick={() => setExpanded((e) => !e)} className="btn-ghost p-2">
          <ChevronDown
            size={16}
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
        <button onClick={onRemove} className="btn-ghost p-2 text-danger">
          <Trash2 size={15} />
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          {/* Header da tabela de séries */}
          <div className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 px-2 text-[10px] font-bold text-text-subtle uppercase tracking-wider">
            <span className="text-center">#</span>
            <span className="text-center">PESO (KG)</span>
            <span className="text-center">REPS</span>
            <span></span>
          </div>

          <div className="flex flex-col gap-2">
            {series.map((s, i) => (
              <div key={i} className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 items-center bg-surface-2/50 p-1 rounded-lg">
                <span className="text-[11px] font-bold text-text-muted text-center">{i + 1}</span>
                <input
                  type="number"
                  className="set-input h-9! py-0! text-sm!"
                  value={s.peso === 0 ? '' : s.peso}
                  onChange={(e) => updateSerie(i, { peso: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                />
                <input
                  type="number"
                  className="set-input h-9! py-0! text-sm!"
                  value={s.repeticoes === 0 ? '' : s.repeticoes}
                  onChange={(e) => updateSerie(i, { repeticoes: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                />
                <button
                  onClick={() => removeSerie(i)}
                  className="btn-ghost p-1.5 text-text-subtle hover:text-danger"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {applyAll && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl px-3 py-2.5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-text-muted">
                  Repetir{' '}
                  <strong className="text-text">
                    {applyAll.field === 'peso' ? `${applyAll.value} kg` : `${applyAll.value} reps`}
                  </strong>{' '}em:
                </p>
                <button
                  onClick={() => setApplyAll(null)}
                  className="w-5 h-5 flex items-center justify-center rounded-full text-text-subtle hover:text-text hover:bg-surface-2 transition-colors text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-1.5">
                {applyAll.sIdx < series.length - 1 && (
                  <button
                    onClick={() => {
                      const novasSeries = series.map((s: SeriePlano, i: number) =>
                        i > applyAll.sIdx ? { ...s, [applyAll.field]: applyAll.value } : s
                      )
                      onUpdate({ seriesDetalhadas: novasSeries })
                      setApplyAll(null)
                    }}
                    className="flex-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-accent bg-accent/10 border border-accent/20"
                  >
                    ↓ Seguintes
                  </button>
                )}
                <button
                  onClick={() => {
                    const novasSeries = series.map((s: SeriePlano) => ({ ...s, [applyAll.field]: applyAll.value }))
                    onUpdate({ seriesDetalhadas: novasSeries })
                    setApplyAll(null)
                  }}
                  className="flex-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-accent"
                >
                  Todas
                </button>
              </div>
            </div>
          )}

          <button
            onClick={addSerie}
            className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-accent hover:bg-accent/5 rounded-lg border border-dashed border-accent/20 transition-colors"
          >
            <Plus size={14} />
            Adicionar Série
          </button>

          <div className="pt-2">
             <label className="text-[10px] text-text-subtle font-bold uppercase block mb-1.5 pl-1">
                OBSERVAÇÕES DO EXERCÍCIO
              </label>
              <textarea
                className="input h-16 text-sm resize-none py-2"
                placeholder="Dica: manter cotovelos fechados..."
                value={exercicio.notas || ''}
                onChange={(e) => onUpdate({ notas: e.target.value })}
              />
          </div>

          <div className="pt-1">
             <label className="text-[10px] text-text-subtle font-bold uppercase block mb-1.5 pl-1">
                Descanso (segundos)
              </label>
              <input
                type="number"
                className="input h-10 text-sm"
                value={exercicio.descansoSegundos}
                onChange={(e) => onUpdate({ descansoSegundos: parseInt(e.target.value) || 0 })}
              />
          </div>
        </div>
      )}
    </div>
  )
}
