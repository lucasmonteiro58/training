import { Flame, TrendingUp, Dumbbell } from 'lucide-react'

interface HomeStatsProps {
  workoutsThisWeek: number
  totalVolume: number
  totalWorkouts: number
}

export function HomeStats({ workoutsThisWeek, totalVolume, totalWorkouts }: HomeStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-up" style={{ animationDelay: '50ms' }}>
      <div className="card p-3 text-center">
        <Flame size={18} className="text-orange-400 mx-auto mb-1" />
        <p className="text-xl font-bold text-text">{workoutsThisWeek}</p>
        <p className="text-[10px] text-text-muted mt-0.5">esta semana</p>
      </div>
      <div className="card p-3 text-center">
        <TrendingUp size={18} className="text-accent mx-auto mb-1" />
        <p className="text-xl font-bold text-text">
          {totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : Math.round(totalVolume)}
        </p>
        <p className="text-[10px] text-text-muted mt-0.5">vol. total (kg)</p>
      </div>
      <div className="card p-3 text-center">
        <Dumbbell size={18} className="text-green-400 mx-auto mb-1" />
        <p className="text-xl font-bold text-text">{totalWorkouts}</p>
        <p className="text-[10px] text-text-muted mt-0.5">treinos total</p>
      </div>
    </div>
  )
}
