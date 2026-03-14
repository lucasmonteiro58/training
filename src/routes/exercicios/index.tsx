import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo, useRef } from 'react'
import { carregarExercicios, buscarExercicios } from '../../lib/exercises/freeExerciseDb'
import type { Exercicio } from '../../types'
import { getExerciciosPersonalizados, toggleFavoritoExercicio, getFavoritoIds } from '../../lib/db/dexie'
import { useAuthStore } from '../../stores'
import { CriarExercicioModal } from '../../components/common/CriarExercicioModal'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Calculadora1RM } from '../../components/ui/Calculadora1RM'
import { ExerciciosToolbar } from './components/-ExerciciosToolbar'
import { ExercicioGridCard } from './components/-ExercicioGridCard'
import { EmptyExercicios } from './components/-EmptyExercicios'
import { ExercicioDetailModal } from './components/-ExercicioDetailModal'

export const Route = createFileRoute('/exercicios/')({
  component: ExerciciosPage,
})

function ExerciciosPage() {
  const [exercicios, setExercicios] = useState<Exercicio[]>([])
  const [filtrados, setFiltrados] = useState<Exercicio[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [grupo, setGrupo] = useState('')
  const [selecionado, setSelecionado] = useState<Exercicio | null>(null)
  const [showCriar, setShowCriar] = useState(false)
  const [show1RM, setShow1RM] = useState(false)
  const [favoritoIds, setFavoritoIds] = useState<Set<string>>(new Set())
  const [showFavoritos, setShowFavoritos] = useState(false)
  const user = useAuthStore((s) => s.user)

  const parentRef = useRef<HTMLDivElement>(null)

  const carregarTudo = async () => {
    setLoading(true)
    const base = await carregarExercicios()
    let custom: Exercicio[] = []
    if (user) {
      custom = await getExerciciosPersonalizados(user.uid)
    }
    const todos = [...custom, ...base].sort((a, b) => a.nome.localeCompare(b.nome))
    setExercicios(todos)
    setFiltrados(todos)
    const favIds = await getFavoritoIds()
    setFavoritoIds(favIds)
    setLoading(false)
  }

  useEffect(() => {
    carregarTudo()
  }, [user])

  useEffect(() => {
    let result = buscarExercicios(exercicios, query, grupo || undefined)
    if (showFavoritos) {
      result = result.filter(ex => favoritoIds.has(ex.id))
    }
    setFiltrados(result)
  }, [query, grupo, exercicios, showFavoritos, favoritoIds])

  const gruposUnicos = useMemo(() => {
    const setGrupos = new Set(exercicios.map(ex => ex.grupoMuscular).filter(Boolean))
    return Array.from(setGrupos).sort((a, b) => a.localeCompare(b))
  }, [exercicios])

  const rows = useMemo(() => {
    const r: Exercicio[][] = []
    for (let i = 0; i < filtrados.length; i += 2) {
      r.push(filtrados.slice(i, i + 2))
    }
    return r
  }, [filtrados])

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280,
    overscan: 5,
  })

  useEffect(() => {
    rowVirtualizer.scrollToOffset(0)
  }, [query, grupo, showFavoritos])

  const handleToggleFavorito = async (e: React.MouseEvent, exId: string) => {
    e.stopPropagation()
    const novoValor = !favoritoIds.has(exId)
    await toggleFavoritoExercicio(exId, novoValor)
    setFavoritoIds(prev => {
      const next = new Set(prev)
      if (novoValor) next.add(exId)
      else next.delete(exId)
      return next
    })
  }

  return (
    <>
      <div className="page-container h-[calc(100dvh-16px)] pb-0! flex flex-col pt-6 overflow-hidden">
        <ExerciciosToolbar
          query={query}
          onQueryChange={setQuery}
          grupo={grupo}
          gruposUnicos={gruposUnicos}
          onGrupoChange={setGrupo}
          showFavoritos={showFavoritos}
          onToggleFavoritos={() => setShowFavoritos(!showFavoritos)}
          favoritoCount={favoritoIds.size}
          count={filtrados.length}
          onOpenCriar={() => setShowCriar(true)}
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
            <EmptyExercicios onCriar={() => setShowCriar(true)} />
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
                    <ExercicioGridCard
                      key={ex.id}
                      ex={ex}
                      isFavorito={favoritoIds.has(ex.id)}
                      onSelect={() => setSelecionado(ex)}
                      onToggleFavorito={(e) => handleToggleFavorito(e, ex.id)}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selecionado && (
        <ExercicioDetailModal exercicio={selecionado} onClose={() => setSelecionado(null)} />
      )}

      {showCriar && (
        <CriarExercicioModal
          gruposExistentes={gruposUnicos}
          onClose={() => setShowCriar(false)}
          onSuccess={(ex) => {
            setShowCriar(false)
            setSelecionado(ex)
            carregarTudo()
          }}
        />
      )}

      {show1RM && <Calculadora1RM onClose={() => setShow1RM(false)} />}
    </>
  )
}
