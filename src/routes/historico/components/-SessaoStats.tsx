import { Clock, Dumbbell, TrendingUp } from 'lucide-react'
import { formatarTempo } from '../../../lib/notifications'

interface SessaoStatsProps {
  duracaoSegundos: number | undefined
  numExercicios: number
  volumeTotal: number | undefined
  editando: boolean
  duracaoMinutos?: number
  onDuracaoChange?: (minutos: number) => void
}

export function SessaoStats({
  duracaoSegundos,
  numExercicios,
  volumeTotal,
  editando,
  duracaoMinutos = 0,
  onDuracaoChange,
}: SessaoStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 mb-5 animate-fade-up" style={{ animationDelay: '50ms' }}>
      <div className="card p-3 text-center">
        <Clock size={16} className="text-accent mx-auto mb-1" />
        {editando && onDuracaoChange ? (
          <div className="flex flex-col gap-1">
            <input
              type="number"
              min={0}
              className="w-full text-lg font-bold text-text bg-surface-2 rounded-lg px-2 py-1 text-center"
              value={duracaoMinutos}
              onChange={(e) => {
                const min = e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0
                onDuracaoChange(min * 60)
              }}
              onFocus={(e) => e.target.select()}
            />
            <span className="text-[10px] text-text-muted">min</span>
          </div>
        ) : (
          <p className="text-lg font-bold text-text">
            {duracaoSegundos ? formatarTempo(duracaoSegundos) : '–'}
          </p>
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
          {volumeTotal != null ? Math.round(volumeTotal) : '–'}
        </p>
        <p className="text-[10px] text-text-muted">Volume (kg)</p>
      </div>
    </div>
  )
}
