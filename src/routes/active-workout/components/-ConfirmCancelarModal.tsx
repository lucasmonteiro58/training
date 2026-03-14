import { XCircle } from 'lucide-react'

interface ConfirmCancelarModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmCancelarModal({ onConfirm, onCancel }: ConfirmCancelarModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content text-center" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-3xl bg-[rgba(239,68,68,0.12)] flex items-center justify-center mx-auto mb-4">
          <XCircle size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-text mb-2">Cancelar Treino?</h2>
        <p className="text-text-muted text-sm mb-6">
          Todo o progresso desta sessão será perdido e não será salvo no histórico.
        </p>
        <div className="flex flex-col gap-3">
          <button type="button" onClick={onConfirm} className="btn-danger w-full py-4 text-base">
            Sim, Cancelar Treino
          </button>
          <button type="button" onClick={onCancel} className="btn-ghost w-full py-3">
            Continuar Treinando
          </button>
        </div>
      </div>
    </div>
  )
}
