import { Link, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useActiveWorkoutStore } from '../../stores'
import { Clock } from 'lucide-react'
import { formatarTempo } from '../../lib/notifications'

export function FloatingWorkoutButton() {
  const location = useLocation()
  const iniciado = useActiveWorkoutStore((s) => s.iniciado)
  const pausado = useActiveWorkoutStore((s) => s.pausado)
  const sessao = useActiveWorkoutStore((s) => s.sessao)
  const exercicioAtualIndex = useActiveWorkoutStore((s) => s.exercicioAtualIndex)
  const cronometroGeralSegundos = useActiveWorkoutStore((s) => s.cronometroGeralSegundos)
  const tickGeral = useActiveWorkoutStore((s) => s.tickGeral)

  // Atualiza o tempo globalmente enquanto houver treino
  useEffect(() => {
    if (!iniciado || pausado) return
    const interval = setInterval(tickGeral, 1000)
    return () => clearInterval(interval)
  }, [iniciado, pausado, tickGeral])

  // Não mostrar se não houver treino ou se estiver na tela de treino ativo
  if (!iniciado || !sessao || location.pathname.startsWith('/active-workout')) {
    return null
  }

  const exercicioAtual = sessao.exercicios[exercicioAtualIndex]

  return (
    <Link
      to="/active-workout/$planId"
      params={{ planId: sessao.planoId }}
      className="fixed right-4 z-[60] animate-fade-up"
      style={{
        bottom: `calc(90px + env(safe-area-inset-bottom, 0px))`,
        textDecoration: 'none'
      }}
    >
      <div className={`w-14 h-14 rounded-full shadow-xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 border-2 ${
        pausado
          ? 'bg-surface-2 border-text-subtle/40'
          : 'bg-accent border-accent  ring-4 ring-accent/20'
      }`}>
        <Clock size={18} className="text-white" />
        <span className="text-white text-[9px] font-bold tabular-nums leading-none">
          {formatarTempo(cronometroGeralSegundos)}
        </span>
      </div>
    </Link>
  )
}
