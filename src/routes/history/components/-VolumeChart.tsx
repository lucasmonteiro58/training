import { TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface VolumeChartProps {
  data: { week: string; volume: number }[]
}

export function VolumeChart({ data }: VolumeChartProps) {
  if (data.length <= 1) return null
  return (
    <div className="card p-4 mb-6 animate-fade-up" style={{ animationDelay: '50ms' }}>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={16} className="text-accent" />
        <p className="text-sm font-bold text-text">Volume por Semana (kg)</p>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} barSize={20}>
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#8b8fa8' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#1e2028', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }}
            labelStyle={{ color: '#f0f0f5' }}
            itemStyle={{ color: '#8b5cf6' }}
          />
          <Bar dataKey="volume" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
