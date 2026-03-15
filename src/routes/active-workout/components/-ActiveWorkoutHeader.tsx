import {
  ChevronLeft,
  ChevronRight,
  Timer,
  Pause,
  Play,
  Flag,
  FileText,
  Info,
  XCircle,
} from 'lucide-react'
import { formatDuration } from '../../../lib/notifications'
import { GROUPING_CONFIG } from '../../../types'
import type { ExerciseInSession } from '../../../types'

interface ActiveWorkoutHeaderProps {
  totalTimerSeconds: number
  isPaused: boolean
  onPause: () => void
  onResume: () => void
  currentExercise: ExerciseInSession
  currentExerciseIndex: number
  totalExercises: number
  onPrev: () => void
  onNext: () => void
  onNotes: () => void
  onFinish: () => void
  onClose: () => void
  onInfo: () => void
  hasNotes: boolean
  isFinishing: boolean
  progress: number
}

export function ActiveWorkoutHeader({
  totalTimerSeconds,
  isPaused,
  onPause,
  onResume,
  currentExercise,
  currentExerciseIndex,
  totalExercises,
  onPrev,
  onNext,
  onNotes,
  onFinish,
  onClose,
  onInfo,
  hasNotes,
  isFinishing,
  progress,
}: ActiveWorkoutHeaderProps) {
  return (
    <div className="px-4 pt-4 pb-2 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-text-muted"
        >
          <XCircle size={18} />
        </button>
        <div className="flex items-center gap-2">
          <Timer size={14} className="text-text-subtle" />
          <span className="timer-sm text-text-muted">{formatDuration(totalTimerSeconds)}</span>
          <button
            type="button"
            onClick={isPaused ? onResume : onPause}
            className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-text-muted"
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        </div>
        <button
          type="button"
          onClick={onNotes}
          className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-text-muted relative"
        >
          <FileText size={16} />
          {hasNotes && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent" />
          )}
        </button>
        <button
          type="button"
          onClick={onFinish}
          disabled={isFinishing}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(34,197,94,0.12)] text-success text-sm font-semibold"
        >
          <Flag size={14} />
          {isFinishing ? '...' : 'Finalizar'}
        </button>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex items-center justify-between py-1">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentExerciseIndex === 0}
          className="btn-ghost p-1.5 disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-[10px] text-text-subtle font-medium">
            {currentExerciseIndex + 1} / {totalExercises}
          </p>
          <p className="text-text font-bold text-sm">{currentExercise.exerciseName}</p>
          <p className="text-[10px] text-text-muted">{currentExercise.muscleGroup}</p>
          {currentExercise.groupingId && (
            <span
              className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                color: GROUPING_CONFIG[currentExercise.groupingType ?? 'superset']?.cor,
                background: GROUPING_CONFIG[currentExercise.groupingType ?? 'superset']?.corBg,
              }}
            >
              {GROUPING_CONFIG[currentExercise.groupingType ?? 'superset']?.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onInfo} className="btn-ghost p-1.5">
            <Info size={18} className="text-accent" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={currentExerciseIndex === totalExercises - 1}
            className="btn-ghost p-1.5 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
