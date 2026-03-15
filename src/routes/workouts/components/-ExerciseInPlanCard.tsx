import { useState } from 'react'
import { ChevronDown, GripVertical, Plus, Trash2, RefreshCw, Unlink } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ExerciseInPlan, PlanSet, SetType } from '../../../types'

interface ExerciseInPlanCardProps {
  exercise: ExerciseInPlan
  onUpdate: (field: Partial<ExerciseInPlan>) => void
  onRemove: () => void
  isSelected?: boolean
  onToggleSelect?: () => void
  showSelect?: boolean
  onRemoveFromGroup?: () => void
}

export function ExerciseInPlanCard({
  exercise,
  onUpdate,
  onRemove,
  isSelected,
  onToggleSelect,
  showSelect,
  onRemoveFromGroup,
}: ExerciseInPlanCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [applyAll, setApplyAll] = useState<{
    field: 'weight' | 'reps'
    sIdx: number
    value: number
  } | null>(null)
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: exercise.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  const series = exercise.setsDetail || []

  const addSet = () => {
    const last = series[series.length - 1]
    const newRow = last ? { ...last } : { weight: 0, reps: 10 }
    const newSeries = [...series, newRow]
    onUpdate({ series: newSeries.length, setsDetail: newSeries })
  }

  const removeSet = (idx: number) => {
    const newSeries = series.filter((_, i: number) => i !== idx)
    onUpdate({ series: newSeries.length, setsDetail: newSeries })
  }

  const updateSet = (idx: number, field: Partial<PlanSet>) => {
    const newSeries = series.map((s: PlanSet, i: number) =>
      i === idx ? { ...s, ...field } : s
    )
    onUpdate({ setsDetail: newSeries })
    if (series.length > 1) {
      if ('weight' in field && field.weight !== undefined) {
        setApplyAll({ field: 'weight', sIdx: idx, value: field.weight })
      } else if ('reps' in field && field.reps !== undefined) {
        setApplyAll({ field: 'reps', sIdx: idx, value: field.reps })
      }
    }
  }

  const setType = exercise.setType ?? 'reps'
  const cycle: SetType[] = ['reps', 'tempo', 'falha']
  const nextType = cycle[(cycle.indexOf(setType) + 1) % cycle.length]
  const labels: Record<SetType, string> = { reps: 'REPS', tempo: 'MIN', falha: 'FAIL ⚡' }
  const nextLabels: Record<SetType, string> = { reps: 'Min', tempo: 'Fail', falha: 'Reps' }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card p-3 transition-opacity ${isDragging ? 'opacity-50' : 'animate-scale-in'}`}
    >
      <div className="flex items-center gap-3">
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 touch-none select-none"
        >
          <GripVertical size={16} className="text-text-subtle shrink-0" />
        </div>
        {showSelect && !exercise.groupingId && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              onToggleSelect?.()
            }}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
              isSelected ? 'bg-accent border-accent  text-white' : 'border-border-strong'
            }`}
          >
            {isSelected && <span className="text-xs">✓</span>}
          </button>
        )}
        {exercise.groupingId && onRemoveFromGroup && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              onRemoveFromGroup()
            }}
            className="p-1 rounded-lg hover:bg-surface-2 text-text-subtle shrink-0"
            title="Remove from group"
          >
            <Unlink size={14} />
          </button>
        )}
        {exercise.exercise.gifUrl ? (
          <img
            src={exercise.exercise.gifUrl}
            alt={exercise.exercise.name}
            className="w-10 h-10 rounded-lg object-cover bg-surface-2"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
            <span className="text-lg">💪</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-text font-semibold text-sm truncate">{exercise.exercise.name}</p>
          <p className="text-text-muted text-xs">
            {series.length} sets {series.length > 0 && `(Target: ${series[0].reps} reps)`}
          </p>
        </div>
        <button type="button" onClick={() => setExpanded(e => !e)} className="btn-ghost p-2">
          <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        <button type="button" onClick={onRemove} className="btn-ghost p-2 text-danger">
          <Trash2 size={15} />
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 px-2 text-[10px] font-bold uppercase tracking-wider">
            <span className="text-center text-text-subtle">#</span>
            <span className="text-center text-text-subtle">PESO (KG)</span>
            <button
              type="button"
              onClick={() => {
                const updates: Partial<ExerciseInPlan> = { setType: nextType }
                if (nextType === 'tempo') {
                  updates.setsDetail = series.map(s => ({ ...s, reps: 1 }))
                }
                onUpdate(updates)
                setApplyAll(null)
              }}
              title={`Switch to: ${nextLabels[setType]}`}
              className={`flex items-center justify-center gap-1 rounded-md border px-1.5 py-0.5 transition-colors ${
                setType === 'reps'
                  ? 'text-text-muted border-border hover:text-accent hover:border-accent /50'
                  : 'text-accent border-accent /40 bg-accent/10'
              }`}
            >
              {labels[setType]}
              <RefreshCw size={8} className="opacity-60" />
            </button>
            <span />
          </div>

          <div className="flex flex-col gap-2">
            {series.map((s, i) => (
              <div
                key={i}
                className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 items-center bg-surface-2/50 p-1 rounded-lg"
              >
                <span className="text-[11px] font-bold text-text-muted text-center">{i + 1}</span>
                <input
                  type="number"
                  className="set-input h-9! py-0! text-sm!"
                  value={s.weight === 0 ? '' : s.weight}
                  onChange={e =>
                    updateSet(i, { weight: e.target.value === '' ? 0 : parseFloat(e.target.value) })
                  }
                  onFocus={e => e.target.select()}
                  placeholder="0"
                />
                <input
                  type="number"
                  className="set-input h-9! py-0! text-sm!"
                  value={
                    setType === 'tempo'
                      ? s.reps === 0
                        ? ''
                        : s.reps
                      : s.reps === 0
                        ? ''
                        : s.reps
                  }
                  onChange={e =>
                    updateSet(i, {
                      reps:
                        e.target.value === ''
                          ? 0
                          : setType === 'tempo'
                            ? parseFloat(e.target.value)
                            : parseInt(e.target.value, 10),
                    })
                  }
                  onFocus={e => e.target.select()}
                  placeholder={setType === 'falha' ? 'Fail' : setType === 'tempo' ? '0.0' : '0'}
                  step={setType === 'tempo' ? '0.5' : '1'}
                />
                <button
                  type="button"
                  onClick={() => removeSet(i)}
                  className="btn-ghost p-1.5 text-text-subtle hover:text-danger"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {applyAll && (
            <div className="bg-accent/10 border border-accent /20 rounded-xl px-3 py-2.5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-text-muted">
                  Repeat{' '}
                  <strong className="text-text">
                    {applyAll.field === 'weight'
                      ? `${applyAll.value} kg`
                      : applyAll.field === 'reps' && (exercise.setType ?? 'reps') === 'tempo'
                        ? `${applyAll.value} min`
                        : `${applyAll.value} reps`}
                  </strong>{' '}
                  to:
                </p>
                <button
                  type="button"
                  onClick={() => setApplyAll(null)}
                  className="w-5 h-5 flex items-center justify-center rounded-full text-text-subtle hover:text-text hover:bg-surface-2 transition-colors text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-1.5">
                {applyAll.sIdx < series.length - 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newSeries = series.map((s: PlanSet, i: number) =>
                        i > applyAll.sIdx ? { ...s, [applyAll.field]: applyAll.value } : s
                      )
                      onUpdate({ setsDetail: newSeries })
                      setApplyAll(null)
                    }}
                    className="flex-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-accent bg-accent/10 border border-accent /20"
                  >
                    ↓ Below
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const newSeries = series.map((s: PlanSet) => ({
                      ...s,
                      [applyAll.field]: applyAll.value,
                    }))
                    onUpdate({ setsDetail: newSeries })
                    setApplyAll(null)
                  }}
                  className="flex-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-accent"
                >
                  All
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={addSet}
            className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-accent hover:bg-accent/5 rounded-lg border border-dashed border-accent /20 transition-colors"
          >
            <Plus size={14} />
            Add Set
          </button>

          <div className="pt-2">
            <label className="text-[10px] text-text-subtle font-bold uppercase block mb-1.5 pl-1">
              EXERCISE NOTES
            </label>
            <textarea
              className="input h-16 text-sm resize-none py-2"
              placeholder="Tip: keep elbows close..."
              value={exercise.notes || ''}
              onChange={e => onUpdate({ notes: e.target.value })}
            />
          </div>

          <div className="pt-1">
            <label className="text-[10px] text-text-subtle font-bold uppercase block mb-1.5 pl-1">
              Rest (seconds)
            </label>
            <input
              type="number"
              className="input h-10 text-sm"
              value={exercise.restSeconds}
              onChange={e => onUpdate({ restSeconds: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      )}
    </div>
  )
}
