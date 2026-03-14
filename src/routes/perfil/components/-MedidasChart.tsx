import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { CAMPOS_MEDIDA } from '../../../types'

interface MedidasChartProps {
  campoGrafico: string
  dados: { data: string; valor: number }[]
  onCampoChange: (key: string) => void
}

export function MedidasChart({ campoGrafico, dados, onCampoChange }: MedidasChartProps) {
  const campoAtual = CAMPOS_MEDIDA.find(c => c.key === campoGrafico)

  return (
    <div className="card p-4 mb-5 animate-fade-up" style={{ animationDelay: '50ms' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-text-muted uppercase">Evolução</p>
        <select
          value={campoGrafico}
          onChange={e => onCampoChange(e.target.value)}
          className="text-xs bg-surface-2 text-text border border-[var(--color-border)] rounded-lg px-2 py-1"
        >
          {CAMPOS_MEDIDA.map(c => (
            <option key={c.key} value={c.key}>
              {c.label} ({c.unidade})
            </option>
          ))}
        </select>
      </div>
      {dados.length >= 1 ? (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={dados}>
            <XAxis dataKey="data" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
              domain={['auto', 'auto']}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v} ${campoAtual?.unidade ?? ''}`, campoAtual?.label ?? '']}
            />
            <Line
              type="monotone"
              dataKey="valor"
              stroke="var(--color-accent)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'var(--color-accent)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-xs text-text-muted text-center py-6">
          Registre mais medidas de {campoAtual?.label.toLowerCase()} para ver o gráfico.
        </p>
      )}
    </div>
  )
}
