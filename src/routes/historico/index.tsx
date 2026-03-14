import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useHistorico } from '../../hooks/useHistorico'
import { usePlanosStore } from '../../stores'
import { formatarTempo } from '../../lib/notifications'
import { History, Dumbbell, Clock, TrendingUp, ChevronRight, Trash2, Filter, X, ArrowLeft } from 'lucide-react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/historico/')({
  component: HistoricoPage,
})

type Periodo = 'todos' | '7d' | '30d' | '90d'

function HistoricoPage() {
  const navigate = useNavigate()
  const { sessoes, loading, excluirSessao } = useHistorico()
  const planos = usePlanosStore(s => s.planos)
  const [confirmExcluir, setConfirmExcluir] = useState<string | null>(null)
  const [filtroPlano, setFiltroPlano] = useState<string>('todos')
  const [filtroPeriodo, setFiltroPeriodo] = useState<Periodo>('todos')
  const [showFiltros, setShowFiltros] = useState(false)

  const sessoesNomes = useMemo(() => {
    const nomes = new Set<string>()
    sessoes.forEach(s => nomes.add(s.planoNome))
    return Array.from(nomes).sort()
  }, [sessoes])

  const sessoesFiltradas = useMemo(() => {
    let resultado = sessoes
    if (filtroPlano !== 'todos') {
      resultado = resultado.filter(s => s.planoNome === filtroPlano)
    }
    if (filtroPeriodo !== 'todos') {
      const agora = Date.now()
      const dias = filtroPeriodo === '7d' ? 7 : filtroPeriodo === '30d' ? 30 : 90
      const limite = agora - dias * 24 * 60 * 60 * 1000
      resultado = resultado.filter(s => s.iniciadoEm >= limite)
    }
    return resultado
  }, [sessoes, filtroPlano, filtroPeriodo])

  const filtroAtivo = filtroPlano !== 'todos' || filtroPeriodo !== 'todos'

  // Agrupar volume por semana para o gráfico
  const dadosGrafico = useMemo(() => {
    const semanas: Record<string, number> = {}
    sessoesFiltradas.forEach((s) => {
      const d = new Date(s.iniciadoEm)
      const inicio = new Date(d)
      inicio.setDate(d.getDate() - d.getDay())
      const chave = inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      semanas[chave] = (semanas[chave] ?? 0) + (s.volumeTotal ?? 0)
    })
    return Object.entries(semanas)
      .slice(-8)
      .map(([semana, volume]) => ({ semana, volume: Math.round(volume) }))
  }, [sessoesFiltradas])

  return (
    <div className="page-container pt-6">
      <div className="flex items-center gap-3 mb-6 animate-fade-up">
        <button
          onClick={() => navigate({ to: '/perfil' })}
          className="w-10 h-10 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-muted)] shrink-0"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-text)] flex-1 min-w-0">Histórico</h1>
        {sessoes.length > 0 && (
          <button
            onClick={() => setShowFiltros(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              filtroAtivo ? 'bg-accent/15 text-accent' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
            }`}
          >
            <Filter size={14} />
            {filtroAtivo ? 'Filtrado' : 'Filtrar'}
          </button>
        )}
      </div>

      {/* Filtros */}
      {showFiltros && (
        <div className="card p-4 mb-4 animate-scale-in space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Filtros</p>
            {filtroAtivo && (
              <button
                onClick={() => { setFiltroPlano('todos'); setFiltroPeriodo('todos') }}
                className="text-xs text-accent flex items-center gap-1"
              >
                <X size={12} /> Limpar
              </button>
            )}
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-subtle uppercase tracking-wider block mb-1.5">Plano</label>
            <select
              className="input text-sm w-full"
              value={filtroPlano}
              onChange={e => setFiltroPlano(e.target.value)}
            >
              <option value="todos">Todos os planos</option>
              {sessoesNomes.map(nome => (
                <option key={nome} value={nome}>{nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-subtle uppercase tracking-wider block mb-1.5">Período</label>
            <div className="flex gap-2">
              {([['todos', 'Todos'], ['7d', '7 dias'], ['30d', '30 dias'], ['90d', '90 dias']] as [Periodo, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFiltroPeriodo(val)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    filtroPeriodo === val ? 'bg-accent text-white' : 'bg-[var(--color-surface-2)] text-text-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
      ) : sessoesFiltradas.length === 0 ? (
        <div className="flex flex-col items-center gap-4 mt-16 animate-scale-in text-center">
          <div className="w-20 h-20 rounded-3xl bg-[var(--color-surface-2)] flex items-center justify-center">
            <History size={36} className="text-[var(--color-text-subtle)]" />
          </div>
          <p className="text-[var(--color-text)] font-semibold">{filtroAtivo ? 'Nenhum treino encontrado' : 'Nenhum treino registrado ainda'}</p>
          <p className="text-[var(--color-text-muted)] text-sm">
            {filtroAtivo ? 'Tente ajustar os filtros' : 'Faça seu primeiro treino para começar o histórico'}
          </p>
          {filtroAtivo ? (
            <button onClick={() => { setFiltroPlano('todos'); setFiltroPeriodo('todos') }} className="btn-secondary">Limpar Filtros</button>
          ) : (
            <Link to="/treinos" style={{ textDecoration: 'none' }}>
              <button className="btn-primary">Ver Planos</button>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtroAtivo && (
            <p className="text-xs text-text-muted mb-1">{sessoesFiltradas.length} resultado{sessoesFiltradas.length !== 1 ? 's' : ''}</p>
          )}
          {sessoesFiltradas.map((sessao, idx) => {
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
                    onClick={() => setConfirmExcluir(sessao.id)}
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

      {/* ─── Modal de Confirmação Excluir ────────────────────────── */}
      {confirmExcluir && (
        <div className="modal-overlay" onClick={() => setConfirmExcluir(null)}>
          <div className="modal-content text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-3xl bg-[rgba(239,68,68,0.12)] flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-[var(--color-danger)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Excluir Sessão?</h2>
            <p className="text-[var(--color-text-muted)] text-sm mb-6">
              Esta ação não pode ser desfeita. O registro deste treino será removido do seu histórico.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  excluirSessao(confirmExcluir)
                  setConfirmExcluir(null)
                }}
                className="btn-danger w-full py-4 text-base"
              >
                Sim, Excluir
              </button>
              <button
                onClick={() => setConfirmExcluir(null)}
                className="btn-ghost w-full py-3"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
