import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { usePlanos } from '../../hooks/usePlanos'
import { Dumbbell, Plus, FileUp, Play, ChevronRight, Trash2, Archive, ArchiveRestore, GripVertical, ArrowUpDown } from 'lucide-react'
import { useState } from 'react'
import { useIniciarTreino } from '../../hooks/useIniciarTreino'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { PlanoDeTreino } from '../../types'

export const Route = createFileRoute('/treinos/')({
  component: TreinosPage,
})

function PlanoSortableCard({
  plano,
  reordenando,
  processando,
  deletando,
  onArchive,
  onDelete,
}: {
  plano: PlanoDeTreino
  reordenando: boolean
  processando: string | null
  deletando: string | null
  onArchive: (id: string) => void
  onDelete: (id: string, nome: string) => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: plano.id })
  const navigate = useNavigate()
  const { handleIniciar, modal } = useIniciarTreino()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <>
      <div ref={setNodeRef} style={style} className="card p-4 animate-fade-up">
      <div className="flex items-center gap-3">
        {reordenando && (
          <button
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            className="p-1 text-[var(--color-text-subtle)] touch-none cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={20} />
          </button>
        )}

        {!reordenando && (
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${plano.cor ?? '#6366f1'}22` }}
          >
            <Dumbbell size={20} style={{ color: plano.cor ?? '#6366f1' }} />
          </div>
        )}

        <Link
          to="/treinos/$planoId"
          params={{ planoId: plano.id }}
          className="flex-1 min-w-0"
          style={{ textDecoration: 'none' }}
        >
          <p className="text-[var(--color-text)] font-semibold truncate">{plano.nome}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-[var(--color-text-muted)]">
              {plano.exercicios.length} exercícios
            </span>
          </div>
        </Link>

        {!reordenando && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              className="w-10 h-10 rounded-xl bg-[var(--color-accent)] flex items-center justify-center hover:bg-[var(--color-accent-hover)] transition-colors"
              onClick={() => handleIniciar(plano.id)}
            >
              <Play size={14} className="text-white ml-0.5" />
            </button>
            <button
              className="w-10 h-10 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-subtle)] hover:text-[var(--color-accent)] hover:bg-[rgba(99,102,241,0.1)] transition-colors"
              onClick={() => onArchive(plano.id)}
              disabled={processando === plano.id}
              title="Arquivar"
            >
              <Archive size={14} />
            </button>
          </div>
        )}
      </div>

      {!reordenando && plano.exercicios.length > 0 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {[...new Set(plano.exercicios.map((e) => e.exercicio.grupoMuscular))]
            .slice(0, 4)
            .map((grupo) => (
              <span
                key={grupo}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
              >
                {grupo}
              </span>
            ))}
        </div>
      )}
    </div>
      {modal}
    </>
  )
}

function TreinosPage() {
  const {
    planosAtivos,
    planosArquivados,
    loading,
    excluirPlano,
    arquivarPlano,
    desarquivarPlano,
    reordenarPlanos,
  } = usePlanos()
  const [deletando, setDeletando] = useState<string | null>(null)
  const [processando, setProcessando] = useState<string | null>(null)
  const [mostrarArquivados, setMostrarArquivados] = useState(false)
  const [reordenando, setReordenando] = useState(false)
  const [ordemLocal, setOrdemLocal] = useState<PlanoDeTreino[]>([])
  const navigate = useNavigate()

  const listaOrdenada = reordenando ? ordemLocal : planosAtivos

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = ordemLocal.findIndex((p) => p.id === active.id)
    const newIdx = ordemLocal.findIndex((p) => p.id === over.id)
    setOrdemLocal(arrayMove(ordemLocal, oldIdx, newIdx))
  }

  const handleToggleReordenar = () => {
    if (!reordenando) {
      setOrdemLocal([...planosAtivos])
      setReordenando(true)
    } else {
      reordenarPlanos(ordemLocal.map((p) => p.id))
      setReordenando(false)
    }
  }

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Excluir o plano "${nome}"? Esta ação não pode ser desfeita.`)) return
    setDeletando(id)
    await excluirPlano(id)
    setDeletando(null)
  }

  const handleArchive = async (id: string) => {
    setProcessando(id)
    await arquivarPlano(id)
    setProcessando(null)
  }

  const handleRestore = async (id: string) => {
    setProcessando(id)
    await desarquivarPlano(id)
    setProcessando(null)
  }

  return (
    <div className="page-container pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Meus Treinos</h1>
        <div className="flex gap-2 items-center">
          {planosAtivos.length > 1 && (
            <button
              className={`btn-ghost flex items-center gap-1.5 text-sm ${
                reordenando ? 'text-[var(--color-accent)] font-semibold' : ''
              }`}
              onClick={handleToggleReordenar}
            >
              <ArrowUpDown size={16} />
              {reordenando ? 'Salvar' : 'Ordenar'}
            </button>
          )}
          {!reordenando && (
            <>
              <Link to="/treinos/importar" style={{ textDecoration: 'none' }}>
                <button
                  className="btn-ghost flex items-center gap-1.5 text-sm"
                  title="Importar CSV"
                >
                  <FileUp size={16} />
                  CSV
                </button>
              </Link>
              <Link to="/treinos/novo" style={{ textDecoration: 'none' }}>
                <button className="btn-primary flex items-center gap-1.5 py-2.5 px-4 text-sm">
                  <Plus size={16} />
                  Novo
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : planosAtivos.length === 0 && planosArquivados.length === 0 ? (
        <div className="flex flex-col items-center gap-6 mt-16 animate-scale-in">
          <div className="w-20 h-20 rounded-3xl bg-[var(--color-surface-2)] flex items-center justify-center">
            <Dumbbell size={36} className="text-[var(--color-text-subtle)]" />
          </div>
          <div className="text-center">
            <p className="text-[var(--color-text)] font-semibold text-lg">Nenhum plano ainda</p>
            <p className="text-[var(--color-text-muted)] text-sm mt-1">
              Crie seu primeiro plano ou importe via CSV
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Link to="/treinos/novo" style={{ textDecoration: 'none' }}>
              <button className="btn-primary w-full">Criar Plano</button>
            </Link>
            <Link to="/treinos/importar" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary w-full">
                <FileUp size={16} />
                Importar CSV
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Planos Ativos */}
          <div className="flex flex-col gap-3">
            {planosAtivos.length === 0 && (
              <p className="text-center text-[var(--color-text-muted)] text-sm py-8">
                Nenhum treino ativo no momento.
              </p>
            )}
            {reordenando ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={listaOrdenada.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                  {listaOrdenada.map((plano) => (
                    <PlanoSortableCard
                      key={plano.id}
                      plano={plano}
                      reordenando={reordenando}
                      processando={processando}
                      deletando={deletando}
                      onArchive={handleArchive}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              planosAtivos.map((plano, idx) => (
                <PlanoSortableCard
                  key={plano.id}
                  plano={plano}
                  reordenando={false}
                  processando={processando}
                  deletando={deletando}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>

          {/* Seção Arquivados */}
          {planosArquivados.length > 0 && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setMostrarArquivados(!mostrarArquivados)}
                className="flex items-center justify-between px-2 py-1 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Archive size={16} />
                  <span>Arquivados ({planosArquivados.length})</span>
                </div>
                <ChevronRight
                  size={16}
                  className={`transition-transform ${mostrarArquivados ? 'rotate-90' : ''}`}
                />
              </button>

              {mostrarArquivados && (
                <div className="flex flex-col gap-3 animate-fade-down">
                  {planosArquivados.map((plano) => (
                    <div
                      key={plano.id}
                      className="card p-4 opacity-70 grayscale-[0.5]"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--color-surface-2)]"
                        >
                          <Archive size={18} className="text-[var(--color-text-muted)]" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[var(--color-text)] font-semibold truncate text-sm">{plano.nome}</p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                            {plano.exercicios.length} exercícios
                          </p>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            className="w-9 h-9 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-subtle)] hover:text-[var(--color-accent)] transition-colors"
                            onClick={() => handleRestore(plano.id)}
                            disabled={processando === plano.id}
                            title="Desarquivar"
                          >
                            <ArchiveRestore size={14} />
                          </button>
                          <button
                            className="w-9 h-9 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-subtle)] hover:text-[var(--color-danger)] transition-colors"
                            onClick={() => handleDelete(plano.id, plano.nome)}
                            disabled={deletando === plano.id}
                            title="Excluir Permanentemente"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
