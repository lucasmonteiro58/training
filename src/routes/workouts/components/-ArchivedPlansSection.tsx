import { Archive, ArchiveRestore, ChevronRight, Trash2 } from 'lucide-react'
import type { WorkoutPlan } from '../../../types'

interface ArchivedPlansSectionProps {
  plans: WorkoutPlan[]
  isExpanded: boolean
  processingId: string | null
  deletingId: string | null
  onToggle: () => void
  onRestore: (id: string) => void
  onDelete: (id: string, name: string) => void
}

export function ArchivedPlansSection({
  plans,
  isExpanded,
  processingId,
  deletingId,
  onToggle,
  onRestore,
  onDelete,
}: ArchivedPlansSectionProps) {
  if (plans.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between px-2 py-1 text-sm font-medium text-text-muted hover:text-text transition-colors"
      >
        <div className="flex items-center gap-2">
          <Archive size={16} />
          <span>Arquivados ({plans.length})</span>
        </div>
        <ChevronRight size={16} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {isExpanded && (
        <div className="flex flex-col gap-3 animate-fade-down">
          {plans.map(plan => (
            <div key={plan.id} className="card p-4 opacity-70 grayscale-[0.5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-surface-2">
                  <Archive size={18} className="text-text-muted" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-text font-semibold truncate text-sm">{plan.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{plan.exercises.length} exercícios</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center text-text-subtle hover:text-accent transition-colors"
                    onClick={() => onRestore(plan.id)}
                    disabled={processingId === plan.id}
                    title="Desarquivar"
                  >
                    <ArchiveRestore size={14} />
                  </button>
                  <button
                    type="button"
                    className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center text-text-subtle hover:text-danger transition-colors"
                    onClick={() => onDelete(plan.id, plan.name)}
                    disabled={deletingId === plan.id}
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
  )
}
