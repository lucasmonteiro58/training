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

interface DataPoint {
  dateLabel: string
  weight: number
  startedAt?: number
}

interface ProgressExerciseCardProps {
  name: string
  points: DataPoint[]
}

export function ProgressExerciseCard({ name, points }: ProgressExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const record = points.length > 0 ? Math.max(...points.map(p => p.weight)) : 0
  const first = points[0]?.weight ?? 0
  const last = points[points.length - 1]?.weight ?? 0
  const delta = last - first
  const deltaPct = first > 0 ? Math.round((delta / first) * 100) : 0

  return (
    <div className="card p-4">
      <button type="button" className="w-full text-left" onClick={() => setIsExpanded(v => !v)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text truncate">{name}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-xs text-text-muted">
                🏆 Recorde: <span className="font-bold text-text">{record} kg</span>
              </span>
              {points.length >= 2 && (
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
              <span className="text-[10px] text-text-subtle">
                {points.length} sess{points.length === 1 ? 'ão' : 'ões'}
              </span>
            </div>
          </div>

          {points.length >= 2 && !isExpanded && (
            <div className="w-20 h-10 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points}>
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="text-text-subtle shrink-0">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {isExpanded && points.length >= 2 && (
        <div className="mt-4 pt-4 border-t border-border">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={points} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fill: 'var(--color-text-subtle)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-subtle)' }} unit=" kg" />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: unknown) => [`${Number(v)} kg`, 'Máximo']} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="var(--color-accent)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: 'var(--color-accent)', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {isExpanded && points.length < 2 && (
        <p className="text-xs text-text-muted text-center mt-4 py-2">
          Complete pelo menos 2 sessões para ver o gráfico.
        </p>
      )}
    </div>
  )
}
