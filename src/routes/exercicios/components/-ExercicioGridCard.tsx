import { Heart } from 'lucide-react'
import type { Exercicio } from '../../../types'

interface ExercicioGridCardProps {
  ex: Exercicio
  isFavorito: boolean
  onSelect: () => void
  onToggleFavorito: (e: React.MouseEvent) => void
}

export function ExercicioGridCard({ ex, isFavorito, onSelect, onToggleFavorito }: ExercicioGridCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="card p-0 overflow-hidden text-left flex flex-col h-full relative"
    >
      <button
        type="button"
        onClick={onToggleFavorito}
        className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-black/60"
      >
        <Heart size={16} className={isFavorito ? 'fill-red-400 text-red-400' : 'text-white/70'} />
      </button>
      {ex.gifUrl ? (
        <img
          src={ex.gifUrl}
          alt={ex.nome}
          className="w-full aspect-square object-cover bg-surface-2"
          loading="lazy"
        />
      ) : (
        <div className="w-full aspect-square bg-surface-2 flex items-center justify-center">
          <span className="text-4xl">💪</span>
        </div>
      )}
      <div className="p-3 pb-4 flex flex-col gap-1 min-h-0">
        <div className="flex-1 min-w-0">
          <p className="text-text text-sm font-bold line-clamp-2 leading-tight">{ex.nome}</p>
          <p className="text-text-muted text-xs mt-1 capitalize">{ex.grupoMuscular}</p>
        </div>
      </div>
    </button>
  )
}
