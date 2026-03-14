import { ChevronLeft } from 'lucide-react'

interface EvolucaoHeaderProps {
  onVoltar: () => void
}

export function EvolucaoHeader({ onVoltar }: EvolucaoHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-5 animate-fade-up">
      <button
        type="button"
        onClick={onVoltar}
        className="w-9 h-9 rounded-xl bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-text-muted)]"
      >
        <ChevronLeft size={20} />
      </button>
      <h1 className="text-xl font-bold text-[var(--color-text)]">Evolução de Peso</h1>
    </div>
  )
}
