import { Link } from '@tanstack/react-router'
import { Dumbbell, Play, Archive, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useIniciarTreino } from '../../../hooks/useIniciarTreino'
import type { PlanoDeTreino } from '../../../types'

interface PlanoSortableCardProps {
  plano: PlanoDeTreino
  reordenando: boolean
  processando: string | null
  onArchive: (id: string) => void
}

export function PlanoSortableCard({
  plano,
  reordenando,
  processando,
  onArchive,
}: PlanoSortableCardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: plano.id })
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
              type="button"
              className="p-1 text-text-subtle touch-none cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={20} />
            </button>
          )}

          {!reordenando && (
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
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
            <p className="text-text font-semibold truncate">{plano.nome}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-text-muted">{plano.exercicios.length} exercícios</span>
            </div>
          </Link>

          {!reordenando && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center hover:bg-accent-hover transition-colors"
                onClick={() => handleIniciar(plano.id)}
              >
                <Play size={14} className="text-white ml-0.5" />
              </button>
              <button
                type="button"
                className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-subtle hover:text-accent hover:bg-[rgba(99,102,241,0.1)] transition-colors"
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
            {[...new Set(plano.exercicios.map(e => e.exercicio.grupoMuscular))]
              .slice(0, 4)
              .map(grupo => (
                <span
                  key={grupo}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 text-text-muted border border-border"
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
