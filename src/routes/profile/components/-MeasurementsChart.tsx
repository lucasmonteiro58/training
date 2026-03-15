import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { MEASUREMENT_FIELDS } from '../../../types'

interface MeasurementsChartProps {
  chartFieldKey: string
  data: { data: string; valor: number }[]
  onChartFieldChange: (key: string) => void
}

export function MeasurementsChart({ chartFieldKey, data, onChartFieldChange }: MeasurementsChartProps) {
  const currentField = MEASUREMENT_FIELDS.find(c => c.key === chartFieldKey)

  return (
    <div className="card p-4 mb-5 animate-fade-up" style={{ animationDelay: '50ms' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-text-muted uppercase">Evolução</p>
        <select
          value={chartFieldKey}
          onChange={e => onChartFieldChange(e.target.value)}
          className="text-xs bg-surface-2 text-text border border-border rounded-lg px-2 py-1"
        >
          {MEASUREMENT_FIELDS.map(c => (
            <option key={c.key} value={c.key}>
              {c.label} ({c.unidade})
            </option>
          ))}
        </select>
      </div>
      {data.length >= 1 ? (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data}>
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
              formatter={(v: unknown) => [`${Number(v)} ${currentField?.unidade ?? ''}`, currentField?.label ?? '']}
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
          Registre mais medidas de {currentField?.label.toLowerCase()} para ver o gráfico.
        </p>
      )}
    </div>
  )
}
