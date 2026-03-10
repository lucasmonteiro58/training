import { useEffect, useState } from 'react'

const COLORS = ['#6366f1', '#a78bfa', '#f59e0b', '#22c55e', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6']

interface ConfettiProps {
  active: boolean
  duration?: number
}

export function Confetti({ active, duration = 2500 }: ConfettiProps) {
  const [pieces, setPieces] = useState<{ id: number; left: number; color: string; size: number; delay: number; dur: number }[]>([])

  useEffect(() => {
    if (!active) { setPieces([]); return }
    const newPieces = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 0.6,
      dur: 1.5 + Math.random() * 1.5,
    }))
    setPieces(newPieces)
    const t = setTimeout(() => setPieces([]), duration)
    return () => clearTimeout(t)
  }, [active, duration])

  if (pieces.length === 0) return null

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </>
  )
}
