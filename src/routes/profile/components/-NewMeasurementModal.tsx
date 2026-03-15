import { X } from 'lucide-react'
import { MEASUREMENT_FIELDS } from '../../../types'

interface NewMeasurementModalProps {
  form: Record<string, string>
  onFormChange: (form: Record<string, string>) => void
  onSave: () => void
  onClose: () => void
}

export function NewMeasurementModal({ form, onFormChange, onSave, onClose }: NewMeasurementModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text">Nova Medida</h2>
          <button type="button" onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {MEASUREMENT_FIELDS.map(c => (
            <div key={c.key}>
              <label className="text-xs text-text-muted font-medium mb-1.5 block">
                {c.label} ({c.unidade})
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="0"
                value={form[c.key] ?? ''}
                onChange={e => onFormChange({ ...form, [c.key]: e.target.value })}
                className="input w-full"
              />
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="text-xs text-text-muted font-medium mb-1.5 block">Notas (opcional)</label>
          <textarea
            placeholder="Observações..."
            value={form.notes ?? ''}
            onChange={e => onFormChange({ ...form, notes: e.target.value })}
            className="input w-full resize-none"
            rows={3}
          />
        </div>

        <button type="button" onClick={onSave} className="btn-primary w-full">
          Salvar Medida
        </button>
      </div>
    </div>
  )
}
