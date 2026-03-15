interface EditGoalModalProps {
  goalInput: string
  onGoalInputChange: (value: string) => void
  onSave: (value: number) => void
  onClose: () => void
}

export function EditGoalModal({
  goalInput,
  onGoalInputChange,
  onSave,
  onClose,
}: EditGoalModalProps) {
  const handleSave = () => {
    const value = parseInt(goalInput, 10)
    if (value >= 1 && value <= 7) {
      onSave(value)
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-text mb-1">Meta Semanal</h2>
        <p className="text-sm text-text-muted mb-4">
          Quantos treinos por semana você quer fazer?
        </p>
        <div className="flex items-center justify-center gap-4 mb-6">
          {[2, 3, 4, 5, 6, 7].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => onGoalInputChange(String(n))}
              className={`w-11 h-11 rounded-xl font-bold text-lg transition-all ${
                String(n) === goalInput ? 'bg-accent text-white scale-110' : 'bg-surface-2 text-text-muted'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <button type="button" onClick={handleSave} className="btn-primary w-full">
          Salvar
        </button>
      </div>
    </div>
  )
}
