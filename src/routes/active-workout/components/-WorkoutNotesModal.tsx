interface WorkoutNotesModalProps {
  notes: string
  onNotesChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
}

export function WorkoutNotesModal({ notes, onNotesChange, onSave, onCancel }: WorkoutNotesModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-text mb-3">📝 Notas do Treino</h2>
        <textarea
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
          placeholder="Como está se sentindo? Algo diferente hoje?..."
          className="input-field w-full text-sm resize-none"
          rows={4}
          autoFocus
        />
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="button" onClick={onSave} className="btn-primary flex-1">
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
