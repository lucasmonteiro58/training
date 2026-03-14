import { ArrowLeft, Filter } from 'lucide-react'

interface HistoryHeaderProps {
  hasSessoes: boolean
  filtroAtivo: boolean
  onVoltar: () => void
  onToggleFiltros: () => void
}

export function HistoryHeader({ hasSessoes, filtroAtivo, onVoltar, onToggleFiltros }: HistoryHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6 animate-fade-up">
      <button
        onClick={onVoltar}
        className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-muted shrink-0"
        aria-label="Voltar"
      >
        <ArrowLeft size={18} />
      </button>
      <h1 className="text-2xl font-bold text-text flex-1 min-w-0">Histórico</h1>
      {hasSessoes && (
        <button
          onClick={() => onToggleFiltros()}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            filtroAtivo ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-text-muted'
          }`}
        >
          <Filter size={14} />
          {filtroAtivo ? 'Filtrado' : 'Filtrar'}
        </button>
      )}
    </div>
  )
}
