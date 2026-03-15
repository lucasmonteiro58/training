import { Link } from '@tanstack/react-router'
import { Clock, ChevronRight } from 'lucide-react'
import { formatDuration } from '../../../lib/notifications'

interface ActiveWorkoutBannerProps {
  planId: string
  isPaused: boolean
  totalTimerSeconds: number
  currentExerciseName: string | null
  planName: string
}

export function ActiveWorkoutBanner({
  planId,
  isPaused,
  totalTimerSeconds,
  currentExerciseName,
  planName,
}: ActiveWorkoutBannerProps) {
  return (
    <Link
      to="/active-workout/$planId"
      params={{ planId }}
      className="block mb-4 animate-fade-up"
      style={{ textDecoration: 'none' }}
    >
      <div
        className={`card p-4 border-2 transition-colors ${
          isPaused
            ? 'border-text-subtle bg-surface-2'
            : 'border-accent bg-accent-subtle animate-pulse-glow'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isPaused ? 'bg-text-subtle' : 'bg-accent'
              }`}
            >
              <Clock size={18} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-text font-bold text-sm">
                  {isPaused ? 'Treino Pausado' : 'Treino Ativo'}
                </p>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-white text-[10px] font-bold tabular-nums transition-colors ${
                    isPaused ? 'bg-text-subtle' : 'bg-accent'
                  }`}
                >
                  {formatDuration(totalTimerSeconds)}
                </span>
              </div>
              <p className="text-text-muted text-xs mt-0.5">
                {currentExerciseName ?? planName}
              </p>
            </div>
          </div>
          <div
            className={`flex items-center gap-2 font-semibold text-sm transition-colors ${
              isPaused ? 'text-text-muted' : 'text-accent'
            }`}
          >
            Continuar <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  )
}
