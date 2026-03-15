import { Link } from '@tanstack/react-router'
import { Dumbbell, Play, Archive, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStartWorkout } from '../../../hooks/useStartWorkout'
import type { WorkoutPlan } from '../../../types'

interface PlanSortableCardProps {
  plan: WorkoutPlan
  isReordering: boolean
  processingId: string | null
  onArchive: (id: string) => void
}

export function PlanSortableCard({
  plan,
  isReordering,
  processingId,
  onArchive,
}: PlanSortableCardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: plan.id })
  const { handleStart, modal } = useStartWorkout()

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
          {isReordering && (
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

          {!isReordering && (
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: `${plan.color ?? '#6366f1'}22` }}
            >
              <Dumbbell size={20} style={{ color: plan.color ?? '#6366f1' }} />
            </div>
          )}

          <Link
            to="/workouts/$planId"
            params={{ planId: plan.id }}
            className="flex-1 min-w-0"
            style={{ textDecoration: 'none' }}
          >
            <p className="text-text font-semibold truncate">{plan.name}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-text-muted">{plan.exercises.length} exercícios</span>
            </div>
          </Link>

          {!isReordering && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center hover:bg-accent-hover transition-colors"
                onClick={() => handleStart(plan.id)}
              >
                <Play size={14} className="text-white ml-0.5" />
              </button>
              <button
                type="button"
                className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-subtle hover:text-accent hover:bg-[rgba(99,102,241,0.1)] transition-colors"
                onClick={() => onArchive(plan.id)}
                disabled={processingId === plan.id}
                title="Arquivar"
              >
                <Archive size={14} />
              </button>
            </div>
          )}
        </div>

        {!isReordering && plan.exercises.length > 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {[...new Set(plan.exercises.map((e: { exercise: { muscleGroup: string } }) => e.exercise.muscleGroup))]
              .slice(0, 4)
              .map(group => (
                <span
                  key={group}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 text-text-muted border border-border"
                >
                  {group}
                </span>
              ))}
          </div>
        )}
      </div>
      {modal}
    </>
  )
}
