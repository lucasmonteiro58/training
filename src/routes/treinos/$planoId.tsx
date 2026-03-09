import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { usePlanos } from '../../hooks/usePlanos'
import { ArrowLeft, Dumbbell, Play, Edit2, Plus, Clock, Trash2, GripVertical, ChevronDown } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import type { ExercicioNoPlano, PlanoDeTreino, SeriePlano } from '../../types'
import { ExercicioPicker } from '../../components/exercicios/ExercicioPicker'

export const Route = createFileRoute('/treinos/$planoId')({
  component: PlanoDetalheComponent,
})

function PlanoDetalheComponent() {
  const { planoId } = Route.useParams()
  const navigate = useNavigate()
  const { planos, atualizarPlano, excluirPlano } = usePlanos()
  const plano = planos.find((p) => p.id === planoId)
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState(plano?.nome ?? '')
  const [showPicker, setShowPicker] = useState(false)
  const [exerciciosEdit, setExerciciosEdit] = useState<ExercicioNoPlano[]>(plano?.exercicios ?? [])
  const [expandedEx, setExpandedEx] = useState<Set<string>>(new Set())

  if (!plano) {
    return (
      <div className="page-container pt-6 text-center">
        <p className="text-[var(--color-text-muted)]">Plano não encontrado.</p>
        <Link to="/treinos" className="text-[var(--color-accent)] text-sm mt-2 block">Voltar</Link>
      </div>
    )
  }

  const salvarEdicao = async () => {
    await atualizarPlano({ ...plano, nome, exercicios: exerciciosEdit })
    setEditando(false)
  }

  const adicionarEx = (ex: any) => {
    setExerciciosEdit((prev) => [
      ...prev,
      { id: uuidv4(), exercicioId: ex.id, exercicio: ex, series: 3, repeticoesMeta: 10, pesoMeta: 0, descansoSegundos: 60, ordem: prev.length, seriesDetalhadas: [{ peso: 0, repeticoes: 10 }, { peso: 0, repeticoes: 10 }, { peso: 0, repeticoes: 10 }] },
    ])
  }

  const removerEx = (id: string) => setExerciciosEdit((p) => p.filter((e) => e.id !== id))

  const atualizarSerieEdit = (exId: string, sIdx: number, campo: Partial<SeriePlano>) => {
    setExerciciosEdit((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex
        const base = ex.seriesDetalhadas ?? Array.from({ length: ex.series }, () => ({ peso: ex.pesoMeta ?? 0, repeticoes: ex.repeticoesMeta }))
        const novas = base.map((s, i) => (i === sIdx ? { ...s, ...campo } : s))
        return { ...ex, seriesDetalhadas: novas }
      })
    )
  }

  const toggleExpandedEx = (id: string) =>
    setExpandedEx((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <>
      <div className="page-container pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-fade-up">
          <button onClick={() => navigate({ to: '/treinos' })}
            className="w-10 h-10 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-muted)]">
            <ArrowLeft size={18} />
          </button>
          {editando ? (
            <input className="input flex-1 text-lg font-bold py-2" value={nome} onChange={(e) => setNome(e.target.value)} />
          ) : (
            <h1 className="text-xl font-bold text-[var(--color-text)] flex-1">{plano.nome}</h1>
          )}
          {editando ? (
            <button onClick={salvarEdicao} className="btn-primary py-2 px-4 text-sm">Salvar</button>
          ) : (
            <button onClick={() => { setEditando(true); setNome(plano.nome); setExerciciosEdit(plano.exercicios) }}
              className="btn-ghost p-2.5">
              <Edit2 size={16} />
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-6 animate-fade-up" style={{ animationDelay: '50ms' }}>
          {[
            { label: 'Exercícios', value: plano.exercicios.length, icon: Dumbbell },
            { label: 'Séries tot.', value: plano.exercicios.reduce((s, e) => s + e.series, 0), icon: null },
            { label: 'Descanso', value: `${plano.exercicios[0]?.descansoSegundos ?? '-'}s`, icon: Clock },
          ].map((stat, i) => (
            <div key={i} className="card p-3 text-center">
              <p className="text-lg font-bold text-[var(--color-text)]">{stat.value}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Start button */}
        <Link to="/treino-ativo/$planoId" params={{ planoId }} style={{ textDecoration: 'none' }}>
          <button className="btn-primary w-full mb-6 py-4 text-base animate-fade-up" style={{ animationDelay: '100ms' }}>
            <Play size={20} />
            Iniciar Treino
          </button>
        </Link>

        {/* Exercises list */}
        <div className="animate-fade-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[var(--color-text)]">
              EXERCÍCIOS
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            {(editando ? exerciciosEdit : plano.exercicios).map((ex) => {
              const isExpanded = editando && expandedEx.has(ex.id)
              const seriesEdit = isExpanded
                ? (ex.seriesDetalhadas ?? Array.from({ length: ex.series }, () => ({ peso: ex.pesoMeta ?? 0, repeticoes: ex.repeticoesMeta })))
                : []
              return (
                <div key={ex.id} className="card p-3">
                  <div className="flex items-center gap-3">
                    {editando && <GripVertical size={16} className="text-[var(--color-text-subtle)]" />}
                    {ex.exercicio.gifUrl ? (
                      <img src={ex.exercicio.gifUrl} alt={ex.exercicio.nome}
                        className="w-12 h-12 rounded-xl object-cover bg-[var(--color-surface-2)] flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">💪</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--color-text)] font-semibold text-sm truncate">{ex.exercicio.nome}</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-[var(--color-text-muted)]">{ex.series} séries</span>
                        <span className="text-xs text-[var(--color-text-muted)]">{ex.repeticoesMeta} reps</span>
                        {ex.pesoMeta ? <span className="text-xs text-[var(--color-text-muted)]">{ex.pesoMeta}kg</span> : null}
                        <span className="text-xs text-[var(--color-text-muted)]">⏱ {ex.descansoSegundos}s</span>
                      </div>
                    </div>
                    {editando ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleExpandedEx(ex.id)}
                          className="btn-ghost p-2 text-[var(--color-text-subtle)]"
                          title="Editar séries"
                        >
                          <ChevronDown size={15} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        <button onClick={() => removerEx(ex.id)} className="btn-ghost p-2 text-[var(--color-danger)]">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ) : null}
                  </div>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-[var(--color-border)] space-y-2">
                      <div className="grid grid-cols-[30px_1fr_1fr] gap-2 px-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-subtle)]">
                        <span className="text-center">#</span>
                        <span className="text-center">Peso (kg)</span>
                        <span className="text-center">Reps</span>
                      </div>
                      {seriesEdit.map((s, i) => (
                        <div key={i} className="grid grid-cols-[30px_1fr_1fr] gap-2 items-center bg-[var(--color-surface-2)]/50 px-1 py-1 rounded-lg">
                          <span className="text-[11px] font-bold text-[var(--color-text-muted)] text-center">{i + 1}</span>
                          <input
                            type="number"
                            className="set-input h-9! py-0! text-sm!"
                            value={s.peso === 0 ? '' : s.peso}
                            onChange={(e) => atualizarSerieEdit(ex.id, i, { peso: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                            onFocus={(e) => e.target.select()}
                            placeholder="0"
                          />
                          <input
                            type="number"
                            className="set-input h-9! py-0! text-sm!"
                            value={s.repeticoes === 0 ? '' : s.repeticoes}
                            onChange={(e) => atualizarSerieEdit(ex.id, i, { repeticoes: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                            onFocus={(e) => e.target.select()}
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {editando && (
            <button onClick={() => setShowPicker(true)}
              className="mt-3 w-full py-4 rounded-2xl border-2 border-dashed border-[var(--color-border-strong)] text-[var(--color-text-muted)] flex items-center justify-center gap-2 text-sm font-medium hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors">
              <Plus size={18} /> Adicionar Exercício
            </button>
          )}
        </div>

        {/* Danger zone */}
        {!editando && (
          <div className="mt-8 mb-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <button
              onClick={async () => {
                if (confirm(`Excluir "${plano.nome}"?`)) {
                  await excluirPlano(plano.id)
                  navigate({ to: '/treinos' })
                }
              }}
              className="btn-danger w-full"
            >
              <Trash2 size={16} />
              Excluir Plano
            </button>
          </div>
        )}
      </div>

      {showPicker && (
        <ExercicioPicker onSelect={(ex) => { adicionarEx(ex); setShowPicker(false) }} onClose={() => setShowPicker(false)} />
      )}
    </>
  )
}
