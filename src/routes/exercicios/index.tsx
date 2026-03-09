import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo, useRef } from 'react'
import { carregarExercicios, buscarExercicios } from '../../lib/exercises/freeExerciseDb'
import type { Exercicio } from '../../types'
import { Search, Plus } from 'lucide-react'
import { getExerciciosPersonalizados } from '../../lib/db/dexie'
import { useAuthStore } from '../../stores'
import { CriarExercicioModal } from '../../components/exercicios/CriarExercicioModal'
import { useVirtualizer } from '@tanstack/react-virtual'

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
    setFiltrados(buscarExercicios(exercicios, query, grupo || undefined))
  }, [query, grupo, exercicios])

  const gruposUnicos = useMemo(() => {
    const setGrupos = new Set(exercicios.map(ex => ex.grupoMuscular).filter(Boolean))
    return Array.from(setGrupos).sort((a, b) => a.localeCompare(b))
  }, [exercicios])

  const rows = useMemo(() => {
    const r = []
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
  }, [query, grupo])

  return (
    <>
      <div className="page-container h-[calc(100dvh-16px)] pb-0! flex flex-col pt-6 overflow-hidden">
        <div className="shrink-0 mb-4 h-auto">
          <h1 className="text-2xl font-bold text-text mb-4 animate-fade-up">
            Exercícios
          </h1>

          {/* Search */}
          <div className="relative mb-3 animate-fade-up" style={{ animationDelay: '50ms' }}>
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input className="input pl-10!" placeholder="Buscar por nome ou músculo..."
              value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          {/* Grupos */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-1 animate-fade-up scrollbar-hide" style={{ animationDelay: '100ms' }}>
            {['', ...gruposUnicos].map((g) => (
              <button key={g}
                onClick={() => setGrupo(g)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                  grupo === g
                    ? 'bg-accent text-white'
                    : 'bg-surface-2 text-text-muted border border-border'
                }`}>
                {g || 'Todos'}
              </button>
            ))}
          </div>

          {/* count & action */}
          <div className="flex items-center justify-between mb-3 animate-fade-up" style={{ animationDelay: '150ms' }}>
            <p className="text-xs text-text-muted">{filtrados.length} exercícios</p>
            <button
              onClick={() => setShowCriar(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-full"
            >
              <Plus size={14} />
              Criar
            </button>
          </div>
        </div>

        {/* Grid Virtualizado */}
        <div
          ref={parentRef}
          className="flex-1 overflow-y-auto overflow-x-hidden -mx-4 px-4 scrollbar-hide pb-24"
        >
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
            </div>
          ) : rows.length === 0 ? (
             <p className="text-center text-text-muted py-8 text-sm">Nenhum exercício encontrado</p>
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
                  key={virtualRow.index}
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
                    paddingBottom: '12px'
                  }}
                >
                  {rows[virtualRow.index].map((ex) => (
                    <button key={ex.id} onClick={() => setSelecionado(ex)}
                      className="card p-0 overflow-hidden text-left flex flex-col h-full">
                      {ex.gifUrl ? (
                        <img src={ex.gifUrl} alt={ex.nome}
                          className="w-full aspect-square object-cover bg-surface-2" loading="lazy" />
                      ) : (
                        <div className="w-full aspect-square bg-surface-2 flex items-center justify-center">
                          <span className="text-4xl">💪</span>
                        </div>
                      )}
                      <div className="p-3 pb-4 flex flex-col gap-1 min-h-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-text text-sm font-bold line-clamp-2 leading-tight">
                            {ex.nome}
                          </p>
                          <p className="text-text-muted text-xs mt-1 capitalize">
                            {ex.grupoMuscular}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selecionado && (
        <div className="modal-overlay" onClick={() => setSelecionado(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-bold text-text truncate pr-8">{selecionado.nome}</h2>
              <button onClick={() => setSelecionado(null)} className="btn-ghost p-2 text-text-muted">✕</button>
            </div>
            {selecionado.gifUrl && (
              <img src={selecionado.gifUrl} alt={selecionado.nome}
                className="w-full max-h-56 object-contain rounded-xl bg-surface-2 mb-4" />
            )}
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-1">Músculo</p>
                <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium capitalize">
                  {selecionado.grupoMuscular}
                </span>
              </div>
              {selecionado.equipamento && (
                <div>
                  <p className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-1">Equipamento</p>
                  <p className="text-sm text-text">{selecionado.equipamento}</p>
                </div>
              )}
              {selecionado.instrucoes && selecionado.instrucoes.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-1">INSTRUÇÕES</p>
                  <ol className="list-decimal list-inside space-y-1.5">
                    {selecionado.instrucoes.map((inst, i) => (
                      <li key={i} className="text-xs text-text-muted leading-relaxed">{inst}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
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
