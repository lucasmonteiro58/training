import { ChevronLeft } from 'lucide-react'

interface ProgressHeaderProps {
  onVoltar: () => void
}

export function ProgressHeader({ onVoltar }: ProgressHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-5 animate-fade-up">
      <button
        type="button"
        onClick={onVoltar}
        className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-text-muted"
      >
        <ChevronLeft size={20} />
      </button>
      <h1 className="text-xl font-bold text-text">Evolução de Peso</h1>
    </div>
  )
}
