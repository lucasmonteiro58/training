import { CORES_PLANO } from '../../../types'

interface PlanDetailsCardProps {
  nome: string
  onNomeChange: (value: string) => void
  descricao: string
  onDescricaoChange: (value: string) => void
  corSelecionada: string
  onCorChange: (cor: string) => void
}

export function PlanDetailsCard({
  nome,
  onNomeChange,
  descricao,
  onDescricaoChange,
  corSelecionada,
  onCorChange,
}: PlanDetailsCardProps) {
  return (
    <div className="card p-4 mb-4 animate-fade-up">
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-text-muted font-medium mb-1.5 block">NOME DO PLANO *</label>
          <input
            className="input"
            placeholder="Ex: Treino A – Peito e Tríceps"
            value={nome}
            onChange={e => onNomeChange(e.target.value)}
            maxLength={60}
          />
        </div>
        <div>
          <label className="text-xs text-text-muted font-medium mb-1.5 block">
            DESCRIÇÃO (opcional)
          </label>
          <textarea
            className="input resize-none"
            placeholder="Ex: Foco em hipertrofia..."
            rows={2}
            value={descricao}
            onChange={e => onDescricaoChange(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-text-muted font-medium mb-1.5 block">COR</label>
          <div className="flex gap-2 flex-wrap">
            {CORES_PLANO.map(cor => (
              <button
                key={cor}
                type="button"
                className={`w-8 h-8 rounded-full transition-transform ${
                  corSelecionada === cor
                    ? 'scale-105 ring-2 ring-offset-2 ring-offset-surface ring-white'
                    : 'opacity-60 hover:opacity-100 hover:scale-110'
                }`}
                style={{ background: cor }}
                onClick={() => onCorChange(cor)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
