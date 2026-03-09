import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useAuthStore, useHistoricoStore } from '../stores'
import { useHistorico } from '../hooks/useHistorico'
import { usePlanos } from '../hooks/usePlanos'
import { useTreinoAtivoStore } from '../stores'
import { formatarTempo } from '../lib/notifications'
import { Dumbbell, Flame, Clock, TrendingUp, ChevronRight, Play, Plus } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function PlanoCard({ plano }: { plano: { id: string; nome: string; cor?: string | null; exercicios: unknown[] } }) {
  const navigate = useNavigate()

  return (
    <Link to="/treinos/$planoId" params={{ planoId: plano.id }} style={{ textDecoration: 'none' }}>
      <div className="card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: plano.cor ?? '#6366f1' }}
          >
            <Dumbbell size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[var(--color-text)] font-semibold text-sm">{plano.nome}</p>
            <p className="text-[var(--color-text-muted)] text-xs mt-0.5">
              {plano.exercicios.length} exercícios
            </p>
          </div>
        </div>
        <button
          className="w-9 h-9 rounded-xl bg-[var(--color-accent)] flex items-center justify-center hover:bg-[var(--color-accent-hover)] transition-colors"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            navigate({ to: '/treino-ativo/$planoId', params: { planoId: plano.id } })
          }}
        >
          <Play size={14} className="text-white ml-0.5" />
        </button>
      </div>
    </Link>
  )
}

function HomePage() {
  const user = useAuthStore((s) => s.user)
  const { planosAtivos, loading } = usePlanos()
  const { sessoes } = useHistorico()
  const treinoAtivo = useTreinoAtivoStore((s) => s.iniciado)
  const sessaoAtiva = useTreinoAtivoStore((s) => s.sessao)
  const exercicioAtualIndex = useTreinoAtivoStore((s) => s.exercicioAtualIndex)
  const pausado = useTreinoAtivoStore((s) => s.pausado)
  const cronometroGeralSegundos = useTreinoAtivoStore((s) => s.cronometroGeralSegundos)

  const nome = user?.displayName?.split(' ')[0] ?? 'Atleta'
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  // Stats
  const hoje = new Date()
  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() - hoje.getDay())
  inicioSemana.setHours(0, 0, 0, 0)
  const treinosSemana = sessoes.filter((s) => s.iniciadoEm >= inicioSemana.getTime()).length
  const volumeTotal = sessoes.reduce((acc, s) => acc + (s.volumeTotal ?? 0), 0)
  const ultimasSessoes = sessoes.slice(0, 3)

  const exercicioAtual = sessaoAtiva?.exercicios[exercicioAtualIndex]

  const diasDaSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

  return (
    <div className="page-container pt-6">
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <p className="text-[var(--color-text-muted)] text-sm">{saudacao},</p>
        <h1 className="text-2xl font-bold text-[var(--color-text)] mt-0.5">
          {nome} 👋
        </h1>
      </div>

      {/* Treino ativo banner */}
      {treinoAtivo && sessaoAtiva && (
        <Link
          to="/treino-ativo/$planoId"
          params={{ planoId: sessaoAtiva.planoId }}
          className="block mb-4 animate-fade-up"
          style={{ textDecoration: 'none' }}
        >
          <div className={`card p-4 border-2 transition-colors ${
            pausado
              ? 'border-[var(--color-text-subtle)] bg-[var(--color-surface-2)]'
              : 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] animate-pulse-glow'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  pausado ? 'bg-[var(--color-text-subtle)]' : 'bg-[var(--color-accent)]'
                }`}>
                  <Clock size={18} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[var(--color-text)] font-bold text-sm">
                      {pausado ? 'Treino Pausado' : 'Treino Ativo'}
                    </p>
                    <span className={`px-1.5 py-0.5 rounded-md text-white text-[10px] font-bold tabular-nums transition-colors ${
                      pausado ? 'bg-[var(--color-text-subtle)]' : 'bg-[var(--color-accent)]'
                    }`}>
                      {formatarTempo(cronometroGeralSegundos)}
                    </span>
                  </div>
                  <p className="text-[var(--color-text-muted)] text-xs mt-0.5">
                    {exercicioAtual ? exercicioAtual.exercicioNome : sessaoAtiva.planoNome}
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-2 font-semibold text-sm transition-colors ${
                pausado ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-accent)]'
              }`}>
                Continuar <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-up" style={{ animationDelay: '50ms' }}>
        <div className="card p-3 text-center">
          <Flame size={18} className="text-orange-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-[var(--color-text)]">{treinosSemana}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">esta semana</p>
        </div>
        <div className="card p-3 text-center">
          <TrendingUp size={18} className="text-[var(--color-accent)] mx-auto mb-1" />
          <p className="text-xl font-bold text-[var(--color-text)]">
            {volumeTotal > 1000
              ? `${(volumeTotal / 1000).toFixed(1)}k`
              : Math.round(volumeTotal)}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">vol. total (kg)</p>
        </div>
        <div className="card p-3 text-center">
          <Dumbbell size={18} className="text-green-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-[var(--color-text)]">{sessoes.length}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">treinos total</p>
        </div>
      </div>

      {/* Dias da semana */}
      <div className="card p-4 mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
        <p className="text-xs text-[var(--color-text-muted)] font-medium mb-3">ESTA SEMANA</p>
        <div className="flex justify-between">
          {diasDaSemana.map((dia, idx) => {
            const diaDate = new Date(inicioSemana)
            diaDate.setDate(inicioSemana.getDate() + idx)
            const temTreino = sessoes.some((s) => {
              const d = new Date(s.iniciadoEm)
              return d.toDateString() === diaDate.toDateString()
            })
            const isHoje = diaDate.toDateString() === hoje.toDateString()
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <span className={`text-[10px] ${isHoje ? 'text-[var(--color-accent)] font-semibold' : 'text-[var(--color-text-subtle)]'}`}>
                  {dia}
                </span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    temTreino
                      ? 'bg-[var(--color-accent)] text-white'
                      : isHoje
                      ? 'border-2 border-[var(--color-accent)] text-[var(--color-accent)]'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-text-subtle)]'
                  }`}
                >
                  {temTreino ? '✓' : diaDate.getDate()}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Meus Planos */}
      <div className="mb-6 animate-fade-up" style={{ animationDelay: '150ms' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[var(--color-text)]">Meus Planos</h2>
          <Link to="/treinos" className="text-[var(--color-accent)] text-sm font-medium" style={{ textDecoration: 'none' }}>
            Ver todos
          </Link>
        </div>

        {planosAtivos.length === 0 ? (
          <Link to="/treinos/novo" style={{ textDecoration: 'none' }}>
            <div className="card p-5 border-dashed border-[var(--color-border-strong)] flex flex-col items-center gap-2 text-center">
              <Plus size={24} className="text-[var(--color-text-subtle)]" />
              <p className="text-[var(--color-text-muted)] text-sm">Crie seu primeiro plano</p>
            </div>
          </Link>
        ) : (
          <div className="flex flex-col gap-2">
            {planosAtivos.slice(0, 3).map((plano) => (
              <PlanoCard key={plano.id} plano={plano} />
            ))}
          </div>
        )}
      </div>

      {/* Últimos treinos */}
      {ultimasSessoes.length > 0 && (
        <div className="mb-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[var(--color-text)]">Últimos Treinos</h2>
            <Link to="/historico" className="text-[var(--color-accent)] text-sm font-medium" style={{ textDecoration: 'none' }}>
              Histórico
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {ultimasSessoes.map((sessao) => (
              <Link key={sessao.id} to="/historico/$sessaoId" params={{ sessaoId: sessao.id }} style={{ textDecoration: 'none' }}>
                <div className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[var(--color-text)] font-semibold text-sm">{sessao.planoNome}</p>
                    <p className="text-[var(--color-text-muted)] text-xs mt-0.5">
                      {new Date(sessao.iniciadoEm).toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    {sessao.duracaoSegundos && (
                      <p className="text-[var(--color-text-muted)] text-xs font-medium">
                        {formatarTempo(sessao.duracaoSegundos)}
                      </p>
                    )}
                    {sessao.volumeTotal !== undefined && (
                      <p className="text-[var(--color-text-subtle)] text-xs mt-0.5">
                        {Math.round(sessao.volumeTotal)} kg
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
