import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo, useRef } from 'react'
import { loadExercises, searchExercises } from '../../lib/exercises/freeExerciseDb'
import type { Exercise } from '../../types'
import { getPersonalizedExercises, toggleExerciseFavorite, getFavoriteIds } from '../../lib/db/dexie'
import { useAuthStore } from '../../stores'
import { CreateExerciseModal } from '../../components/common/CreateExerciseModal'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Calculadora1RM } from '../../components/ui/Calculadora1RM'
import { ExercisesToolbar } from './components/-ExercisesToolbar'
import { ExerciseGridCard } from './components/-ExercicioGridCard'
import { EmptyExercises } from './components/-EmptyExercises'
import { ExerciseDetailModal } from './components/-ExercicioDetailModal'

export const Route = createFileRoute('/exercises/')({
  component: ExercisesPage,
})

function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filtered, setFiltered] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [show1RM, setShow1RM] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [showFavorites, setShowFavorites] = useState(false)
  const user = useAuthStore((s) => s.user)

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

  const rows = useMemo(() => {
    const r: Exercise[][] = []
    for (let i = 0; i < filtered.length; i += 2) {
      r.push(filtered.slice(i, i + 2))
    }
    return r
  }, [filtered])

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280,
    overscan: 5,
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
    <>
      <div className="page-container h-[calc(100dvh-16px)] pb-0! flex flex-col pt-6 overflow-hidden">
        <ExercisesToolbar
          query={query}
          onQueryChange={setQuery}
          grupo={group}
          gruposUnicos={uniqueGroups}
          onGrupoChange={setGroup}
          showFavoritos={showFavorites}
          onToggleFavoritos={() => setShowFavorites(!showFavorites)}
          favoritoCount={favoriteIds.size}
          count={filtered.length}
          onOpenCriar={() => setShowCreate(true)}
          onOpen1RM={() => setShow1RM(true)}
        />

        <div
          ref={parentRef}
          className="flex-1 overflow-y-auto overflow-x-hidden -mx-4 px-4 scrollbar-hide"
          style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-36 rounded-2xl" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyExercises onCriar={() => setShowCreate(true)} />
          ) : (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    paddingBottom: '12px',
                  }}
                >
                  {rows[virtualRow.index].map((ex) => (
                    <ExerciseGridCard
                      key={ex.id}
                      ex={ex}
                      isFavorite={favoriteIds.has(ex.id)}
                      onSelect={() => setSelectedExercise(ex)}
                      onToggleFavorite={(e) => handleToggleFavorite(e, ex.id)}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedExercise && (
        <ExerciseDetailModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
      )}

      {showCreate && (
        <CreateExerciseModal
          existingGroups={uniqueGroups}
          onClose={() => setShowCreate(false)}
          onSuccess={(ex) => {
            setShowCreate(false)
            setSelectedExercise(ex)
            loadAll()
          }}
        />
      )}

      {show1RM && <Calculadora1RM onClose={() => setShow1RM(false)} />}
    </>
  )
}
