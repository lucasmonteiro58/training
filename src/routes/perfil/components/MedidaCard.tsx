import { Trash2 } from 'lucide-react'
import { CAMPOS_MEDIDA } from '../../../types'
import type { MedidaCorporal } from '../../../types'

interface MedidaCardProps {
  medida: MedidaCorporal
  onExcluir: () => void
}

export function MedidaCard({ medida, onExcluir }: MedidaCardProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-[var(--color-text)]">
          {new Date(medida.data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </p>
        <button
          type="button"
          onClick={onExcluir}
          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-subtle)]"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {CAMPOS_MEDIDA.filter(c => (medida as Record<string, unknown>)[c.key] != null).map(c => (
          <div key={c.key} className="bg-[var(--color-surface-2)] rounded-lg px-2 py-1.5">
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase">{c.label}</p>
            <p className="text-sm font-bold text-[var(--color-text)]">
              {(medida as Record<string, unknown>)[c.key]}{' '}
              <span className="text-xs font-normal text-[var(--color-text-muted)]">{c.unidade}</span>
            </p>
          </div>
        ))}
      </div>
      {medida.notas && (
        <p className="text-xs text-[var(--color-text-muted)] mt-2 italic">📝 {medida.notas}</p>
      )}
    </div>
  )
}
