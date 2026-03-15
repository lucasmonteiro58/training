import { XCircle } from 'lucide-react'

interface CancelCreationModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export function CancelCreationModal({ onConfirm, onCancel }: CancelCreationModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content text-center" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-3xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
          <XCircle size={32} className="text-danger" />
        </div>
        <h2 className="text-xl font-bold text-text mb-2">Cancelar criação?</h2>
        <p className="text-text-muted text-sm mb-6">
          As alterações feitas serão perdidas e o plano não será salvo.
        </p>
        <div className="flex flex-col gap-3">
          <button type="button" onClick={onConfirm} className="btn-danger w-full py-4 text-base">
            Sim, Descartar
          </button>
          <button type="button" onClick={onCancel} className="btn-ghost w-full py-3">
            Continuar Editando
          </button>
        </div>
      </div>
    </div>
  )
}
