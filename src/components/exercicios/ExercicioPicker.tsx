import { useState, useEffect, useMemo, useRef } from 'react'
import { carregarExercicios, buscarExercicios } from '../../lib/exercises/freeExerciseDb'
import type { Exercicio } from '../../types'
import { Search, X, Plus } from 'lucide-react'
import { getExerciciosPersonalizados } from '../../lib/db/dexie'
import { useAuthStore } from '../../stores'
import { CriarExercicioModal } from './CriarExercicioModal'
import { useVirtualizer } from '@tanstack/react-virtual'

interface ExercicioPicker {
  onSelect: (ex: Exercicio) => void
  onClose: () => void
}

export function ExercicioPicker({ onSelect, onClose }: ExercicioPicker) {
  const user = useAuthStore((s) => s.user)
  const [exercicios, setExercicios] = useState<Exercicio[]>([])
  const [filtrados, setFiltrados] = useState<Exercicio[]>([])
  const [query, setQuery] = useState('')
  const [grupo, setGrupo] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCriar, setShowCriar] = useState(false)

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
    setLoading(false)
  }

  useEffect(() => {
    carregarTudo()
  }, [user])

  useEffect(() => {
    const result = buscarExercicios(exercicios, query, grupo || undefined)
    setFiltrados(result)
  }, [query, grupo, exercicios])

  const gruposUnicos = useMemo(() => {
    const setGrupos = new Set(exercicios.map(ex => ex.grupoMuscular).filter(Boolean))
    return Array.from(setGrupos).sort((a, b) => a.localeCompare(b))
  }, [exercicios])

  const rowVirtualizer = useVirtualizer({
    count: filtrados.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 84,
    overscan: 10,
  })

  useEffect(() => {
    rowVirtualizer.scrollToOffset(0)
  }, [query, grupo])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-h-[88dvh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg font-bold text-text">Adicionar Exercício</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowCriar(true)}
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
            autoFocus
          />
        </div>

        {/* Grupo filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide shrink-0 items-center min-h-[40px]">
          <button
            onClick={() => setGrupo('')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap capitalize ${
              grupo === ''
                ? 'bg-accent text-white'
                : 'bg-surface-2 text-text-muted'
            }`}
          >
            Todos
          </button>
          {gruposUnicos.map((g) => (
            <button
              key={g}
              onClick={() => setGrupo(g)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap capitalize ${
                grupo === g
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
          ) : filtrados.length === 0 ? (
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
                const ex = filtrados[virtualRow.index]
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
                    <button
                      onClick={() => onSelect(ex)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors text-left w-full h-full min-w-0"
                    >
                      {ex.gifUrl ? (
                        <img
                          src={ex.gifUrl}
                          alt={ex.nome}
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
                          {ex.nome}
                        </p>
                        <p className="text-text-muted text-xs mt-0.5">
                          {ex.grupoMuscular}
                          {ex.equipamento ? ` · ${ex.equipamento}` : ''}
                        </p>
                      </div>
                      <Plus size={18} className="text-accent shrink-0" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showCriar && (
        <CriarExercicioModal
          gruposExistentes={gruposUnicos}
          onClose={() => setShowCriar(false)}
          onSuccess={(ex) => {
            setShowCriar(false)
            onSelect(ex)
          }}
        />
      )}
    </div>
  )
}
