import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { usePlanos } from '../../hooks/usePlanos'
import { ArrowLeft, Plus, Trash2, GripVertical, ChevronDown } from 'lucide-react'
import type { ExercicioNoPlano } from '../../types'
import { CORES_PLANO } from '../../types'
import { ExercicioPicker } from '../../components/exercicios/ExercicioPicker'

export const Route = createFileRoute('/treinos/novo')({
  component: NovoPlanoPage,
})

function NovoPlanoPage() {
  const navigate = useNavigate()
  const { criarPlano, atualizarPlano } = usePlanos()
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [exercicios, setExercicios] = useState<ExercicioNoPlano[]>([])
  const [saving, setSaving] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [corSelecionada, setCorSelecionada] = useState(CORES_PLANO[0])

  const adicionarExercicio = (ex: ExercicioNoPlano) => {
    setExercicios((prev) => [...prev, { ...ex, ordem: prev.length }])
  }

  const removerExercicio = (id: string) => {
    setExercicios((prev) => prev.filter((e) => e.id !== id))
  }

  const atualizarExercicio = (id: string, campo: Partial<ExercicioNoPlano>) => {
    setExercicios((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...campo } : e))
    )
  }

  const salvar = async () => {
    if (!nome.trim()) return
    setSaving(true)
    try {
      const plano = await criarPlano(nome.trim(), descricao.trim() || undefined)
      await atualizarPlano({ ...plano, exercicios, cor: corSelecionada })
      navigate({ to: '/treinos' })
    } catch (e) {
      alert('Erro ao salvar plano')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="page-container pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate({ to: '/treinos' })}
            className="w-10 h-10 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-[var(--color-text)]">Novo Plano</h1>
          <div className="ml-auto">
            <button
              onClick={salvar}
              disabled={!nome.trim() || saving}
              className="btn-primary py-2.5 px-5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        {/* Plan Details */}
        <div className="card p-4 mb-4 animate-fade-up">
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-[var(--color-text-muted)] font-medium mb-1.5 block">
                NOME DO PLANO *
              </label>
              <input
                className="input"
                placeholder="Ex: Treino A – Peito e Tríceps"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                maxLength={60}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] font-medium mb-1.5 block">
                DESCRIÇÃO (opcional)
              </label>
              <textarea
                className="input resize-none"
                placeholder="Ex: Foco em hipertrofia..."
                rows={2}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            {/* Color */}
            <div>
              <label className="text-xs text-[var(--color-text-muted)] font-medium mb-1.5 block">
                COR
              </label>
              <div className="flex gap-2 flex-wrap">
                {CORES_PLANO.map((cor) => (
                  <button
                    key={cor}
                    className={`w-8 h-8 rounded-full transition-transform ${corSelecionada === cor ? 'scale-105 ring-2 ring-offset-2 ring-offset-[var(--color-surface)] ring-white' : 'opacity-60 hover:opacity-100 hover:scale-110'}`}
                    style={{ background: cor }}
                    onClick={() => setCorSelecionada(cor)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Exercícios */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[var(--color-text)]">
              EXERCÍCIOS ({exercicios.length})
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            {exercicios.map((ex, idx) => (
              <ExercicioNoPlanoCard
                key={ex.id}
                exercicio={ex}
                onUpdate={(campo) => atualizarExercicio(ex.id, campo)}
                onRemove={() => removerExercicio(ex.id)}
              />
            ))}
          </div>

          <button
            onClick={() => setShowPicker(true)}
            className="mt-3 w-full py-4 rounded-2xl border-2 border-dashed border-[var(--color-border-strong)] text-[var(--color-text-muted)] flex items-center justify-center gap-2 text-sm font-medium hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
          >
            <Plus size={18} />
            Adicionar Exercício
          </button>
        </div>
      </div>

      {showPicker && (
        <ExercicioPicker
          onSelect={(ex) => {
            adicionarExercicio({
              id: uuidv4(),
              exercicioId: ex.id,
              exercicio: ex,
              series: 3,
              repeticoesMeta: 10,
              pesoMeta: 0,
              descansoSegundos: 60,
              ordem: exercicios.length,
            })
            setShowPicker(false)
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  )
}

// ============================================================
// ExercicioNoPlanoCard
// ============================================================
function ExercicioNoPlanoCard({
  exercicio,
  onUpdate,
  onRemove,
}: {
  exercicio: ExercicioNoPlano
  onUpdate: (campo: Partial<ExercicioNoPlano>) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card p-3 animate-scale-in">
      <div className="flex items-center gap-3">
        <GripVertical size={16} className="text-[var(--color-text-subtle)] flex-shrink-0" />
        {exercicio.exercicio.gifUrl ? (
          <img
            src={exercicio.exercicio.gifUrl}
            alt={exercicio.exercicio.nome}
            className="w-10 h-10 rounded-lg object-cover bg-[var(--color-surface-2)]"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center">
            <span className="text-lg">💪</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[var(--color-text)] font-semibold text-sm truncate">
            {exercicio.exercicio.nome}
          </p>
          <p className="text-[var(--color-text-muted)] text-xs">
            {exercicio.series}x{exercicio.repeticoesMeta}{exercicio.pesoMeta ? ` · ${exercicio.pesoMeta}kg` : ''}
          </p>
        </div>
        <button onClick={() => setExpanded((e) => !e)} className="btn-ghost p-2">
          <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        <button onClick={onRemove} className="btn-ghost p-2 text-[var(--color-danger)]">
          <Trash2 size={15} />
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-[var(--color-border)] grid grid-cols-2 gap-2">
          {[
            { label: 'Séries', key: 'series', suffix: '' },
            { label: 'Repetições', key: 'repeticoesMeta', suffix: '' },
            { label: 'Peso (kg)', key: 'pesoMeta', suffix: '' },
            { label: 'Descanso (s)', key: 'descansoSegundos', suffix: '' },
          ].map(({ label, key, suffix }) => (
            <div key={key}>
              <label className="text-[9px] text-[var(--color-text-subtle)] font-semibold uppercase block mb-1">
                {label}
              </label>
              <input
                type="number"
                className="set-input w-full px-3 py-2 text-sm"
                value={(exercicio as any)[key]}
                onChange={(e) =>
                  onUpdate({ [key]: parseFloat(e.target.value) || 0 } as any)
                }
                min={0}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
