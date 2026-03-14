import { Download } from 'lucide-react'
import type { SessaoDeTreino } from '../../../types'
import type { PlanoDeTreino } from '../../../types'
import { exportarSessoesCSV, exportarSessoesJSON, exportarPlanosJSON } from '../../../lib/exportar'

interface ExportModalProps {
  sessoes: SessaoDeTreino[]
  planos: PlanoDeTreino[]
  onClose: () => void
  onExport: (message: string) => void
}

export function ExportModal({ sessoes, planos, onClose, onExport }: ExportModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-text mb-4">Exportar Dados</h2>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              exportarSessoesCSV(sessoes)
              onClose()
              onExport('Histórico exportado em CSV!')
            }}
            disabled={sessoes.length === 0}
            className="flex items-center gap-3 p-4 rounded-xl bg-surface-2 hover:bg-[var(--color-surface-3)] transition-colors text-left disabled:opacity-40"
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
              exportarSessoesJSON(sessoes)
              onClose()
              onExport('Histórico exportado em JSON!')
            }}
            disabled={sessoes.length === 0}
            className="flex items-center gap-3 p-4 rounded-xl bg-surface-2 hover:bg-[var(--color-surface-3)] transition-colors text-left disabled:opacity-40"
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
              exportarPlanosJSON(planos)
              onClose()
              onExport('Planos exportados em JSON!')
            }}
            disabled={planos.length === 0}
            className="flex items-center gap-3 p-4 rounded-xl bg-surface-2 hover:bg-[var(--color-surface-3)] transition-colors text-left disabled:opacity-40"
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
