import { Flame, Trophy, Target } from 'lucide-react'

interface StreakMetaSectionProps {
  streakAtual: number
  treinosEstaSemana: number
  metaSemanal: number
  onEditMeta: () => void
}

export function StreakMetaSection({
  streakAtual,
  treinosEstaSemana,
  metaSemanal,
  onEditMeta,
}: StreakMetaSectionProps) {
  const pct = Math.min(100, (treinosEstaSemana / metaSemanal) * 100)
  const metaBatida = treinosEstaSemana >= metaSemanal

  return (
    <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-up" style={{ animationDelay: '75ms' }}>
      <div className="card p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
          <Flame size={20} className="text-orange-400" />
        </div>
        <div>
          <p className="text-2xl font-black text-text tabular-nums">{streakAtual}</p>
          <p className="text-[10px] text-text-muted">
            {streakAtual === 1 ? 'dia seguido' : 'dias seguidos'}
          </p>
        </div>
      </div>
      <button type="button" onClick={onEditMeta} className="card p-4 text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Meta Semanal
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-text">
              {treinosEstaSemana}/{metaSemanal}
            </span>
            <Target size={12} className="text-text-subtle" />
          </div>
        </div>
        <div className="progress-bar h-2!">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        {metaBatida && (
          <p className="text-[10px] text-success font-semibold mt-1.5 flex items-center gap-1">
            <Trophy size={10} /> Meta batida!
          </p>
        )}
      </button>
    </div>
  )
}
