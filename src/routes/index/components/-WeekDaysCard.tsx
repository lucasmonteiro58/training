interface WeekDaysCardProps {
  weekDayLabels: string[]
  weekStart: Date
  today: Date
  sessions: { startedAt: number }[]
  /** Optional week days (0=sun, ..., 6=sat). Subtle indicator on widget. */
  optionalDays?: number[]
}

export function WeekDaysCard({
  weekDayLabels,
  weekStart,
  today,
  sessions,
  optionalDays = [],
}: WeekDaysCardProps) {
  return (
    <div className="card p-4 mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
      <p className="text-xs text-text-muted font-medium mb-3">ESTA SEMANA</p>
      <div className="flex justify-between">
        {weekDayLabels.map((dayLabel, idx) => {
          const dayDate = new Date(weekStart)
          dayDate.setDate(weekStart.getDate() + idx)
          const hasWorkout = sessions.some(s => {
            const d = new Date(s.startedAt)
            return d.toDateString() === dayDate.toDateString()
          })
          const isToday = dayDate.toDateString() === today.toDateString()
          const isOptional = optionalDays.includes(idx)
          return (
            <div key={idx} className="flex flex-col items-center gap-1.5">
              <span
                className={`text-[10px] ${isToday ? 'text-accent font-semibold' : 'text-text-subtle'}`}
              >
                {dayLabel}
              </span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold relative ${
                  hasWorkout
                    ? 'bg-accent text-white'
                    : isToday
                      ? 'border-2 border-accent text-accent'
                      : 'bg-surface-2 text-text-subtle'
                } ${isOptional && !hasWorkout ? 'ring-1 ring-border ring-offset-1 ring-offset-bg' : ''}`}
              >
                {hasWorkout ? '✓' : dayDate.getDate()}
              </div>
              {isOptional && (
                <span className="text-[9px] text-text-muted/70" title="Dia opcional">
                  opc
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
