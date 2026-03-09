import { createFileRoute, Link } from '@tanstack/react-router'
import { useHistorico } from '../../hooks/useHistorico'
import { formatarTempo } from '../../lib/notifications'
import { History, Dumbbell, Clock, TrendingUp, ChevronRight, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useMemo } from 'react'

export const Route = createFileRoute('/historico/')({
  component: HistoricoPage,
})

function HistoricoPage() {
  const { sessoes, loading, excluirSessao } = useHistorico()

  // Agrupar volume por semana para o gráfico
  const dadosGrafico = useMemo(() => {
    const semanas: Record<string, number> = {}
    sessoes.forEach((s) => {
      const d = new Date(s.iniciadoEm)
      const inicio = new Date(d)
      inicio.setDate(d.getDate() - d.getDay())
      const chave = inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      semanas[chave] = (semanas[chave] ?? 0) + (s.volumeTotal ?? 0)
    })
    return Object.entries(semanas)
      .slice(-8)
      .map(([semana, volume]) => ({ semana, volume: Math.round(volume) }))
  }, [sessoes])

  return (
    <div className="page-container pt-6">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6 animate-fade-up">Histórico</h1>

      {/* Gráfico de volume */}
      {dadosGrafico.length > 1 && (
        <div className="card p-4 mb-6 animate-fade-up" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-[var(--color-accent)]" />
            <p className="text-sm font-bold text-[var(--color-text)]">Volume por Semana (kg)</p>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={dadosGrafico} barSize={20}>
              <XAxis dataKey="semana" tick={{ fontSize: 10, fill: '#8b8fa8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e2028', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: '#f0f0f5' }}
                itemStyle={{ color: '#8b5cf6' }}
              />
              <Bar dataKey="volume" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : sessoes.length === 0 ? (
        <div className="flex flex-col items-center gap-4 mt-16 animate-scale-in text-center">
          <div className="w-20 h-20 rounded-3xl bg-[var(--color-surface-2)] flex items-center justify-center">
            <History size={36} className="text-[var(--color-text-subtle)]" />
          </div>
          <p className="text-[var(--color-text)] font-semibold">Nenhum treino registrado ainda</p>
          <p className="text-[var(--color-text-muted)] text-sm">
            Faça seu primeiro treino para começar o histórico
          </p>
          <Link to="/treinos" style={{ textDecoration: 'none' }}>
            <button className="btn-primary">Ver Planos</button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessoes.map((sessao, idx) => {
            const data = new Date(sessao.iniciadoEm)
            const dataStr = data.toLocaleDateString('pt-BR', {
              weekday: 'long', day: 'numeric', month: 'short',
            })
            const totalSeries = sessao.exercicios.reduce(
              (sum, ex) => sum + ex.series.filter((s) => s.completada).length, 0
            )

            return (
              <div key={sessao.id} className="card p-4 animate-fade-up" style={{ animationDelay: `${idx * 40}ms` }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[var(--color-text)] font-bold">{sessao.planoNome}</p>
                    <p className="text-[var(--color-text-muted)] text-xs mt-0.5 capitalize">{dataStr}</p>
                  </div>
                  <button
                    onClick={() => excluirSessao(sessao.id)}
                    className="btn-ghost p-2 text-[var(--color-text-subtle)] hover:text-[var(--color-danger)]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex gap-4 mb-3">
                  {sessao.duracaoSegundos && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-[var(--color-text-subtle)]" />
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {formatarTempo(sessao.duracaoSegundos)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Dumbbell size={13} className="text-[var(--color-text-subtle)]" />
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {sessao.exercicios.length} exercícios
                    </span>
                  </div>
                  {sessao.volumeTotal !== undefined && sessao.volumeTotal > 0 && (
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={13} className="text-[var(--color-text-subtle)]" />
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {Math.round(sessao.volumeTotal)} kg
                      </span>
                    </div>
                  )}
                </div>
                <Link to="/historico/$sessaoId" params={{ sessaoId: sessao.id }} style={{ textDecoration: 'none' }}>
                  <button className="btn-ghost w-full py-2 text-xs border border-[var(--color-border)] rounded-xl flex items-center justify-center gap-1">
                    Ver detalhes <ChevronRight size={13} />
                  </button>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
