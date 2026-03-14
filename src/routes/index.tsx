import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { useAuthStore, useHistoricoStore } from '../stores'
import { useHistorico } from '../hooks/useHistorico'
import { usePlanos } from '../hooks/usePlanos'
import { useTreinoAtivoStore } from '../stores'
import { formatarTempo } from '../lib/notifications'
import { useIniciarTreino } from '../hooks/useIniciarTreino'
import { calcularStreaks } from '../lib/streaks'
import { getConfigUsuario, salvarConfigUsuario } from '../lib/firestore/sync'
import { CORES_GRUPO } from '../types'
import { Dumbbell, Flame, Clock, TrendingUp, ChevronRight, Play, Plus, Zap, RefreshCw, Trophy, Target } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function PlanoCard({ plano }: { plano: { id: string; nome: string; cor?: string | null; exercicios: unknown[] } }) {
  const { handleIniciar, modal } = useIniciarTreino()

  return (
    <>
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
              <p className="text-text font-semibold text-sm">{plano.nome}</p>
              <p className="text-text-muted text-xs mt-0.5">
                {plano.exercicios.length} exercícios
              </p>
            </div>
          </div>
          <button
            className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center hover:bg-[var(--color-accent-hover)] transition-colors"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleIniciar(plano.id)
            }}
          >
            <Play size={14} className="text-white ml-0.5" />
          </button>
        </div>
      </Link>
      {modal}
    </>
  )
}

function HomePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { planosAtivos, loading, sincronizar: sincronizarPlanos } = usePlanos()
  const { sessoes, loading: loadingSessoes, sincronizar: sincronizarSessoes } = useHistorico()
  const [sincronizando, setSincronizando] = useState(false)
  const treinoAtivo = useTreinoAtivoStore((s) => s.iniciado)
  const sessaoAtiva = useTreinoAtivoStore((s) => s.sessao)
  const exercicioAtualIndex = useTreinoAtivoStore((s) => s.exercicioAtualIndex)
  const pausado = useTreinoAtivoStore((s) => s.pausado)
  const cronometroGeralSegundos = useTreinoAtivoStore((s) => s.cronometroGeralSegundos)
  const { handleIniciar, modal: modalProximo } = useIniciarTreino()
  const [metaSemanal, setMetaSemanal] = useState(() => {
    const saved = localStorage.getItem('metaSemanal')
    return saved ? parseInt(saved, 10) : 4
  })
  const [showEditMeta, setShowEditMeta] = useState(false)
  const [metaInput, setMetaInput] = useState('4')

  // Sync weekly goal from Firebase (once, on login)
  useEffect(() => {
    if (!user) return
    getConfigUsuario(user.uid).then(config => {
      if (config.metaSemanal) {
        setMetaSemanal(config.metaSemanal)
        localStorage.setItem('metaSemanal', String(config.metaSemanal))
      }
    })
  }, [user])

  // Pull-to-refresh
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const touchStartY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const PULL_THRESHOLD = 80

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY
    } else {
      touchStartY.current = 0
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === 0 || isRefreshing) return
    const diff = e.touches[0].clientY - touchStartY.current
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, 120))
    }
  }, [isRefreshing])

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(PULL_THRESHOLD)
      await Promise.all([sincronizarPlanos(), sincronizarSessoes()])
      setIsRefreshing(false)
    }
    setPullDistance(0)
    touchStartY.current = 0
  }, [pullDistance, isRefreshing, sincronizarPlanos, sincronizarSessoes])

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
  const carregando = loading || loadingSessoes
  const streaks = useMemo(() => calcularStreaks(sessoes, metaSemanal), [sessoes, metaSemanal])

  const exercicioAtual = sessaoAtiva?.exercicios[exercicioAtualIndex]

  // Próximo treino: plano seguinte ao último concluído, em rotação
  const ultimaSessao = sessoes[0]
  const proximoPlano = (() => {
    if (!planosAtivos.length) return null
    if (!ultimaSessao) return planosAtivos[0]
    const idx = planosAtivos.findIndex((p) => p.id === ultimaSessao.planoId)
    if (idx === -1) return planosAtivos[0]
    return planosAtivos[(idx + 1) % planosAtivos.length]
  })()

  const diasDaSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

  return (
    <div
      ref={containerRef}
      className="page-container pt-6 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="flex items-center justify-center transition-all duration-150"
          style={{ height: pullDistance > 0 ? pullDistance : PULL_THRESHOLD, marginTop: -8 }}
        >
          <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-surface-2 border border-border ${isRefreshing ? '' : ''}`}>
            <RefreshCw
              size={16}
              className={`text-accent transition-transform duration-200 ${isRefreshing ? 'animate-spin' : ''}`}
              style={{ transform: isRefreshing ? undefined : `rotate(${Math.min(pullDistance / PULL_THRESHOLD, 1) * 360}deg)` }}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 animate-fade-up flex items-start justify-between">
        <div>
          <p className="text-text-muted text-sm">{saudacao},</p>
          <h1 className="text-2xl font-bold text-text mt-0.5">
            {nome} 👋
          </h1>
        </div>
        <button
          onClick={async () => {
            setSincronizando(true)
            await Promise.all([sincronizarPlanos(), sincronizarSessoes()])
            setSincronizando(false)
          }}
          disabled={sincronizando}
          className="mt-1 w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-text-muted hover:bg-surface-2 transition-colors disabled:opacity-50"
          title="Sincronizar com Firebase"
        >
          <RefreshCw size={16} className={sincronizando ? 'animate-spin' : ''} />
        </button>
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
              ? 'border-[var(--color-text-subtle)] bg-surface-2'
              : 'border-[var(--color-accent)] bg-accent-subtle animate-pulse-glow'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  pausado ? 'bg-[var(--color-text-subtle)]' : 'bg-accent'
                }`}>
                  <Clock size={18} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-text font-bold text-sm">
                      {pausado ? 'Treino Pausado' : 'Treino Ativo'}
                    </p>
                    <span className={`px-1.5 py-0.5 rounded-md text-white text-[10px] font-bold tabular-nums transition-colors ${
                      pausado ? 'bg-[var(--color-text-subtle)]' : 'bg-accent'
                    }`}>
                      {formatarTempo(cronometroGeralSegundos)}
                    </span>
                  </div>
                  <p className="text-text-muted text-xs mt-0.5">
                    {exercicioAtual ? exercicioAtual.exercicioNome : sessaoAtiva.planoNome}
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-2 font-semibold text-sm transition-colors ${
                pausado ? 'text-text-muted' : 'text-accent'
              }`}>
                Continuar <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Stats */}
      {carregando ? (
        <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-up" style={{ animationDelay: '50ms' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-[88px] rounded-2xl" />
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-up" style={{ animationDelay: '50ms' }}>
        <div className="card p-3 text-center">
          <Flame size={18} className="text-orange-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-text">{treinosSemana}</p>
          <p className="text-[10px] text-text-muted mt-0.5">esta semana</p>
        </div>
        <div className="card p-3 text-center">
          <TrendingUp size={18} className="text-accent mx-auto mb-1" />
          <p className="text-xl font-bold text-text">
            {volumeTotal > 1000
              ? `${(volumeTotal / 1000).toFixed(1)}k`
              : Math.round(volumeTotal)}
          </p>
          <p className="text-[10px] text-text-muted mt-0.5">vol. total (kg)</p>
        </div>
        <div className="card p-3 text-center">
          <Dumbbell size={18} className="text-green-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-text">{sessoes.length}</p>
          <p className="text-[10px] text-text-muted mt-0.5">treinos total</p>
        </div>
      </div>
      )}

      {/* Streak + Meta Semanal */}
      {!carregando && sessoes.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-up" style={{ animationDelay: '75ms' }}>
          {/* Streak */}
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
              <Flame size={20} className="text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-text tabular-nums">{streaks.streakAtual}</p>
              <p className="text-[10px] text-text-muted">
                {streaks.streakAtual === 1 ? 'dia seguido' : 'dias seguidos'}
              </p>
            </div>
          </div>
          {/* Meta Semanal */}
          <button
            onClick={() => { setMetaInput(String(metaSemanal)); setShowEditMeta(true) }}
            className="card p-4 text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Meta Semanal</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-text">{streaks.treinosEstaSemana}/{streaks.metaSemanal}</span>
                <Target size={12} className="text-text-subtle" />
              </div>
            </div>
            <div className="progress-bar h-2!">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(100, (streaks.treinosEstaSemana / streaks.metaSemanal) * 100)}%` }}
              />
            </div>
            {streaks.treinosEstaSemana >= streaks.metaSemanal && (
              <p className="text-[10px] text-success font-semibold mt-1.5 flex items-center gap-1">
                <Trophy size={10} /> Meta batida!
              </p>
            )}
          </button>
        </div>
      )}

      {/* Dias da semana */}
      <div className="card p-4 mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
        <p className="text-xs text-text-muted font-medium mb-3">ESTA SEMANA</p>
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
                <span className={`text-[10px] ${isHoje ? 'text-accent font-semibold' : 'text-text-subtle'}`}>
                  {dia}
                </span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    temTreino
                      ? 'bg-accent text-white'
                      : isHoje
                      ? 'border-2 border-[var(--color-accent)] text-accent'
                      : 'bg-surface-2 text-text-subtle'
                  }`}
                >
                  {temTreino ? '✓' : diaDate.getDate()}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Próximo Treino */}
      {!treinoAtivo && proximoPlano && (
        <>
          <div className="mb-6 animate-fade-up" style={{ animationDelay: '112ms' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-text">Próximo Treino</h2>
              {ultimaSessao && (
                <span className="text-[10px] text-text-subtle font-medium">
                  baseado no último concluído
                </span>
              )}
            </div>
            <div className="card p-4 flex items-center justify-between border border-[var(--color-accent)]/30">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: proximoPlano.cor ?? '#6366f1' }}
                >
                  <Zap size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-text font-bold text-sm">{proximoPlano.nome}</p>
                  <p className="text-text-muted text-xs mt-0.5">
                    {proximoPlano.exercicios.length} exercícios
                  </p>
                </div>
              </div>
              <button
                className="flex items-center gap-1.5 bg-accent text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[var(--color-accent-hover)] active:scale-95 transition-all"
                onClick={() => handleIniciar(proximoPlano.id)}
              >
                <Play size={14} className="ml-0.5" /> Iniciar
              </button>
            </div>
          </div>
          {modalProximo}
        </>
      )}

      {/* Frequência por Grupo Muscular */}
      {!carregando && sessoes.length > 0 && (() => {
        const hoje = Date.now()
        const grupoMap: Record<string, number> = {}
        sessoes.forEach(s => {
          if (!s.finalizadoEm) return
          s.exercicios.forEach(ex => {
            const g = ex.grupoMuscular
            if (!g || g === 'Outro' || g === 'Corpo Inteiro' || g === 'Cardio') return
            const last = grupoMap[g]
            if (!last || s.finalizadoEm! > last) grupoMap[g] = s.finalizadoEm!
          })
        })
        const alertas = Object.entries(grupoMap)
          .map(([grupo, ultimo]) => ({
            grupo,
            dias: Math.floor((hoje - ultimo) / 86400000),
            cor: CORES_GRUPO[grupo] ?? '#6366f1',
          }))
          .filter(a => a.dias >= 7)
          .sort((a, b) => b.dias - a.dias)
          .slice(0, 4)

        if (alertas.length === 0) return null

        return (
          <div className="card p-4 mb-6 animate-fade-up" style={{ animationDelay: '125ms' }}>
            <p className="text-xs text-text-muted font-medium mb-3">GRUPOS MUSCULARES</p>
            <div className="flex flex-col gap-2">
              {alertas.map(a => (
                <div key={a.grupo} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: a.cor }} />
                  <span className="text-sm text-text font-medium flex-1">{a.grupo}</span>
                  <span className={`text-xs font-semibold ${a.dias >= 14 ? 'text-warning' : 'text-text-muted'}`}>
                    {a.dias === 1 ? '1 dia' : `${a.dias} dias`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Meus Planos */}
      <div className="mb-6 animate-fade-up" style={{ animationDelay: '150ms' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-text">Meus Planos</h2>
          <Link to="/treinos" className="text-accent text-sm font-medium" style={{ textDecoration: 'none' }}>
            Ver todos
          </Link>
        </div>

        {carregando ? (
          <div className="flex flex-col gap-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="skeleton h-[68px] rounded-2xl" />
            ))}
          </div>
        ) : planosAtivos.length === 0 ? (
          <Link to="/treinos/novo" style={{ textDecoration: 'none' }}>
            <div className="card p-6 border-dashed border-[var(--color-border-strong)] flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-accent-subtle flex items-center justify-center">
                <Plus size={24} className="text-accent" />
              </div>
              <div>
                <p className="text-text font-semibold text-sm">Crie seu primeiro plano</p>
                <p className="text-text-muted text-xs mt-1">Monte sua rotina de treino personalizada</p>
              </div>
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
      {carregando ? (
        <div className="mb-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-text">Últimos Treinos</h2>
          </div>
          <div className="flex flex-col gap-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="skeleton h-[68px] rounded-2xl" />
            ))}
          </div>
        </div>
      ) : ultimasSessoes.length > 0 && (
        <div className="mb-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-text">Últimos Treinos</h2>
            <Link to="/historico" className="text-accent text-sm font-medium" style={{ textDecoration: 'none' }}>
              Histórico
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {ultimasSessoes.map((sessao) => (
              <Link key={sessao.id} to="/historico/$sessaoId" params={{ sessaoId: sessao.id }} style={{ textDecoration: 'none' }}>
                <div className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-text font-semibold text-sm">{sessao.planoNome}</p>
                    <p className="text-text-muted text-xs mt-0.5">
                      {new Date(sessao.iniciadoEm).toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    {sessao.duracaoSegundos && (
                      <p className="text-text-muted text-xs font-medium">
                        {formatarTempo(sessao.duracaoSegundos)}
                      </p>
                    )}
                    {sessao.volumeTotal !== undefined && (
                      <p className="text-text-subtle text-xs mt-0.5">
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

      {/* Modal Editar Meta Semanal */}
      {showEditMeta && (
        <div className="modal-overlay" onClick={() => setShowEditMeta(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-text mb-1">Meta Semanal</h2>
            <p className="text-sm text-text-muted mb-4">Quantos treinos por semana você quer fazer?</p>
            <div className="flex items-center justify-center gap-4 mb-6">
              {[2, 3, 4, 5, 6, 7].map(n => (
                <button
                  key={n}
                  onClick={() => setMetaInput(String(n))}
                  className={`w-11 h-11 rounded-xl font-bold text-lg transition-all ${
                    String(n) === metaInput
                      ? 'bg-accent text-white scale-110'
                      : 'bg-surface-2 text-text-muted'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              onClick={async () => {
                const valor = parseInt(metaInput)
                if (valor >= 1 && valor <= 7) {
                  setMetaSemanal(valor)
                  localStorage.setItem('metaSemanal', String(valor))
                  setShowEditMeta(false)
                  if (user) salvarConfigUsuario(user.uid, { metaSemanal: valor })
                  toast.success(`Meta atualizada para ${valor}x por semana`)
                }
              }}
              className="btn-primary w-full"
            >
              Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
