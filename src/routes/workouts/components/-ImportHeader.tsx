import { ArrowLeft } from 'lucide-react'

interface ImportHeaderProps {
  onBack: () => void
  planosCount?: number
}

export function ImportHeader({ onBack, planosCount }: ImportHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6 animate-fade-up">
      <button
        type="button"
        onClick={onBack}
        className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-muted"
      >
        <ArrowLeft size={18} />
      </button>
      <h1 className="text-xl font-bold text-text">Importar CSV</h1>
      {planosCount != null && planosCount > 0 && (
        <span className="ml-auto text-xs font-medium px-2.5 py-1 rounded-full bg-accent-subtle text-accent">
          {planosCount} plano{planosCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}
