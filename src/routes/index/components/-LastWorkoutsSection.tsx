import { Link } from '@tanstack/react-router'
import { formatDuration } from '../../../lib/notifications'

interface SessionSummary {
  id: string
  planName: string
  startedAt: number
  durationSeconds?: number
  totalVolume?: number
}

interface LastWorkoutsSectionProps {
  sessions: SessionSummary[]
  loading: boolean
}

export function LastWorkoutsSection({ sessions, loading }: LastWorkoutsSectionProps) {
  if (loading) {
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

  if (sessions.length === 0) return null

  return (
    <div className="mb-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-text">Últimos Treinos</h2>
        <Link to="/history" className="text-accent text-sm font-medium" style={{ textDecoration: 'none' }}>
          Histórico
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {sessions.map(session => (
          <Link
            key={session.id}
            to="/history/$sessionId"
            params={{ sessionId: session.id }}
            style={{ textDecoration: 'none' }}
          >
            <div className="card p-4 flex items-center justify-between">
              <div>
                <p className="text-text font-semibold text-sm">{session.planName}</p>
                <p className="text-text-muted text-xs mt-0.5">
                  {new Date(session.startedAt).toLocaleDateString('pt-BR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
              <div className="text-right">
                {session.durationSeconds != null && (
                  <p className="text-text-muted text-xs font-medium">
                    {formatDuration(session.durationSeconds)}
                  </p>
                )}
                {session.totalVolume !== undefined && (
                  <p className="text-text-subtle text-xs mt-0.5">
                    {Math.round(session.totalVolume)} kg
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
