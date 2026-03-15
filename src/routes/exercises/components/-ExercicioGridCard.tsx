import { Heart } from 'lucide-react'
import type { Exercise } from '../../../types'

interface ExerciseGridCardProps {
  ex: Exercise
  isFavorite: boolean
  onSelect: () => void
  onToggleFavorite: (e: React.MouseEvent) => void
}

export function ExerciseGridCard({ ex, isFavorite, onSelect, onToggleFavorite }: ExerciseGridCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="card p-0 overflow-hidden text-left flex flex-col h-full relative"
    >
      <button
        type="button"
        onClick={onToggleFavorite}
        className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-black/60"
      >
        <Heart size={16} className={isFavorite ? 'fill-red-400 text-red-400' : 'text-white/70'} />
      </button>
      {ex.gifUrl ? (
        <img
          src={ex.gifUrl}
          alt={ex.name}
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
          <p className="text-text text-sm font-bold line-clamp-2 leading-tight">{ex.name}</p>
          <p className="text-text-muted text-xs mt-1 capitalize">{ex.muscleGroup}</p>
        </div>
      </div>
    </button>
  )
}
