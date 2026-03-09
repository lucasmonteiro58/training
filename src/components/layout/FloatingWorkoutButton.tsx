import { Link, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTreinoAtivoStore } from '../../stores'
import { Clock, ChevronRight } from 'lucide-react'
import { formatarTempo } from '../../lib/notifications'

export function FloatingWorkoutButton() {
  const location = useLocation()
  const iniciado = useTreinoAtivoStore((s) => s.iniciado)
  const pausado = useTreinoAtivoStore((s) => s.pausado)
  const sessao = useTreinoAtivoStore((s) => s.sessao)
  const exercicioAtualIndex = useTreinoAtivoStore((s) => s.exercicioAtualIndex)
  const cronometroGeralSegundos = useTreinoAtivoStore((s) => s.cronometroGeralSegundos)
  const tickGeral = useTreinoAtivoStore((s) => s.tickGeral)

  // Atualiza o tempo globalmente enquanto houver treino
  useEffect(() => {
    if (!iniciado || pausado) return
    const interval = setInterval(tickGeral, 1000)
    return () => clearInterval(interval)
  }, [iniciado, pausado, tickGeral])

  // Não mostrar se não houver treino ou se estiver na tela de treino ativo
  if (!iniciado || !sessao || location.pathname.startsWith('/treino-ativo')) {
    return null
  }

  const exercicioAtual = sessao.exercicios[exercicioAtualIndex]

  return (
    <Link
      to="/treino-ativo/$planoId"
      params={{ planoId: sessao.planoId }}
      className="fixed bottom-24 left-4 right-4 z-50 animate-fade-up"
      style={{ textDecoration: 'none' }}
    >
      <div className={`card p-3 shadow-xl border-2 transition-all active:scale-95 ${
        pausado
          ? 'border-text-subtle bg-surface-2 opacity-90'
          : 'border-accent bg-accent-subtle ring-4 ring-accent/5'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              pausado ? 'bg-text-subtle' : 'bg-accent'
            }`}>
              <Clock size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-text font-bold text-xs truncate">
                  {pausado ? 'Pausado' : 'Treino Ativo'}
                </p>
                <span className={`px-1.5 py-0.5 rounded-md text-white text-[9px] font-bold tabular-nums transition-colors ${
                  pausado ? 'bg-text-subtle' : 'bg-accent'
                }`}>
                  {formatarTempo(cronometroGeralSegundos)}
                </span>
              </div>
              <p className="text-text-muted text-[10px] truncate mt-0.5 font-medium">
                {exercicioAtual ? exercicioAtual.exercicioNome : sessao.planoNome}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className={pausado ? 'text-text-subtle' : 'text-accent'} />
        </div>
      </div>
    </Link>
  )
}
