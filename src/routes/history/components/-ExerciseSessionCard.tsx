import { CheckCircle2, Circle, Trophy } from 'lucide-react'
import type { ExerciseInSession } from '../../../types'
import type { RecordeExercicio } from '../../../lib/records'

interface ExerciseSessionCardProps {
  ex: ExerciseInSession
  exIdx: number
  editando: boolean
  recordesSemAtual: Map<string, RecordeExercicio>
  onUpdateSerie: (exIdx: number, sIdx: number, campo: Partial<{ weight: number; reps: number; completed: boolean }>) => void
}

export function ExerciseSessionCard({
  ex,
  exIdx,
  editando,
  recordesSemAtual,
  onUpdateSerie,
}: ExerciseSessionCardProps) {
  const seriesPRs = ex.sets.map((s: { completed: boolean; weight: number }) => {
    if (!s.completed || s.weight <= 0) return false
    const rec = recordesSemAtual.get(ex.exerciseId)
    if (!rec) return true
    return s.weight > rec.maiorPeso
  })

  return (
    <div className="card p-4 animate-fade-up" style={{ animationDelay: `${(exIdx + 3) * 40}ms` }}>
      <div className="flex items-center gap-3 mb-3">
        {ex.gifUrl ? (
          <img
            src={ex.gifUrl}
            alt={ex.exerciseName}
            className="w-12 h-12 rounded-xl object-contain bg-surface-2 shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center shrink-0">
            <span className="text-2xl">💪</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-text font-bold text-sm truncate">{ex.exerciseName}</p>
          <p className="text-xs text-text-muted mt-0.5">{ex.muscleGroup}</p>
        </div>
        {seriesPRs.some(Boolean) && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
            <Trophy size={10} /> PR
          </span>
        )}
      </div>

      <div className="grid grid-cols-[24px_1fr_1fr_24px] gap-2 px-1 mb-1">
        {['#', 'Peso (kg)', 'Reps', ''].map((h, i) => (
          <span key={i} className="text-[9px] text-text-subtle font-semibold text-center">{h}</span>
        ))}
      </div>
      {ex.sets.map((s: { id: string; completed: boolean; weight: number; reps: number }, sIdx: number) => (
        <div
          key={s.id}
          className={`grid grid-cols-[24px_1fr_1fr_24px] gap-2 px-1 py-1.5 rounded-lg ${s.completed ? 'bg-[rgba(34,197,94,0.06)]' : ''}`}
        >
          <span className="text-xs text-center text-text-subtle font-bold">{sIdx + 1}</span>
          {editando ? (
            <>
              <input
                type="number"
                className="set-input h-8! py-0! text-sm! text-center"
                value={s.weight === 0 ? '' : s.weight}
                onChange={e =>
                  onUpdateSerie(exIdx, sIdx, { weight: e.target.value === '' ? 0 : parseFloat(e.target.value) })
                }
                onFocus={e => e.target.select()}
              />
              <input
                type="number"
                className="set-input h-8! py-0! text-sm! text-center"
                value={s.reps === 0 ? '' : s.reps}
                onChange={e =>
                  onUpdateSerie(exIdx, sIdx, { reps: e.target.value === '' ? 0 : parseInt(e.target.value) })
                }
                onFocus={e => e.target.select()}
              />
            </>
          ) : (
            <>
              <span className="text-sm text-center text-text font-semibold">
                {s.weight ? `${s.weight}kg` : '–'}
              </span>
              <span className="text-sm text-center text-text font-semibold">
                {s.reps || '–'}
              </span>
            </>
          )}
          <span className="flex items-center justify-center">
            {editando ? (
              <button
                type="button"
                onClick={() => onUpdateSerie(exIdx, sIdx, { completed: !s.completed })}
                className="p-0.5 rounded-full hover:bg-surface-2 transition-colors"
                title={s.completed ? 'Marcar como não concluída' : 'Marcar como concluída'}
              >
                {s.completed ? (
                  <CheckCircle2 size={15} className="text-success" />
                ) : (
                  <Circle size={15} className="text-text-subtle" />
                )}
              </button>
            ) : seriesPRs[sIdx] ? (
              <Trophy size={15} className="text-yellow-400" />
            ) : s.completed ? (
              <CheckCircle2 size={15} className="text-success" />
            ) : (
              <Circle size={15} className="text-text-subtle" />
            )}
          </span>
        </div>
      ))}
    </div>
  )
}
