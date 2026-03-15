import { Link, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useActiveWorkoutStore } from '../../stores'
import { Clock } from 'lucide-react'
import { formatarTempo } from '../../lib/notifications'

export function FloatingWorkoutButton() {
  const location = useLocation()
  const started = useActiveWorkoutStore((s) => s.started)
  const paused = useActiveWorkoutStore((s) => s.paused)
  const session = useActiveWorkoutStore((s) => s.session)
  const totalTimerSeconds = useActiveWorkoutStore((s) => s.totalTimerSeconds)
  const tickTotal = useActiveWorkoutStore((s) => s.tickTotal)

  // Atualiza o tempo globalmente enquanto houver treino
  useEffect(() => {
    if (!started || paused) return
    const interval = setInterval(tickTotal, 1000)
    return () => clearInterval(interval)
  }, [started, paused, tickTotal])

  // Não mostrar se não houver treino ou se estiver na tela de treino ativo
  if (!started || !session || location.pathname.startsWith('/active-workout')) {
    return null
  }

  return (
    <Link
      to="/active-workout/$planId"
      params={{ planId: session.planId }}
      className="fixed right-4 z-[60] animate-fade-up"
      style={{
        bottom: `calc(90px + env(safe-area-inset-bottom, 0px))`,
        textDecoration: 'none'
      }}
    >
      <div className={`w-14 h-14 rounded-full shadow-xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 border-2 ${
        paused
          ? 'bg-surface-2 border-text-subtle/40'
          : 'bg-accent border-accent  ring-4 ring-accent/20'
      }`}>
        <Clock size={18} className="text-white" />
        <span className="text-white text-[9px] font-bold tabular-nums leading-none">
          {formatarTempo(totalTimerSeconds)}
        </span>
      </div>
    </Link>
  )
}
