import { RotateCcw } from 'lucide-react'

interface ConfirmReplaceWorkoutModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmReplaceWorkoutModal({ onConfirm, onCancel }: ConfirmReplaceWorkoutModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content text-center" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-3xl bg-accent/15 flex items-center justify-center mx-auto mb-4">
          <RotateCcw size={32} className="text-accent" />
        </div>
        <h2 className="text-xl font-bold text-text mb-2">Substituir Treino?</h2>
        <p className="text-text-muted text-sm mb-6">
          Já existe um treino em andamento. Deseja substituí-lo por este do histórico? O treino atual será perdido.
        </p>
        <div className="flex flex-col gap-3">
          <button type="button" onClick={onConfirm} className="btn-primary w-full py-4 text-base">
            Sim, Substituir
          </button>
          <button type="button" onClick={onCancel} className="btn-ghost w-full py-3">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
