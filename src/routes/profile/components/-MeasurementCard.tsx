import { Trash2 } from 'lucide-react'
import { MEASUREMENT_FIELDS } from '../../../types'
import type { BodyMeasurement } from '../../../types'

interface MeasurementCardProps {
  measurement: BodyMeasurement
  onDelete: () => void
}

export function MeasurementCard({ measurement, onDelete }: MeasurementCardProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-text">
          {new Date(measurement.date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </p>
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-surface-2 text-text-subtle"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {MEASUREMENT_FIELDS.filter(c => measurement[c.key] != null).map(c => (
          <div key={c.key} className="bg-surface-2 rounded-lg px-2 py-1.5">
            <p className="text-[10px] text-text-muted uppercase">{c.label}</p>
            <p className="text-sm font-bold text-text">
              {String(measurement[c.key] ?? '')}{' '}
              <span className="text-xs font-normal text-text-muted">{c.unidade}</span>
            </p>
          </div>
        ))}
      </div>
      {measurement.notes && (
        <p className="text-xs text-text-muted mt-2 italic">📝 {measurement.notes}</p>
      )}
    </div>
  )
}
