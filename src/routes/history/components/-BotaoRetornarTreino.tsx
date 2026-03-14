import { RotateCcw } from 'lucide-react'

interface BotaoRetornarTreinoProps {
  onClick: () => void
}

export function BotaoRetornarTreino({ onClick }: BotaoRetornarTreinoProps) {
  return (
    <div className="mb-5 animate-fade-up" style={{ animationDelay: '110ms' }}>
      <button
        type="button"
        onClick={onClick}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 bg-accent/15 text-accent font-semibold text-sm"
      >
        <RotateCcw size={16} /> Retornar como treino ativo
      </button>
    </div>
  )
}
