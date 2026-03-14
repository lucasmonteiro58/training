interface EditMetaModalProps {
  metaInput: string
  onMetaInputChange: (value: string) => void
  onSave: (valor: number) => void
  onClose: () => void
}

export function EditMetaModal({
  metaInput,
  onMetaInputChange,
  onSave,
  onClose,
}: EditMetaModalProps) {
  const handleSave = () => {
    const valor = parseInt(metaInput, 10)
    if (valor >= 1 && valor <= 7) {
      onSave(valor)
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
              onClick={() => onMetaInputChange(String(n))}
              className={`w-11 h-11 rounded-xl font-bold text-lg transition-all ${
                String(n) === metaInput ? 'bg-accent text-white scale-110' : 'bg-surface-2 text-text-muted'
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
