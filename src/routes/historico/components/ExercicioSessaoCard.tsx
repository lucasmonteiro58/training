import { CheckCircle2, Circle, Trophy } from 'lucide-react'
import type { ExercicioNaSessao } from '../../../types'
import type { RecordeExercicio } from '../../../lib/records'

interface ExercicioSessaoCardProps {
  ex: ExercicioNaSessao
  exIdx: number
  editando: boolean
  recordesSemAtual: Map<string, RecordeExercicio>
  onUpdateSerie: (exIdx: number, sIdx: number, campo: Partial<{ peso: number; repeticoes: number; completada: boolean }>) => void
}

export function ExercicioSessaoCard({
  ex,
  exIdx,
  editando,
  recordesSemAtual,
  onUpdateSerie,
}: ExercicioSessaoCardProps) {
  const seriesPRs = ex.series.map(s => {
    if (!s.completada || s.peso <= 0) return false
    const rec = recordesSemAtual.get(ex.exercicioId)
    if (!rec) return true
    return s.peso > rec.maiorPeso
  })

  return (
    <div className="card p-4 animate-fade-up" style={{ animationDelay: `${(exIdx + 3) * 40}ms` }}>
      <div className="flex items-center gap-3 mb-3">
        {ex.gifUrl ? (
          <img
            src={ex.gifUrl}
            alt={ex.exercicioNome}
            className="w-12 h-12 rounded-xl object-contain bg-[var(--color-surface-2)] flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">💪</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[var(--color-text)] font-bold text-sm truncate">{ex.exercicioNome}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{ex.grupoMuscular}</p>
        </div>
        {seriesPRs.some(Boolean) && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
            <Trophy size={10} /> PR
          </span>
        )}
      </div>

      <div className="grid grid-cols-[24px_1fr_1fr_24px] gap-2 px-1 mb-1">
        {['#', 'Peso (kg)', 'Reps', ''].map((h, i) => (
          <span key={i} className="text-[9px] text-[var(--color-text-subtle)] font-semibold text-center">{h}</span>
        ))}
      </div>
      {ex.series.map((s, sIdx) => (
        <div
          key={s.id}
          className={`grid grid-cols-[24px_1fr_1fr_24px] gap-2 px-1 py-1.5 rounded-lg ${s.completada ? 'bg-[rgba(34,197,94,0.06)]' : ''}`}
        >
          <span className="text-xs text-center text-[var(--color-text-subtle)] font-bold">{sIdx + 1}</span>
          {editando ? (
            <>
              <input
                type="number"
                className="set-input h-8! py-0! text-sm! text-center"
                value={s.peso === 0 ? '' : s.peso}
                onChange={e =>
                  onUpdateSerie(exIdx, sIdx, { peso: e.target.value === '' ? 0 : parseFloat(e.target.value) })
                }
                onFocus={e => e.target.select()}
              />
              <input
                type="number"
                className="set-input h-8! py-0! text-sm! text-center"
                value={s.repeticoes === 0 ? '' : s.repeticoes}
                onChange={e =>
                  onUpdateSerie(exIdx, sIdx, { repeticoes: e.target.value === '' ? 0 : parseInt(e.target.value) })
                }
                onFocus={e => e.target.select()}
              />
            </>
          ) : (
            <>
              <span className="text-sm text-center text-[var(--color-text)] font-semibold">
                {s.peso ? `${s.peso}kg` : '–'}
              </span>
              <span className="text-sm text-center text-[var(--color-text)] font-semibold">
                {s.repeticoes || '–'}
              </span>
            </>
          )}
          <span className="flex items-center justify-center">
            {editando ? (
              <button
                type="button"
                onClick={() => onUpdateSerie(exIdx, sIdx, { completada: !s.completada })}
                className="p-0.5 rounded-full hover:bg-[var(--color-surface-2)] transition-colors"
                title={s.completada ? 'Marcar como não concluída' : 'Marcar como concluída'}
              >
                {s.completada ? (
                  <CheckCircle2 size={15} className="text-[var(--color-success)]" />
                ) : (
                  <Circle size={15} className="text-[var(--color-text-subtle)]" />
                )}
              </button>
            ) : seriesPRs[sIdx] ? (
              <Trophy size={15} className="text-yellow-400" />
            ) : s.completada ? (
              <CheckCircle2 size={15} className="text-[var(--color-success)]" />
            ) : (
              <Circle size={15} className="text-[var(--color-text-subtle)]" />
            )}
          </span>
        </div>
      ))}
    </div>
  )
}
