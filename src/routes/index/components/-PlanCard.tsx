import { Link } from '@tanstack/react-router'
import { Dumbbell, Play } from 'lucide-react'
import { useStartWorkout } from '../../../hooks/useStartWorkout'

interface PlanCardProps {
  plan: { id: string; name: string; color?: string | null; exercises: unknown[] }
}

export function PlanCard({ plan }: PlanCardProps) {
  const { handleStart, modal } = useStartWorkout()

  return (
    <>
      <Link to="/workouts/$planId" params={{ planId: plan.id }} style={{ textDecoration: 'none' }}>
        <div className="card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: plan.color ?? '#6366f1' }}
            >
              <Dumbbell size={18} className="text-white" />
            </div>
            <div>
              <p className="text-text font-semibold text-sm">{plan.name}</p>
              <p className="text-text-muted text-xs mt-0.5">{plan.exercises.length} exercícios</p>
            </div>
          </div>
          <button
            type="button"
            className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center hover:bg-accent-hover transition-colors"
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              handleStart(plan.id)
            }}
          >
            <Play size={14} className="text-white ml-0.5" />
          </button>
        </div>
      </Link>
      {modal}
    </>
  )
}
