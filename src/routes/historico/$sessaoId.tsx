import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useHistorico } from '../../hooks/useHistorico'
import { formatarTempo } from '../../lib/notifications'
import { ArrowLeft, Clock, Dumbbell, TrendingUp, CheckCircle2, Circle } from 'lucide-react'

export const Route = createFileRoute('/historico/$sessaoId')({
  component: SessaoDetalhePage,
})

function SessaoDetalhePage() {
  const { sessaoId } = Route.useParams()
  const navigate = useNavigate()
  const { sessoes } = useHistorico()
  const sessao = sessoes.find((s) => s.id === sessaoId)

  if (!sessao) {
    return (
      <div className="page-container pt-6 text-center">
        <p className="text-[var(--color-text-muted)]">Sessão não encontrada.</p>
        <Link to="/historico" className="text-[var(--color-accent)] text-sm mt-2 block" style={{ textDecoration: 'none' }}>Voltar</Link>
      </div>
    )
  }

  const data = new Date(sessao.iniciadoEm)
  const dataStr = data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const totalSeries = sessao.exercicios.reduce((s, ex) => s + ex.series.length, 0)
  const seriesOk = sessao.exercicios.reduce((s, ex) => s + ex.series.filter((sr) => sr.completada).length, 0)

  return (
    <div className="page-container pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-fade-up">
        <button onClick={() => navigate({ to: '/historico' })}
          className="w-10 h-10 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-muted)]">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text)]">{sessao.planoNome}</h1>
          <p className="text-xs text-[var(--color-text-muted)] capitalize mt-0.5">{dataStr}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5 animate-fade-up" style={{ animationDelay: '50ms' }}>
        {[
          { icon: Clock, label: 'Duração', value: sessao.duracaoSegundos ? formatarTempo(sessao.duracaoSegundos) : '–' },
          { icon: Dumbbell, label: 'Exercícios', value: sessao.exercicios.length },
          { icon: TrendingUp, label: 'Volume (kg)', value: sessao.volumeTotal ? Math.round(sessao.volumeTotal) : '–' },
        ].map((stat, i) => (
          <div key={i} className="card p-3 text-center">
            <stat.icon size={16} className="text-[var(--color-accent)] mx-auto mb-1" />
            <p className="text-lg font-bold text-[var(--color-text)]">{stat.value}</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progresso geral */}
      <div className="card p-4 mb-5 animate-fade-up" style={{ animationDelay: '100ms' }}>
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-semibold text-[var(--color-text-muted)]">SÉRIES COMPLETADAS</p>
          <p className="text-sm font-bold text-[var(--color-text)]">{seriesOk}/{totalSeries}</p>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${totalSeries ? (seriesOk / totalSeries) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Exercícios */}
      <div className="flex flex-col gap-3">
        {sessao.exercicios.map((ex, eIdx) => (
          <div key={`${ex.exercicioId}-${eIdx}`} className="card p-4 animate-fade-up" style={{ animationDelay: `${(eIdx + 3) * 40}ms` }}>
            <div className="flex items-center gap-3 mb-3">
              {ex.gifUrl ? (
                <img src={ex.gifUrl} alt={ex.exercicioNome}
                  className="w-12 h-12 rounded-xl object-contain bg-[var(--color-surface-2)] flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💪</span>
                </div>
              )}
              <div>
                <p className="text-[var(--color-text)] font-bold text-sm">{ex.exercicioNome}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{ex.grupoMuscular}</p>
              </div>
            </div>

            {/* Tabela de séries */}
            <div className="grid grid-cols-[24px_1fr_1fr_24px] gap-2 px-1 mb-1">
              {['#', 'Peso (kg)', 'Reps', ''].map((h, i) => (
                <span key={i} className="text-[9px] text-[var(--color-text-subtle)] font-semibold text-center">{h}</span>
              ))}
            </div>
            {ex.series.map((s, sIdx) => (
              <div key={s.id} className={`grid grid-cols-[24px_1fr_1fr_24px] gap-2 px-1 py-1.5 rounded-lg ${s.completada ? 'bg-[rgba(34,197,94,0.06)]' : ''}`}>
                <span className="text-xs text-center text-[var(--color-text-subtle)] font-bold">{sIdx + 1}</span>
                <span className="text-sm text-center text-[var(--color-text)] font-semibold">
                  {s.peso ? `${s.peso}kg` : '–'}
                </span>
                <span className="text-sm text-center text-[var(--color-text)] font-semibold">
                  {s.repeticoes || '–'}
                </span>
                <span className="flex items-center justify-center">
                  {s.completada
                    ? <CheckCircle2 size={15} className="text-[var(--color-success)]" />
                    : <Circle size={15} className="text-[var(--color-text-subtle)]" />}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
