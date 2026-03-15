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
import { formatarTempo } from '../../../lib/notifications'
import { GROUPING_CONFIG } from '../../../types'
import type { ExerciseInSession } from '../../../types'

interface ActiveWorkoutHeaderProps {
  cronometroGeralSegundos: number
  pausado: boolean
  onPause: () => void
  onResume: () => void
  exercicioAtual: ExerciseInSession
  exercicioAtualIndex: number
  totalExercicios: number
  onPrev: () => void
  onNext: () => void
  onNotas: () => void
  onFinalizar: () => void
  onClose: () => void
  onInfo: () => void
  hasNotas: boolean
  finalizando: boolean
  progresso: number
}

export function ActiveWorkoutHeader({
  cronometroGeralSegundos,
  pausado,
  onPause,
  onResume,
  exercicioAtual,
  exercicioAtualIndex,
  totalExercicios,
  onPrev,
  onNext,
  onNotas,
  onFinalizar,
  onClose,
  onInfo,
  hasNotas,
  finalizando,
  progresso,
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
          <span className="timer-sm text-text-muted">{formatarTempo(cronometroGeralSegundos)}</span>
          <button
            type="button"
            onClick={pausado ? onResume : onPause}
            className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-text-muted"
          >
            {pausado ? <Play size={16} /> : <Pause size={16} />}
          </button>
        </div>
        <button
          type="button"
          onClick={onNotas}
          className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-text-muted relative"
        >
          <FileText size={16} />
          {hasNotas && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent" />
          )}
        </button>
        <button
          type="button"
          onClick={onFinalizar}
          disabled={finalizando}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(34,197,94,0.12)] text-success text-sm font-semibold"
        >
          <Flag size={14} />
          {finalizando ? '...' : 'Finalizar'}
        </button>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progresso}%` }} />
      </div>

      <div className="flex items-center justify-between py-1">
        <button
          type="button"
          onClick={onPrev}
          disabled={exercicioAtualIndex === 0}
          className="btn-ghost p-1.5 disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-[10px] text-text-subtle font-medium">
            {exercicioAtualIndex + 1} / {totalExercicios}
          </p>
          <p className="text-text font-bold text-sm">{exercicioAtual.exerciseName}</p>
          <p className="text-[10px] text-text-muted">{exercicioAtual.muscleGroup}</p>
          {exercicioAtual.groupingId && (
            <span
              className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                color: GROUPING_CONFIG[exercicioAtual.groupingType ?? 'superset']?.cor,
                background: GROUPING_CONFIG[exercicioAtual.groupingType ?? 'superset']?.corBg,
              }}
            >
              {GROUPING_CONFIG[exercicioAtual.groupingType ?? 'superset']?.label}
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
            disabled={exercicioAtualIndex === totalExercicios - 1}
            className="btn-ghost p-1.5 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
