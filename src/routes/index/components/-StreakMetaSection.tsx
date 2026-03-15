import { Flame, Trophy, Target } from 'lucide-react'

interface StreakGoalSectionProps {
  currentStreak: number
  workoutsThisWeek: number
  weeklyGoal: number
  onEditGoal: () => void
}

export function StreakGoalSection({
  currentStreak,
  workoutsThisWeek,
  weeklyGoal,
  onEditGoal,
}: StreakGoalSectionProps) {
  const pct = Math.min(100, (workoutsThisWeek / weeklyGoal) * 100)
  const goalReached = workoutsThisWeek >= weeklyGoal

  return (
    <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-up" style={{ animationDelay: '75ms' }}>
      <div className="card p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
          <Flame size={20} className="text-orange-400" />
        </div>
        <div>
          <p className="text-2xl font-black text-text tabular-nums">{currentStreak}</p>
          <p className="text-[10px] text-text-muted">
            {currentStreak === 1 ? 'dia seguido' : 'dias seguidos'}
          </p>
        </div>
      </div>
      <button type="button" onClick={onEditGoal} className="card p-4 text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Meta Semanal
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-text">
              {workoutsThisWeek}/{weeklyGoal}
            </span>
            <Target size={12} className="text-text-subtle" />
          </div>
        </div>
        <div className="progress-bar h-2!">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        {goalReached && (
          <p className="text-[10px] text-success font-semibold mt-1.5 flex items-center gap-1">
            <Trophy size={10} /> Meta batida!
          </p>
        )}
      </button>
    </div>
  )
}
