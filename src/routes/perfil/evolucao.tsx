import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useHistoricoStore } from '../../stores'
import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { ChevronLeft, TrendingUp, Dumbbell, BarChart2, ChevronDown, ChevronUp, ArrowUpRight } from 'lucide-react'

export const Route = createFileRoute('/perfil/evolucao')({
  component: EvolucaoPage,
})

type TabId = 'grafico' | 'exercicios'

function EvolucaoPage() {
  const sessoes = useHistoricoStore((s) => s.sessoes)
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabId>('exercicios')

  // All exercises with at least one completed weighted series
  const exercicios = useMemo(() => {
    const map = new Map<string, string>()
    sessoes.forEach((s) => {
      s.exercicios.forEach((ex) => {
        if (ex.series.some((sr) => sr.completada && sr.peso > 0))
          map.set(ex.exercicioId, ex.exercicioNome)
      })
    })
    return Array.from(map.entries())
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [sessoes])

  // Per-exercise timeline data
  const timelineByExercicio = useMemo(() => {
    const result = new Map<string, { data: string; peso: number; iniciadoEm: number }[]>()
    exercicios.forEach(({ id }) => {
      const pontos = sessoes
        .filter((s) => s.exercicios.some((ex) => ex.exercicioId === id))
        .sort((a, b) => a.iniciadoEm - b.iniciadoEm)
        .flatMap((s) => {
          const ex = s.exercicios.find((e) => e.exercicioId === id)!
          const pesos = ex.series.filter((sr) => sr.completada && sr.peso > 0).map((sr) => sr.peso)
          if (!pesos.length) return []
          return [{
            data: new Date(s.iniciadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            peso: Math.max(...pesos),
            iniciadoEm: s.iniciadoEm,
          }]
        })
      if (pontos.length) result.set(id, pontos)
    })
    return result
  }, [sessoes, exercicios])

  // Volume per session (last 20)
  const dadosVolume = useMemo(() =>
    sessoes
      .slice()
      .sort((a, b) => a.iniciadoEm - b.iniciadoEm)
      .slice(-20)
      .map((s) => ({
        data: new Date(s.iniciadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        volume: Math.round(s.volumeTotal ?? 0),
        plano: s.planoNome,
      })),
    [sessoes]
  )

  const tooltipStyle = {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    color: 'var(--color-text)',
    fontSize: 12,
  }

  if (sessoes.length === 0) {
    return (
      <div className="page-container pt-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-3xl bg-[var(--color-surface-2)] flex items-center justify-center mb-4">
          <TrendingUp size={28} className="text-[var(--color-text-subtle)]" />
        </div>
        <p className="text-[var(--color-text-muted)] text-sm text-center">
          Complete alguns treinos para ver<br />sua evolução aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="page-container pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 animate-fade-up">
        <button
          onClick={() => navigate({ to: '/perfil' })}
          className="w-9 h-9 rounded-xl bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-text-muted)]"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-[var(--color-text)]">Evolução de Peso</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 animate-fade-up bg-[var(--color-surface-2)] p-1 rounded-2xl">
        {([
          { id: 'exercicios', label: 'Por Exercício', icon: Dumbbell },
          { id: 'grafico', label: 'Volume', icon: BarChart2 },
        ] as { id: TabId; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === id
                ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
                : 'text-[var(--color-text-muted)]'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Por Exercício ── */}
      {tab === 'exercicios' && (
        <div className="flex flex-col gap-3 animate-fade-up">
          {exercicios.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] text-center py-10">
              Nenhum exercício com peso registrado encontrado.
            </p>
          ) : (
            exercicios.map((ex) => (
              <ExercicioCard
                key={ex.id}
                nome={ex.nome}
                pontos={timelineByExercicio.get(ex.id) ?? []}
                tooltipStyle={tooltipStyle}
              />
            ))
          )}
        </div>
      )}

      {/* ── Tab: Volume ── */}
      {tab === 'grafico' && (
        <div className="card p-4 animate-fade-up">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-[var(--color-accent)]" />
            <p className="text-sm font-bold text-[var(--color-text)]">Volume Total por Sessão</p>
            <span className="text-[10px] text-[var(--color-text-muted)] ml-auto">últimas 20</span>
          </div>
          {dadosVolume.length < 2 ? (
            <p className="text-xs text-[var(--color-text-muted)] text-center py-6">
              Complete pelo menos 2 treinos para ver o volume.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosVolume} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} vertical={false} />
                <XAxis dataKey="data" tick={{ fontSize: 10, fill: 'var(--color-text-subtle)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-subtle)' }} unit=" kg" />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [`${Number(v).toLocaleString('pt-BR')} kg`, 'Volume']}
                  labelFormatter={(label, payload) => {
                    const plano = payload?.[0]?.payload?.plano
                    return plano ? `${label} · ${plano}` : label
                  }}
                />
                <Bar dataKey="volume" fill="var(--color-accent)" radius={[6, 6, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  )
}

function ExercicioCard({
  nome,
  pontos,
  tooltipStyle,
}: {
  nome: string
  pontos: { data: string; peso: number }[]
  tooltipStyle: object
}) {
  const [expandido, setExpandido] = useState(false)

  const record = pontos.length > 0 ? Math.max(...pontos.map((p) => p.peso)) : 0
  const primeiro = pontos[0]?.peso ?? 0
  const ultimo = pontos[pontos.length - 1]?.peso ?? 0
  const delta = ultimo - primeiro
  const deltaPct = primeiro > 0 ? Math.round((delta / primeiro) * 100) : 0

  return (
    <div className="card p-4">
      <button
        className="w-full text-left"
        onClick={() => setExpandido((v) => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text)] truncate">{nome}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-xs text-[var(--color-text-muted)]">
                🏆 Recorde: <span className="font-bold text-[var(--color-text)]">{record} kg</span>
              </span>
              {pontos.length >= 2 && (
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <ArrowUpRight size={12} className={delta < 0 ? 'rotate-180' : ''} />
                  {delta >= 0 ? '+' : ''}{delta.toFixed(1)} kg ({deltaPct >= 0 ? '+' : ''}{deltaPct}%)
                </span>
              )}
              <span className="text-[10px] text-[var(--color-text-subtle)]">
                {pontos.length} sess{pontos.length === 1 ? 'ão' : 'ões'}
              </span>
            </div>
          </div>

          {/* Mini sparkline */}
          {pontos.length >= 2 && !expandido && (
            <div className="w-20 h-10 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pontos}>
                  <Line
                    type="monotone"
                    dataKey="peso"
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="text-[var(--color-text-subtle)] flex-shrink-0">
            {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* Gráfico expandido */}
      {expandido && pontos.length >= 2 && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={pontos} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
              <XAxis dataKey="data" tick={{ fontSize: 10, fill: 'var(--color-text-subtle)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-subtle)' }} unit=" kg" />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [`${v} kg`, 'Máximo']}
              />
              <Line
                type="monotone"
                dataKey="peso"
                stroke="var(--color-accent)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: 'var(--color-accent)', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {expandido && pontos.length < 2 && (
        <p className="text-xs text-[var(--color-text-muted)] text-center mt-4 py-2">
          Complete pelo menos 2 sessões para ver o gráfico.
        </p>
      )}
    </div>
  )
}
