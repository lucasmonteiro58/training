import { Link, useNavigate } from '@tanstack/react-router'
import { formatarTempo } from '../../../lib/notifications'
import { Clock, Dumbbell, TrendingUp, ChevronRight, Trash2, RotateCcw } from 'lucide-react'
import type { SessaoDeTreino } from '../../../types'

interface SessaoCardProps {
  sessao: SessaoDeTreino
  index: number
  onExcluir: (id: string) => void
  onRetornar: (sessao: SessaoDeTreino) => void
}

export function SessaoCard({ sessao, index, onExcluir, onRetornar }: SessaoCardProps) {
  const navigate = useNavigate()
  const data = new Date(sessao.iniciadoEm)
  const dataStr = data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })

  return (
    <div className="card p-4 animate-fade-up" style={{ animationDelay: `${index * 40}ms` }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[var(--color-text)] font-bold">{sessao.planoNome}</p>
          <p className="text-[var(--color-text-muted)] text-xs mt-0.5 capitalize">{dataStr}</p>
        </div>
        <button
          onClick={() => onExcluir(sessao.id)}
          className="btn-ghost p-2 text-[var(--color-text-subtle)] hover:text-[var(--color-danger)]"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex gap-4 mb-3">
        {sessao.duracaoSegundos && (
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-[var(--color-text-subtle)]" />
            <span className="text-xs text-[var(--color-text-muted)]">{formatarTempo(sessao.duracaoSegundos)}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Dumbbell size={13} className="text-[var(--color-text-subtle)]" />
          <span className="text-xs text-[var(--color-text-muted)]">{sessao.exercicios.length} exercícios</span>
        </div>
        {sessao.volumeTotal !== undefined && sessao.volumeTotal > 0 && (
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-[var(--color-text-subtle)]" />
            <span className="text-xs text-[var(--color-text-muted)]">{Math.round(sessao.volumeTotal)} kg</span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            onRetornar(sessao)
            navigate({ to: '/treino-ativo/$planoId', params: { planoId: sessao.planoId } })
          }}
          className="flex-1 py-2 text-xs rounded-xl flex items-center justify-center gap-1 bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-medium"
        >
          <RotateCcw size={13} /> Retornar
        </button>
        <Link to="/historico/$sessaoId" params={{ sessaoId: sessao.id }} style={{ textDecoration: 'none' }} className="flex-1">
          <button className="btn-ghost w-full py-2 text-xs border border-[var(--color-border)] rounded-xl flex items-center justify-center gap-1">
            Detalhes <ChevronRight size={13} />
          </button>
        </Link>
      </div>
    </div>
  )
}
