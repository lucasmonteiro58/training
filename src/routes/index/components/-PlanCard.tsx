import { Link } from '@tanstack/react-router'
import { Dumbbell, Play } from 'lucide-react'
import { useStartWorkout } from '../../../hooks/useStartWorkout'

interface PlanCardProps {
  plano: { id: string; nome: string; cor?: string | null; exercicios: unknown[] }
}

export function PlanCard({ plano }: PlanCardProps) {
  const { handleIniciar, modal } = useStartWorkout()

  return (
    <>
      <Link to="/workouts/$planId" params={{ planId: plano.id }} style={{ textDecoration: 'none' }}>
        <div className="card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: plano.cor ?? '#6366f1' }}
            >
              <Dumbbell size={18} className="text-white" />
            </div>
            <div>
              <p className="text-text font-semibold text-sm">{plano.nome}</p>
              <p className="text-text-muted text-xs mt-0.5">{plano.exercicios.length} exercícios</p>
            </div>
          </div>
          <button
            type="button"
            className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center hover:bg-accent-hover transition-colors"
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              handleIniciar(plano.id)
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
