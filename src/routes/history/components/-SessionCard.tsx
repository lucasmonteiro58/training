import { Link, useNavigate } from '@tanstack/react-router'
import { formatDuration } from '../../../lib/notifications'
import { Clock, Dumbbell, TrendingUp, ChevronRight, Trash2, RotateCcw, TimerOff } from 'lucide-react'
import type { WorkoutSession } from '../../../types'

interface SessionCardProps {
  session: WorkoutSession
  index: number
  onDelete: (id: string) => void
  /** Chamado ao clicar em Retornar. O responsável por navegar é o pai. */
  onRestore: (session: WorkoutSession) => void
}

export function SessionCard({ session, index, onDelete, onRestore }: SessionCardProps) {
  const navigate = useNavigate()
  const date = new Date(session.startedAt)
  const dateStr = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })

  const idleMinutes = session.idleSecondsDeducted
    ? Math.round(session.idleSecondsDeducted / 60)
    : 0

  const goToDetails = () => {
    navigate({ to: '/history/$sessionId', params: { sessionId: session.id } })
  }

  return (
    <div
      className="card p-4 animate-fade-up cursor-pointer"
      style={{ animationDelay: `${index * 40}ms` }}
      onClick={goToDetails}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-text font-bold">{session.planName}</p>
          <p className="text-text-muted text-xs mt-0.5 capitalize">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          {session.autoClosed && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 text-[10px] font-medium border border-amber-500/25">
              <TimerOff size={10} />
              Auto
            </span>
          )}
          <button
            type="button"
            onClick={() => onDelete(session.id)}
            className="btn-ghost p-2 text-text-subtle hover:text-danger"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb-3">
        {session.durationSeconds != null && (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-text-subtle" />
              <span className="text-xs text-text-muted">{formatDuration(session.durationSeconds)}</span>
            </div>
            {session.autoClosed && idleMinutes > 0 && (
              <span className="text-[10px] text-amber-400/90">
                {idleMinutes} min ociosos descontados
              </span>
            )}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Dumbbell size={13} className="text-text-subtle" />
          <span className="text-xs text-text-muted">{session.exercises.length} exercícios</span>
        </div>
        {session.totalVolume !== undefined && session.totalVolume > 0 && (
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-text-subtle" />
            <span className="text-xs text-text-muted">{Math.round(session.totalVolume)} kg</span>
          </div>
        )}
      </div>
      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onRestore(session)}
          className="flex-1 py-2 text-xs rounded-xl flex items-center justify-center gap-1 bg-accent/15 text-accent font-medium"
        >
          <RotateCcw size={13} /> Retornar
        </button>
        <Link to="/history/$sessionId" params={{ sessionId: session.id }} style={{ textDecoration: 'none' }} className="flex-1">
          <button type="button" className="btn-ghost w-full py-2 text-xs border border-border rounded-xl flex items-center justify-center gap-1">
            Detalhes <ChevronRight size={13} />
          </button>
        </Link>
      </div>
    </div>
  )
}
