import { RefreshCw } from 'lucide-react'

interface PullToRefreshIndicatorProps {
  pullDistance: number
  isRefreshing: boolean
  threshold: number
}

export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  threshold,
}: PullToRefreshIndicatorProps) {
  if (pullDistance <= 0 && !isRefreshing) return null

  return (
    <div
      className="flex items-center justify-center transition-all duration-150"
      style={{
        height: pullDistance > 0 ? pullDistance : threshold,
        marginTop: -8,
      }}
    >
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-2 border border-border">
        <RefreshCw
          size={16}
          className={`text-accent transition-transform duration-200 ${isRefreshing ? 'animate-spin' : ''}`}
          style={{
            transform: isRefreshing ? undefined : `rotate(${Math.min(pullDistance / threshold, 1) * 360}deg)`,
          }}
        />
      </div>
    </div>
  )
}
