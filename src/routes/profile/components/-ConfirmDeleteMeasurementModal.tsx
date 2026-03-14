interface ConfirmDeleteMeasurementModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeleteMeasurementModal({ onConfirm, onCancel }: ConfirmDeleteMeasurementModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content text-center" onClick={e => e.stopPropagation()}>
        <p className="text-lg font-bold text-text mb-2">Excluir medida?</p>
        <p className="text-sm text-text-muted mb-4">Esta ação não pode ser desfeita.</p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} className="btn-danger flex-1">
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}
