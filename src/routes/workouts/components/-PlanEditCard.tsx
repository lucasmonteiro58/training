import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import type { ImportedPlan } from '../../../lib/csvImport'
import { ExerciseEditCard } from './-ExerciseEditCard'

export type EditedPlan = ImportedPlan & { collapsed: boolean }

interface PlanEditCardProps {
  plan: EditedPlan
  expandedExs: Set<string>
  onToggleEx: (id: string) => void
  onChange: (fn: (p: EditedPlan) => EditedPlan) => void
  onRemove: () => void
}

export function PlanEditCard({
  plan,
  expandedExs,
  onToggleEx,
  onChange,
  onRemove,
}: PlanEditCardProps) {
  const totalExs = plan.exercises.length
  const totalSeries = plan.exercises.reduce(
    (acc, e) => acc + (e.setsDetail?.length ?? e.series),
    0
  )

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-surface-2/60">
        <button
          type="button"
          onClick={() => onChange(p => ({ ...p, collapsed: !p.collapsed }))}
          className="text-text-muted"
        >
          {plan.collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
        <div className="flex-1 min-w-0">
          <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1 block">
            NOME DO PLANO
          </label>
          <input
            className="input py-1.5 text-sm font-semibold w-full"
            value={plan.name}
            onChange={e => onChange(p => ({ ...p, name: e.target.value }))}
            onClick={e => e.stopPropagation()}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-danger opacity-60 hover:opacity-100 shrink-0"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {!plan.collapsed && (
        <div className="p-3 flex flex-col gap-2">
          <p className="text-xs text-text-muted mb-1">
            {totalExs} exercício{totalExs !== 1 ? 's' : ''} · {totalSeries} série
            {totalSeries !== 1 ? 's' : ''} no total
          </p>
          {plan.exercises.map((ex, i) => (
            <ExerciseEditCard
              key={ex.id}
              ex={ex}
              idx={i}
              expanded={expandedExs.has(ex.id)}
              onToggle={() => onToggleEx(ex.id)}
              onUpdate={fn =>
                onChange(p => ({
                  ...p,
                  exercises: p.exercises.map((e) => (e.id === ex.id ? fn(e) : e)),
                }))
              }
              onRemove={() =>
                onChange(p => ({ ...p, exercises: p.exercises.filter((e) => e.id !== ex.id) }))
              }
            />
          ))}
          {plan.exercises.length === 0 && (
            <p className="text-xs text-text-subtle text-center py-4">
              Nenhum exercício. Remova este plano ou adicione exercícios manualmente.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
