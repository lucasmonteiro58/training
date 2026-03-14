import { Link } from '@tanstack/react-router'
import { Clock, ChevronRight } from 'lucide-react'
import { formatarTempo } from '../../../lib/notifications'

interface TreinoAtivoBannerProps {
  planoId: string
  pausado: boolean
  cronometroGeralSegundos: number
  exercicioAtualNome: string | null
  planoNome: string
}

export function TreinoAtivoBanner({
  planoId,
  pausado,
  cronometroGeralSegundos,
  exercicioAtualNome,
  planoNome,
}: TreinoAtivoBannerProps) {
  return (
    <Link
      to="/active-workout/$planId"
      params={{ planId }}
      className="block mb-4 animate-fade-up"
      style={{ textDecoration: 'none' }}
    >
      <div
        className={`card p-4 border-2 transition-colors ${
          pausado
            ? 'border-text-subtle bg-surface-2'
            : 'border-accent bg-accent-subtle animate-pulse-glow'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                pausado ? 'bg-text-subtle' : 'bg-accent'
              }`}
            >
              <Clock size={18} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-text font-bold text-sm">
                  {pausado ? 'Treino Pausado' : 'Treino Ativo'}
                </p>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-white text-[10px] font-bold tabular-nums transition-colors ${
                    pausado ? 'bg-text-subtle' : 'bg-accent'
                  }`}
                >
                  {formatarTempo(cronometroGeralSegundos)}
                </span>
              </div>
              <p className="text-text-muted text-xs mt-0.5">
                {exercicioAtualNome ?? planoNome}
              </p>
            </div>
          </div>
          <div
            className={`flex items-center gap-2 font-semibold text-sm transition-colors ${
              pausado ? 'text-text-muted' : 'text-accent'
            }`}
          >
            Continuar <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  )
}
