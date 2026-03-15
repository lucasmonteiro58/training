import { ArrowLeft, Filter } from 'lucide-react'

interface HistoryHeaderProps {
  hasSessions: boolean
  hasActiveFilter: boolean
  onBack: () => void
  onToggleFilters: () => void
}

export function HistoryHeader({ hasSessions, hasActiveFilter, onBack, onToggleFilters }: HistoryHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6 animate-fade-up">
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-muted shrink-0"
        aria-label="Voltar"
      >
        <ArrowLeft size={18} />
      </button>
      <h1 className="text-2xl font-bold text-text flex-1 min-w-0">Histórico</h1>
      {hasSessions && (
        <button
          onClick={() => onToggleFilters()}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            hasActiveFilter ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-text-muted'
          }`}
        >
          <Filter size={14} />
          {hasActiveFilter ? 'Filtrado' : 'Filtrar'}
        </button>
      )}
    </div>
  )
}
