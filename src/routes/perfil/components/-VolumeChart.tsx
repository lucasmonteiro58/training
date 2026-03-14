import { BarChart2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface VolumeChartProps {
  dados: { data: string; volume: number; plano?: string }[]
}

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  color: 'var(--color-text)',
  fontSize: 12,
}

export function VolumeChart({ dados }: VolumeChartProps) {
  if (dados.length < 2) {
    return (
      <div className="card p-4 animate-fade-up">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 size={16} className="text-[var(--color-accent)]" />
          <p className="text-sm font-bold text-text">Volume Total por Sessão</p>
          <span className="text-[10px] text-text-muted ml-auto">últimas 20</span>
        </div>
        <p className="text-xs text-text-muted text-center py-6">
          Complete pelo menos 2 treinos para ver o volume.
        </p>
      </div>
    )
  }

  return (
    <div className="card p-4 animate-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 size={16} className="text-[var(--color-accent)]" />
        <p className="text-sm font-bold text-text">Volume Total por Sessão</p>
        <span className="text-[10px] text-text-muted ml-auto">últimas 20</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={dados} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            opacity={0.4}
            vertical={false}
          />
          <XAxis dataKey="data" tick={{ fontSize: 10, fill: 'var(--color-text-subtle)' }} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-subtle)' }} unit=" kg" />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v: number) => [`${Number(v).toLocaleString('pt-BR')} kg`, 'Volume']}
            labelFormatter={(label, payload) => {
              const plano = payload?.[0]?.payload?.plano
              return plano ? `${label} · ${plano}` : label
            }}
          />
          <Bar
            dataKey="volume"
            fill="var(--color-accent)"
            radius={[6, 6, 0, 0]}
            opacity={0.85}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
