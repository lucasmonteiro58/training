import { useState } from 'react'
import type { Achievement } from '../../../lib/streaks'

interface AchievementsCardProps {
  achievements: Achievement[]
}

export function AchievementsCard({ achievements }: AchievementsCardProps) {
  const unlockedCount = achievements.filter(c => c.unlocked).length
  const [tooltipId, setTooltipId] = useState<string | null>(null)
  const selected = tooltipId ? achievements.find(c => c.id === tooltipId) : null

  return (
    <div className="card p-4 mb-5 animate-fade-up" style={{ animationDelay: '75ms' }}>
      <p className="text-xs font-bold text-text-muted mb-3">
        CONQUISTAS ({unlockedCount}/{achievements.length})
      </p>
      <div className="grid grid-cols-4 gap-2">
        {achievements.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => setTooltipId(prev => (prev === c.id ? null : c.id))}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all text-left w-full min-w-0 ${
              c.unlocked ? 'hover:bg-surface-2/60 active:scale-98' : 'opacity-30 grayscale cursor-default'
            }`}
          >
            <span className="text-2xl">{c.icon}</span>
            <span className="text-[9px] font-semibold text-text-muted text-center leading-tight">
              {c.name}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <>
          <div
            className="fixed inset-0 z-50"
            aria-hidden
            onClick={() => setTooltipId(null)}
          />
          <div
            role="tooltip"
            className="fixed left-4 right-4 z-50 bottom-[max(80px,env(safe-area-inset-bottom)+60px)] mx-auto max-w-sm animate-scale-in rounded-2xl bg-surface-2 border border-border p-4 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{selected.icon}</span>
              <div>
                <p className="font-bold text-text">{selected.name}</p>
                {selected.unlocked && selected.date && (
                  <p className="text-[10px] text-text-muted">
                    Desbloqueada em {new Date(selected.date).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-text-muted">
              {selected.description}
            </p>
            <button
              type="button"
              onClick={() => setTooltipId(null)}
              className="mt-3 w-full py-2 text-sm font-medium text-accent hover:bg-accent/10 rounded-xl transition-colors"
            >
              Fechar
            </button>
          </div>
        </>
      )}
    </div>
  )
}
