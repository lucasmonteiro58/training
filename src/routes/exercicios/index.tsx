import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { carregarExercicios, buscarExercicios } from '../../lib/exercises/freeExerciseDb'
import type { Exercicio } from '../../types'
import { Search, Plus } from 'lucide-react'
import { getExerciciosPersonalizados } from '../../lib/db/dexie'
import { useAuthStore } from '../../stores'
import { CriarExercicioModal } from '../../components/exercicios/CriarExercicioModal'

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
  const user = useAuthStore((s) => s.user)

  const carregarTudo = async () => {
    setLoading(true)
    const base = await carregarExercicios()
    let custom: Exercicio[] = []
    if (user) {
      custom = await getExerciciosPersonalizados(user.uid)
    }
    const todos = [...custom, ...base]
    setExercicios(todos)
    setFiltrados(todos)
    setLoading(false)
  }

  useEffect(() => {
    carregarTudo()
  }, [user])

  useEffect(() => {
    setFiltrados(buscarExercicios(exercicios, query, grupo || undefined))
  }, [query, grupo, exercicios])

  const gruposUnicos = useMemo(() => {
    const setGrupos = new Set(exercicios.map(ex => ex.grupoMuscular).filter(Boolean))
    return Array.from(setGrupos).sort((a, b) => a.localeCompare(b))
  }, [exercicios])

  return (
    <>
      <div className="page-container pt-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4 animate-fade-up">
          Exercícios
        </h1>

        {/* Search */}
        <div className="relative mb-3 animate-fade-up" style={{ animationDelay: '50ms' }}>
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input className="input !pl-10" placeholder="Buscar por nome ou músculo..."
            value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        {/* Grupos */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 animate-fade-up scrollbar-hide" style={{ animationDelay: '100ms' }}>
          {['', ...gruposUnicos].map((g) => (
            <button key={g}
              onClick={() => setGrupo(g)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                grupo === g
                  ? 'bg-accent text-white'
                  : 'bg-surface-2 text-text-muted border border-border'
              }`}>
              {g || 'Todos'}
            </button>
          ))}
        </div>

        {/* count & action */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-text-muted">{filtrados.length} exercícios</p>
          <button
            onClick={() => setShowCriar(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-full"
          >
            <Plus size={14} />
            Criar
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtrados.map((ex, idx) => (
              <button key={ex.id} onClick={() => setSelecionado(ex)}
                className="card p-0 overflow-hidden text-left animate-fade-up"
                style={{ animationDelay: `${(idx % 6) * 40}ms` }}>
                {ex.gifUrl ? (
                  <img src={ex.gifUrl} alt={ex.nome}
                    className="w-full aspect-square object-contain bg-surface-2" loading="lazy" />
                ) : (
                  <div className="w-full aspect-square bg-surface-2 flex items-center justify-center">
                    <span className="text-4xl">💪</span>
                  </div>
                )}
                <div className="p-2.5 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-text text-sm font-medium truncate">
                      {ex.nome}
                    </p>
                    <p className="text-text-muted text-xs mt-0.5">
                      {ex.grupoMuscular}
                      {ex.equipamento ? ` · ${ex.equipamento}` : ''}
                    </p>
                  </div>
                  <Plus size={18} className="text-accent shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selecionado && (
        <div className="modal-overlay" onClick={() => setSelecionado(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
              </div>
              <button onClick={() => setSelecionado(null)} className="btn-ghost p-2 text-[var(--color-text-muted)]">✕</button>
            </div>
            {selecionado.gifUrl && (
              <img src={selecionado.gifUrl} alt={selecionado.nome}
                className="w-full max-h-56 object-contain rounded-xl bg-[var(--color-surface-2)] mb-4" />
            )}
            {selecionado.equipamento && (
              <p className="text-xs text-[var(--color-text-muted)] mb-2">
                <span className="font-semibold">Equipamento:</span> {selecionado.equipamento}
              </p>
            )}
            {selecionado.instrucoes && selecionado.instrucoes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">INSTRUÇÕES</p>
                <ol className="list-decimal list-inside space-y-1.5">
                  {selecionado.instrucoes.map((inst, i) => (
                    <li key={i} className="text-xs text-[var(--color-text-muted)] leading-relaxed">{inst}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {/* modal criar */}
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
    </>
  )
}
