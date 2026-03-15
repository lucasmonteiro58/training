import { History, Dumbbell, TrendingUp } from 'lucide-react'
import { formatDuration } from '../../../lib/notifications'

interface ProfileStatsProps {
  totalTreinos: number
  totalPlanos: number
  volumeTotal: number
  tempoTotal: number
}

export function ProfileStats({ totalTreinos, totalPlanos, volumeTotal, tempoTotal }: ProfileStatsProps) {
  const stats = [
    { icon: History, label: 'Total de Treinos', value: totalTreinos },
    { icon: Dumbbell, label: 'Planos Criados', value: totalPlanos },
    { icon: TrendingUp, label: 'Volume Total (kg)', value: Math.round(volumeTotal).toLocaleString('pt-BR') },
    { icon: null, label: 'Tempo Total', value: formatDuration(tempoTotal) },
  ]

  return (
    <div className="card p-4 mb-5 animate-fade-up" style={{ animationDelay: '50ms' }}>
      <p className="text-xs font-bold text-text-muted mb-3">ESTATÍSTICAS GERAIS</p>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="bg-surface-2 rounded-xl p-3">
            <p className="text-xl font-bold text-text">{stat.value}</p>
            <p className="text-xs text-text-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
