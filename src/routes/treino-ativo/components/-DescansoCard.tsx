import { Timer, SkipForward } from 'lucide-react'
import { formatarTempo } from '../../../lib/notifications'

interface DescansoCardProps {
  segundosRestantes: number
  onPular: () => void
}

export function DescansoCard({ segundosRestantes, onPular }: DescansoCardProps) {
  return (
    <div className="mx-4 mb-4 p-4 rounded-2xl bg-surface border border-border flex items-center justify-between animate-scale-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
          <Timer size={20} className="text-accent" />
        </div>
        <div>
          <p className="text-xs text-text-muted font-medium">Descanso</p>
          <p
            className={`text-2xl font-black tabular-nums ${
              segundosRestantes <= 10 && segundosRestantes > 0 ? 'text-warning' : 'text-text'
            }`}
          >
            {formatarTempo(segundosRestantes)}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onPular}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-2 text-text-muted text-sm font-semibold hover:bg-surface-3 transition-colors"
      >
        <SkipForward size={14} />
        Pular
      </button>
    </div>
  )
}
