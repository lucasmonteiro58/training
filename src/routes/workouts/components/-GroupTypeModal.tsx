import { Link2 } from 'lucide-react'
import type { GroupingType } from '../../../types'
import { GROUPING_CONFIG } from '../../../types'

interface GroupTypeModalProps {
  onSelect: (tipo: GroupingType) => void
  onClose: () => void
}

const DESCRICOES: Record<GroupingType, string> = {
  superset: 'Executa exercícios alternados sem descanso',
  dropset: 'Reduz peso progressivamente sem pausa',
  giantset: 'Circuito de 3+ exercícios sem descanso',
}

export function GroupTypeModal({ onSelect, onClose }: GroupTypeModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-text mb-4">Tipo de Agrupamento</h2>
        <div className="flex flex-col gap-2">
          {(Object.entries(GROUPING_CONFIG) as [GroupingType, (typeof GROUPING_CONFIG)[GroupingType]][]).map(
            ([tipo, config]) => (
              <button
                key={tipo}
                type="button"
                onClick={() => onSelect(tipo)}
                className="flex items-center gap-3 p-4 rounded-xl transition-colors hover:bg-surface-2"
                style={{ background: config.corBg }}
              >
                <Link2 size={18} style={{ color: config.cor }} />
                <div className="text-left">
                  <p className="font-semibold text-text text-sm">{config.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{DESCRICOES[tipo]}</p>
                </div>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
