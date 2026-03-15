import { Clock, Dumbbell, TrendingUp } from 'lucide-react'
import { formatDuration } from '../../../lib/notifications'

interface SessionStatsProps {
  durationSeconds: number | undefined
  numExercicios: number
  totalVolume: number | undefined
  editando: boolean
  durationMinutes?: number
  onDurationChange?: (minutos: number) => void
  /** Quando o treino foi auto-encerrado: segundos de inatividade já descontados da duração */
  idleSecondsDeducted?: number
}

export function SessionStats({
  durationSeconds,
  numExercicios,
  totalVolume,
  editando,
  durationMinutes = 0,
  onDurationChange,
  idleSecondsDeducted,
}: SessionStatsProps) {
  const tempoOcioMin =
    idleSecondsDeducted != null && idleSecondsDeducted > 0
      ? Math.round(idleSecondsDeducted / 60)
      : 0

  return (
    <div className="grid grid-cols-3 gap-2 mb-5 animate-fade-up" style={{ animationDelay: '50ms' }}>
      <div className="card p-3 text-center">
        <Clock size={16} className="text-accent mx-auto mb-1" />
        {editando && onDurationChange ? (
          <div className="flex flex-col gap-1">
            <input
              type="number"
              min={0}
              className="w-full text-lg font-bold text-text bg-surface-2 rounded-lg px-2 py-1 text-center"
              value={durationMinutes}
              onChange={(e) => {
                const min = e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0
                onDurationChange(min * 60)
              }}
              onFocus={(e) => e.target.select()}
            />
            <span className="text-[10px] text-text-muted">min</span>
          </div>
        ) : (
          <>
            <p className="text-lg font-bold text-text">
              {durationSeconds != null ? formatDuration(durationSeconds) : '–'}
            </p>
            {tempoOcioMin > 0 && (
              <p className="text-[10px] text-amber-400/90 mt-0.5">
                {tempoOcioMin} min ociosos descontados
              </p>
            )}
          </>
        )}
        <p className="text-[10px] text-text-muted">Duração</p>
      </div>
      <div className="card p-3 text-center">
        <Dumbbell size={16} className="text-accent mx-auto mb-1" />
        <p className="text-lg font-bold text-text">{numExercicios}</p>
        <p className="text-[10px] text-text-muted">Exercícios</p>
      </div>
      <div className="card p-3 text-center">
        <TrendingUp size={16} className="text-accent mx-auto mb-1" />
        <p className="text-lg font-bold text-text">
          {totalVolume != null ? Math.round(totalVolume) : '–'}
        </p>
        <p className="text-[10px] text-text-muted">Volume (kg)</p>
      </div>
    </div>
  )
}
