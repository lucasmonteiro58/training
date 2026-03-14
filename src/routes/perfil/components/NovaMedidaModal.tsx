import { X } from 'lucide-react'
import { CAMPOS_MEDIDA } from '../../../types'

interface NovaMedidaModalProps {
  form: Record<string, string>
  onFormChange: (form: Record<string, string>) => void
  onSalvar: () => void
  onClose: () => void
}

export function NovaMedidaModal({ form, onFormChange, onSalvar, onClose }: NovaMedidaModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Nova Medida</h2>
          <button type="button" onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {CAMPOS_MEDIDA.map(c => (
            <div key={c.key}>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                {c.label} ({c.unidade})
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="0"
                value={form[c.key] ?? ''}
                onChange={e => onFormChange({ ...form, [c.key]: e.target.value })}
                className="input-field w-full text-sm"
              />
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Notas (opcional)</label>
          <textarea
            placeholder="Observações..."
            value={form.notas ?? ''}
            onChange={e => onFormChange({ ...form, notas: e.target.value })}
            className="input-field w-full text-sm resize-none"
            rows={2}
          />
        </div>

        <button type="button" onClick={onSalvar} className="btn-primary w-full">
          Salvar Medida
        </button>
      </div>
    </div>
  )
}
