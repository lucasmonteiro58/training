import { useState, useEffect } from 'react'
import { carregarExercicios, buscarExercicios } from '../../lib/exercises/freeExerciseDb'
import type { Exercicio } from '../../types'
import { GRUPOS_MUSCULARES } from '../../types'
import { Search, X, Plus } from 'lucide-react'

interface ExercicioPicker {
  onSelect: (ex: Exercicio) => void
  onClose: () => void
}

export function ExercicioPicker({ onSelect, onClose }: ExercicioPicker) {
  const [exercicios, setExercicios] = useState<Exercicio[]>([])
  const [filtrados, setFiltrados] = useState<Exercicio[]>([])
  const [query, setQuery] = useState('')
  const [grupo, setGrupo] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarExercicios().then((data) => {
      setExercicios(data)
      setFiltrados(data.slice(0, 30))
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const result = buscarExercicios(exercicios, query, grupo || undefined)
    setFiltrados(result.slice(0, 50))
  }, [query, grupo, exercicios])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-h-[85dvh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Adicionar Exercício</h2>
          <button onClick={onClose} className="btn-ghost p-2">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]" />
          <input
            className="input pl-10"
            placeholder="Buscar exercício..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Grupo filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
          <button
            onClick={() => setGrupo('')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              grupo === ''
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
            }`}
          >
            Todos
          </button>
          {GRUPOS_MUSCULARES.slice(0, 10).map((g) => (
            <button
              key={g}
              onClick={() => setGrupo(g)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                grupo === g
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto -mx-4 px-4">
          {loading ? (
            <div className="flex flex-col gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-xl" />
              ))}
            </div>
          ) : filtrados.length === 0 ? (
            <p className="text-center text-[var(--color-text-muted)] py-8 text-sm">
              Nenhum exercício encontrado
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {filtrados.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => onSelect(ex)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] transition-colors text-left w-full"
                >
                  {ex.gifUrl ? (
                    <img
                      src={ex.gifUrl}
                      alt={ex.nome}
                      className="w-12 h-12 rounded-lg object-cover bg-[var(--color-surface-3)] flex-shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[var(--color-surface-3)] flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">💪</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--color-text)] text-sm font-medium truncate">
                      {ex.nome}
                    </p>
                    <p className="text-[var(--color-text-muted)] text-xs mt-0.5">
                      {ex.grupoMuscular}
                      {ex.equipamento ? ` · ${ex.equipamento}` : ''}
                    </p>
                  </div>
                  <Plus size={18} className="text-[var(--color-accent)] flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
