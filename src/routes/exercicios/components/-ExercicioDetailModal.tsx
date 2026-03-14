import type { Exercicio } from '../../../types'

interface ExercicioDetailModalProps {
  exercicio: Exercicio
  onClose: () => void
}

export function ExercicioDetailModal({ exercicio, onClose }: ExercicioDetailModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-bold text-text truncate pr-8">{exercicio.nome}</h2>
          <button type="button" onClick={onClose} className="btn-ghost p-2 text-text-muted">
            ✕
          </button>
        </div>
        {exercicio.gifUrl && (
          <img
            src={exercicio.gifUrl}
            alt={exercicio.nome}
            className="w-full max-h-56 object-contain rounded-xl bg-surface-2 mb-4"
          />
        )}
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-1">Músculo</p>
            <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium capitalize">
              {exercicio.grupoMuscular}
            </span>
          </div>
          {exercicio.equipamento && (
            <div>
              <p className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-1">Equipamento</p>
              <p className="text-sm text-text">{exercicio.equipamento}</p>
            </div>
          )}
          {exercicio.instrucoes && exercicio.instrucoes.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-1">INSTRUÇÕES</p>
              <ol className="list-decimal list-inside space-y-1.5">
                {exercicio.instrucoes.map((inst, i) => (
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
  )
}
