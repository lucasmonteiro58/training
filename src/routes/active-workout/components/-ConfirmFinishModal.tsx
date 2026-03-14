import { CheckCircle } from 'lucide-react'

interface ConfirmFinishModalProps {
  onConfirm: () => void
  onCancel: () => void
  finalizando: boolean
}

export function ConfirmFinishModal({ onConfirm, onCancel, finalizando }: ConfirmFinishModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content text-center" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-3xl bg-[rgba(34,197,94,0.12)] flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-success" />
        </div>
        <h2 className="text-xl font-bold text-text mb-2">Finalizar Treino?</h2>
        <p className="text-text-muted text-sm mb-6">
          Parabéns pelo esforço! Todas as séries concluídas serão registradas no seu histórico.
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={finalizando}
            className="btn-success w-full py-4 text-base"
          >
            {finalizando ? 'Salvando...' : 'Sim, Finalizar Agora'}
          </button>
          <button type="button" onClick={onCancel} className="btn-ghost w-full py-3">
            Continuar Treinando
          </button>
        </div>
      </div>
    </div>
  )
}
