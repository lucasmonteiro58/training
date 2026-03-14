import { useState, useRef, useCallback } from 'react'

const DEFAULT_THRESHOLD = 80

interface UsePullToRefreshOptions {
  threshold?: number
  maxDistance?: number
}

export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  options: UsePullToRefreshOptions = {}
) {
  const { threshold = DEFAULT_THRESHOLD, maxDistance = 120 } = options
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const touchStartY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY
    } else {
      touchStartY.current = 0
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartY.current === 0 || isRefreshing) return
      const diff = e.touches[0].clientY - touchStartY.current
      if (diff > 0) setPullDistance(Math.min(diff * 0.5, maxDistance))
    },
    [isRefreshing, maxDistance]
  )

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(threshold)
      await onRefresh()
      setIsRefreshing(false)
    }
    setPullDistance(0)
    touchStartY.current = 0
  }, [pullDistance, isRefreshing, threshold, onRefresh])

  return {
    pullDistance,
    isRefreshing,
    containerRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    threshold,
  }
}
