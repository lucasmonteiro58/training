import { Search, Plus, Heart, Calculator } from 'lucide-react'

interface ExercisesToolbarProps {
  query: string
  onQueryChange: (v: string) => void
  group: string
  uniqueGroups: string[]
  onGroupChange: (g: string) => void
  showFavorites: boolean
  onToggleFavorites: () => void
  favoriteCount: number
  count: number
  onOpenCreate: () => void
  onOpen1RM: () => void
}

export function ExercisesToolbar({
  query,
  onQueryChange,
  group,
  uniqueGroups,
  onGroupChange,
  showFavorites,
  onToggleFavorites,
  favoriteCount,
  count,
  onOpenCreate,
  onOpen1RM,
}: ExercisesToolbarProps) {
  return (
    <div className="shrink-0 mb-4 h-auto">
      <h1 className="text-2xl font-bold text-text mb-4 animate-fade-up">Exercícios</h1>

      <div className="relative mb-3 animate-fade-up" style={{ animationDelay: '50ms' }}>
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle" />
        <input
          className="input pl-10!"
          placeholder="Buscar por nome ou músculo..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-3 mb-1 animate-fade-up scrollbar-hide"
        style={{ animationDelay: '100ms' }}
      >
        <button
          onClick={onToggleFavorites}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
            showFavorites
              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
              : 'bg-surface-2 text-text-muted border border-border'
          }`}
        >
          <Heart size={12} className={showFavorites ? 'fill-red-400' : ''} />
          Favoritos{favoriteCount > 0 ? ` (${favoriteCount})` : ''}
        </button>
        {['', ...uniqueGroups].map((g) => (
          <button
            key={g}
            onClick={() => onGroupChange(g)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
              group === g ? 'bg-accent text-white' : 'bg-surface-2 text-text-muted border border-border'
            }`}
          >
            {g || 'Todos'}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3 animate-fade-up" style={{ animationDelay: '150ms' }}>
        <p className="text-xs text-text-muted">{count} exercícios</p>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpen1RM}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-muted bg-surface-2 px-3 py-1.5 rounded-full border border-border hover:text-accent hover:border-accent /30 transition-colors"
          >
            <Calculator size={14} />
            1RM
          </button>
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-full"
          >
            <Plus size={14} />
            Criar
          </button>
        </div>
      </div>
    </div>
  )
}
