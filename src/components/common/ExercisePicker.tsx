import { useState, useEffect, useMemo, useRef } from 'react'
import { loadExercises, searchExercises } from '../../lib/exercises/freeExerciseDb'
import type { Exercise } from '../../types'
import { Search, X, Plus, Heart } from 'lucide-react'
import { getPersonalizedExercises, getFavoriteIds, toggleExerciseFavorite } from '../../lib/db/dexie'
import { useAuthStore } from '../../stores'
import { CreateExerciseModal } from './CreateExerciseModal'
import { useVirtualizer } from '@tanstack/react-virtual'

interface ExercisePickerProps {
  onSelect: (ex: Exercise) => void
  onClose: () => void
}

export function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const user = useAuthStore((s) => s.user)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filtered, setFiltered] = useState<Exercise[]>([])
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [showFavorites, setShowFavorites] = useState(false)

  const parentRef = useRef<HTMLDivElement>(null)

  const loadAll = async () => {
    setLoading(true)
    const base = await loadExercises()
    let custom: Exercise[] = []
    if (user) {
      custom = await getPersonalizedExercises(user.uid)
    }
    const all = [...custom, ...base].sort((a, b) => a.name.localeCompare(b.name))
    setExercises(all)
    setFiltered(all)
    const favIds = await getFavoriteIds()
    setFavoriteIds(favIds)
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [user])

  useEffect(() => {
    let result = searchExercises(exercises, query, group || undefined)
    if (showFavorites) {
      result = result.filter(ex => favoriteIds.has(ex.id))
    }
    setFiltered(result)
  }, [query, group, exercises, showFavorites, favoriteIds])

  const uniqueGroups = useMemo(() => {
    const groupSet = new Set(exercises.map(ex => ex.muscleGroup).filter(Boolean))
    return Array.from(groupSet).sort((a, b) => a.localeCompare(b))
  }, [exercises])

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 84,
    overscan: 10,
  })

  useEffect(() => {
    rowVirtualizer.scrollToOffset(0)
  }, [query, group, showFavorites])

  const handleToggleFavorite = async (e: React.MouseEvent, exId: string) => {
    e.stopPropagation()
    const newValue = !favoriteIds.has(exId)
    await toggleExerciseFavorite(exId, newValue)
    setFavoriteIds(prev => {
      const next = new Set(prev)
      if (newValue) next.add(exId)
      else next.delete(exId)
      return next
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-h-[75dvh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg font-bold text-text">Adicionar Exercício</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowCreate(true)}
              className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-bold hover:bg-accent/20 transition-colors"
            >
              Novo
            </button>
            <button onClick={onClose} className="btn-ghost p-2">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3 shrink-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            className="input pl-10!"
            placeholder="Buscar exercício..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Group filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide shrink-0 items-center min-h-[40px]">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              showFavorites
                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                : 'bg-surface-2 text-text-muted'
            }`}
          >
            <Heart size={11} className={showFavorites ? 'fill-red-400' : ''} />
            Favoritos
          </button>
          <button
            onClick={() => setGroup('')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap capitalize ${
              group === ''
                ? 'bg-accent text-white'
                : 'bg-surface-2 text-text-muted'
            }`}
          >
            Todos
          </button>
          {uniqueGroups.map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap capitalize ${
                group === g
                  ? 'bg-accent text-white'
                  : 'bg-surface-2 text-text-muted'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-1 overflow-x-hidden" ref={parentRef}>
          {loading ? (
            <div className="flex flex-col gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-text-muted py-8 text-sm">
              Nenhum exercício encontrado
            </p>
          ) : (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const ex = filtered[virtualRow.index]
                return (
                  <div
                    key={virtualRow.key}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                      display: 'flex',
                      paddingBottom: '8px'
                    }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelect(ex)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onSelect(ex)
                        }
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors text-left w-full h-full min-w-0 cursor-pointer"
                    >
                      {ex.gifUrl ? (
                        <img
                          src={ex.gifUrl}
                          alt={ex.name}
                          className="w-12 h-12 rounded-lg object-cover bg-surface-3 shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-surface-3 flex items-center justify-center shrink-0">
                          <span className="text-2xl">💪</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-text text-sm font-medium line-clamp-2">
                          {ex.name}
                        </p>
                        <p className="text-text-muted text-xs mt-0.5">
                          {ex.muscleGroup}
                          {ex.equipment ? ` · ${ex.equipment}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleToggleFavorite(e, ex.id)}
                          className="p-1.5 rounded-lg hover:bg-surface-3 transition-colors"
                          aria-label={favoriteIds.has(ex.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        >
                          <Heart size={16} className={favoriteIds.has(ex.id) ? 'fill-red-400 text-red-400' : 'text-text-subtle'} />
                        </button>
                        <Plus size={18} className="text-accent" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateExerciseModal
          existingGroups={uniqueGroups}
          onClose={() => setShowCreate(false)}
          onSuccess={(ex) => {
            setShowCreate(false)
            onSelect(ex)
          }}
        />
      )}
    </div>
  )
}
