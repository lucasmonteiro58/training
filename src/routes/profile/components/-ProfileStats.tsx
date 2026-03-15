import { Link } from '@tanstack/react-router'
import { History, Dumbbell, TrendingUp } from 'lucide-react'
import { formatDuration } from '../../../lib/notifications'

interface ProfileStatsProps {
  totalWorkouts: number
  totalPlans: number
  totalVolume: number
  totalDuration: number
}

export function ProfileStats({ totalWorkouts, totalPlans, totalVolume, totalDuration }: ProfileStatsProps) {
  const stats = [
    { icon: History, label: 'Total de Treinos', value: totalWorkouts, to: '/history' as const },
    { icon: Dumbbell, label: 'Planos Criados', value: totalPlans, to: '/workouts' as const },
    { icon: TrendingUp, label: 'Volume Total (kg)', value: Math.round(totalVolume).toLocaleString('pt-BR'), to: null },
    { icon: null, label: 'Tempo Total', value: formatDuration(totalDuration), to: null },
  ]

  return (
    <div className="card p-4 mb-5 animate-fade-up" style={{ animationDelay: '50ms' }}>
      <p className="text-xs font-bold text-text-muted mb-3">ESTATÍSTICAS GERAIS</p>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => {
          const content = (
            <>
              <p className="text-xl font-bold text-text">{stat.value}</p>
              <p className="text-xs text-text-muted mt-0.5">{stat.label}</p>
            </>
          )
          return (
            <div key={i} className="bg-surface-2 rounded-xl p-3">
              {stat.to ? (
                <Link
                  to={stat.to}
                  className="block rounded-lg -m-1 p-1 text-left hover:bg-surface-3/50 active:opacity-80 transition-opacity"
                  style={{ textDecoration: 'none' }}
                >
                  {content}
                </Link>
              ) : (
                content
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
