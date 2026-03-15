
interface GroupAlert {
  group: string
  days: number
  color: string
}

interface GroupFrequencyCardProps {
  groupAlerts: GroupAlert[]
}

export function GroupFrequencyCard({ groupAlerts }: GroupFrequencyCardProps) {
  if (groupAlerts.length === 0) return null

  return (
    <div className="card p-4 mb-6 animate-fade-up" style={{ animationDelay: '125ms' }}>
      <p className="text-xs text-text-muted font-medium mb-3">GRUPOS MUSCULARES</p>
      <div className="flex flex-col gap-2">
        {groupAlerts.map(alert => (
          <div key={alert.group} className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: alert.color }}
            />
            <span className="text-sm text-text font-medium flex-1">{alert.group}</span>
            <span
              className={`text-xs font-semibold ${alert.days >= 14 ? 'text-warning' : 'text-text-muted'}`}
            >
              {alert.days === 1 ? '1 dia' : `${alert.days} dias`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
