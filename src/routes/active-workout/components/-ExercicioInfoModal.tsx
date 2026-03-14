import { XCircle, Search, ExternalLink } from 'lucide-react'
import type { ExerciseInSession } from '../../../types'
import type { ExerciseInPlan } from '../../../types'

interface ExercicioInfoModalProps {
  exercicio: ExerciseInSession
  exercicioPlano?: ExerciseInPlan
  onClose: () => void
}

export function ExercicioInfoModal({ exercicio, exercicioPlano, onClose }: ExercicioInfoModalProps) {
  const gifUrl = exercicio.gifUrl || exercicioPlano?.exercicio.gifUrl
  const instrucoes = exercicio.instrucoes || exercicioPlano?.exercicio.instrucoes || []

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-h-[80dvh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text truncate pr-4">{exercicio.exercicioNome}</h2>
          <button type="button" onClick={onClose} className="btn-ghost p-2 text-text-subtle">
            <XCircle size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-5 pb-2">
          {gifUrl && (
            <img
              src={gifUrl}
              className="w-full max-h-56 object-contain rounded-xl bg-surface-2"
              alt="demonstração"
            />
          )}

          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-1">
                Músculo
              </p>
              <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium capitalize">
                {exercicio.grupoMuscular}
              </span>
            </div>
            {exercicioPlano?.exercicio.equipamento && (
              <div>
                <p className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-1">
                  Equipamento
                </p>
                <p className="text-sm text-text capitalize">{exercicioPlano.exercicio.equipamento}</p>
              </div>
            )}
          </div>

          {exercicio.notas && (
            <div className="p-3 rounded-xl bg-accent/5 border border-accent/10">
              <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">
                Observação do Treino
              </p>
              <p className="text-sm text-text italic">&quot;{exercicio.notas}&quot;</p>
            </div>
          )}

          {instrucoes.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-2">
                Instruções
              </p>
              <ol className="list-decimal list-inside space-y-2">
                {instrucoes.map((inst, i) => (
                  <li key={i} className="text-xs text-text-muted leading-relaxed">
                    {inst}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              const query = encodeURIComponent(
                `${exercicio.exercicioNome} ${exercicio.grupoMuscular} como fazer`
              )
              window.open(`https://www.google.com/search?q=${query}`, '_blank')
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-3 text-text text-xs font-semibold hover:bg-surface-2 transition-colors"
          >
            <Search size={14} />
            Buscar no Google
            <ExternalLink size={12} className="opacity-50" />
          </button>
        </div>
      </div>
    </div>
  )
}
