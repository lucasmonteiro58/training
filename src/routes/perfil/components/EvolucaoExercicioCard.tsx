import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChevronDown, ChevronUp, ArrowUpRight } from 'lucide-react'

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  color: 'var(--color-text)',
  fontSize: 12,
}

interface Ponto {
  data: string
  peso: number
  iniciadoEm?: number
}

interface EvolucaoExercicioCardProps {
  nome: string
  pontos: Ponto[]
}

export function EvolucaoExercicioCard({ nome, pontos }: EvolucaoExercicioCardProps) {
  const [expandido, setExpandido] = useState(false)

  const record = pontos.length > 0 ? Math.max(...pontos.map(p => p.peso)) : 0
  const primeiro = pontos[0]?.peso ?? 0
  const ultimo = pontos[pontos.length - 1]?.peso ?? 0
  const delta = ultimo - primeiro
  const deltaPct = primeiro > 0 ? Math.round((delta / primeiro) * 100) : 0

  return (
    <div className="card p-4">
      <button type="button" className="w-full text-left" onClick={() => setExpandido(v => !v)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text)] truncate">{nome}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-xs text-[var(--color-text-muted)]">
                🏆 Recorde: <span className="font-bold text-[var(--color-text)]">{record} kg</span>
              </span>
              {pontos.length >= 2 && (
                <span
                  className={`flex items-center gap-0.5 text-xs font-semibold ${
                    delta >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  <ArrowUpRight size={12} className={delta < 0 ? 'rotate-180' : ''} />
                  {delta >= 0 ? '+' : ''}
                  {delta.toFixed(1)} kg ({deltaPct >= 0 ? '+' : ''}
                  {deltaPct}%)
                </span>
              )}
              <span className="text-[10px] text-[var(--color-text-subtle)]">
                {pontos.length} sess{pontos.length === 1 ? 'ão' : 'ões'}
              </span>
            </div>
          </div>

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

      {expandido && pontos.length >= 2 && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={pontos} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
              <XAxis dataKey="data" tick={{ fontSize: 10, fill: 'var(--color-text-subtle)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-subtle)' }} unit=" kg" />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v} kg`, 'Máximo']} />
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
