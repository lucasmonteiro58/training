import { Link } from '@tanstack/react-router'
import { formatarTempo } from '../../../lib/notifications'

interface SessionSummary {
  id: string
  planName: string
  startedAt: number
  durationSeconds?: number
  totalVolume?: number
}

interface LastWorkoutsSectionProps {
  sessoes: SessionSummary[]
  carregando: boolean
}

export function LastWorkoutsSection({ sessoes, carregando }: LastWorkoutsSectionProps) {
  if (carregando) {
    return (
      <div className="mb-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-text">Últimos Treinos</h2>
        </div>
        <div className="flex flex-col gap-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="skeleton h-[68px] rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (sessoes.length === 0) return null

  return (
    <div className="mb-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-text">Últimos Treinos</h2>
        <Link to="/history" className="text-accent text-sm font-medium" style={{ textDecoration: 'none' }}>
          Histórico
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {sessoes.map(sessao => (
          <Link
            key={sessao.id}
            to="/history/$sessionId"
            params={{ sessionId: sessao.id }}
            style={{ textDecoration: 'none' }}
          >
            <div className="card p-4 flex items-center justify-between">
              <div>
                <p className="text-text font-semibold text-sm">{sessao.planName}</p>
                <p className="text-text-muted text-xs mt-0.5">
                  {new Date(sessao.startedAt).toLocaleDateString('pt-BR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
              <div className="text-right">
                {sessao.durationSeconds != null && (
                  <p className="text-text-muted text-xs font-medium">
                    {formatarTempo(sessao.durationSeconds)}
                  </p>
                )}
                {sessao.totalVolume !== undefined && (
                  <p className="text-text-subtle text-xs mt-0.5">
                    {Math.round(sessao.totalVolume)} kg
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
