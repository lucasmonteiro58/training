import { Trash2 } from 'lucide-react'

interface ConfirmExcluirModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmExcluirModal({ onConfirm, onCancel }: ConfirmExcluirModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content text-center" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-3xl bg-[rgba(239,68,68,0.12)] flex items-center justify-center mx-auto mb-4">
          <Trash2 size={32} className="text-[var(--color-danger)]" />
        </div>
        <h2 className="text-xl font-bold text-text mb-2">Excluir Sessão?</h2>
        <p className="text-text-muted text-sm mb-6">
          Esta ação não pode ser desfeita. O registro deste treino será removido do seu histórico.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={onConfirm} className="btn-danger w-full py-4 text-base">
            Sim, Excluir
          </button>
          <button onClick={onCancel} className="btn-ghost w-full py-3">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
