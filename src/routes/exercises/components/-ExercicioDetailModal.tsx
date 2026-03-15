import type { Exercise } from '../../../types'

interface ExerciseDetailModalProps {
  exercise: Exercise
  onClose: () => void
}

export function ExerciseDetailModal({ exercise, onClose }: ExerciseDetailModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-h-[85dvh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-2 shrink-0 mb-4">
          <h2 className="text-lg font-bold text-text truncate min-w-0">{exercise.name}</h2>
          <button type="button" onClick={onClose} className="btn-ghost p-2 text-text-muted shrink-0" aria-label="Fechar">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 min-h-0">
          {exercise.gifUrl && (
            <img
              src={exercise.gifUrl}
              alt={exercise.name}
              className="w-full max-h-56 object-contain rounded-xl bg-surface-2 shrink-0"
            />
          )}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-1">Músculo</p>
              <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium capitalize">
                {exercise.muscleGroup}
              </span>
            </div>
            {exercise.equipment && (
              <div>
                <p className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-1">Equipamento</p>
                <p className="text-sm text-text">{exercise.equipment}</p>
              </div>
            )}
            {exercise.instructions && exercise.instructions.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-1">INSTRUÇÕES</p>
                <ol className="list-decimal list-inside space-y-1.5">
                  {exercise.instructions.map((inst: string, i: number) => (
                    <li key={i} className="text-xs text-text-muted leading-relaxed">
                      {inst}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
