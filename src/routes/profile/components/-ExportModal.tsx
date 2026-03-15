import { Download } from 'lucide-react'
import type { WorkoutSession } from '../../../types'
import type { WorkoutPlan } from '../../../types'
import { exportSessionsCSV, exportSessionsJSON, exportPlansJSON } from '../../../lib/exportar'

interface ExportModalProps {
  sessions: WorkoutSession[]
  plans: WorkoutPlan[]
  onClose: () => void
  onExport: (message: string) => void
}

export function ExportModal({ sessions, plans, onClose, onExport }: ExportModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-text mb-4">Exportar Dados</h2>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              exportSessionsCSV(sessions)
              onClose()
              onExport('Histórico exportado em CSV!')
            }}
            disabled={sessions.length === 0}
            className="flex items-center gap-3 p-4 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors text-left disabled:opacity-40"
          >
            <Download size={18} className="text-emerald-400" />
            <div>
              <p className="font-semibold text-text text-sm">Histórico (CSV)</p>
              <p className="text-xs text-text-muted mt-0.5">
                Planilha com todas as séries de todas as sessões
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              exportSessionsJSON(sessions)
              onClose()
              onExport('Histórico exportado em JSON!')
            }}
            disabled={sessions.length === 0}
            className="flex items-center gap-3 p-4 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors text-left disabled:opacity-40"
          >
            <Download size={18} className="text-blue-400" />
            <div>
              <p className="font-semibold text-text text-sm">Sessões (JSON)</p>
              <p className="text-xs text-text-muted mt-0.5">
                Dados completos das sessões de treino
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              exportPlansJSON(plans)
              onClose()
              onExport('Planos exportados em JSON!')
            }}
            disabled={plans.length === 0}
            className="flex items-center gap-3 p-4 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors text-left disabled:opacity-40"
          >
            <Download size={18} className="text-purple-400" />
            <div>
              <p className="font-semibold text-text text-sm">Planos (JSON)</p>
              <p className="text-xs text-text-muted mt-0.5">
                Todos os planos de treino com exercícios
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
