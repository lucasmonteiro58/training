import { useState } from 'react'
import { ChevronDown, GripVertical, Plus, Trash2, RefreshCw, Unlink } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ExercicioNoPlano, SeriePlano, TipoSerie } from '../../../types'

interface ExercicioNoPlanoCardProps {
  exercicio: ExercicioNoPlano
  onUpdate: (campo: Partial<ExercicioNoPlano>) => void
  onRemove: () => void
  isSelected?: boolean
  onToggleSelect?: () => void
  showSelect?: boolean
  onRemoveFromGroup?: () => void
}

export function ExercicioNoPlanoCard({
  exercicio,
  onUpdate,
  onRemove,
  isSelected,
  onToggleSelect,
  showSelect,
  onRemoveFromGroup,
}: ExercicioNoPlanoCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [applyAll, setApplyAll] = useState<{
    field: 'peso' | 'repeticoes'
    sIdx: number
    value: number
  } | null>(null)
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: exercicio.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  const series = exercicio.seriesDetalhadas || []

  const addSerie = () => {
    const ultima = series[series.length - 1]
    const nova = ultima ? { ...ultima } : { peso: 0, repeticoes: 10 }
    const novasSeries = [...series, nova]
    onUpdate({ series: novasSeries.length, seriesDetalhadas: novasSeries })
  }

  const removeSerie = (idx: number) => {
    const novasSeries = series.filter((_, i: number) => i !== idx)
    onUpdate({ series: novasSeries.length, seriesDetalhadas: novasSeries })
  }

  const updateSerie = (idx: number, campo: Partial<SeriePlano>) => {
    const novasSeries = series.map((s: SeriePlano, i: number) =>
      i === idx ? { ...s, ...campo } : s
    )
    onUpdate({ seriesDetalhadas: novasSeries })
    if (series.length > 1) {
      if ('peso' in campo && campo.peso !== undefined) {
        setApplyAll({ field: 'peso', sIdx: idx, value: campo.peso as number })
      } else if ('repeticoes' in campo && campo.repeticoes !== undefined) {
        setApplyAll({ field: 'repeticoes', sIdx: idx, value: campo.repeticoes as number })
      }
    }
  }

  const tipo = exercicio.tipoSerie ?? 'reps'
  const ciclo: TipoSerie[] = ['reps', 'tempo', 'falha']
  const proximo = ciclo[(ciclo.indexOf(tipo) + 1) % ciclo.length]
  const labels: Record<TipoSerie, string> = { reps: 'REPS', tempo: 'MIN', falha: 'FALHA ⚡' }
  const nextLabels: Record<TipoSerie, string> = { reps: 'Min', tempo: 'Falha', falha: 'Reps' }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card p-3 transition-opacity ${isDragging ? 'opacity-50' : 'animate-scale-in'}`}
    >
      <div className="flex items-center gap-3">
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 touch-none select-none"
        >
          <GripVertical size={16} className="text-text-subtle shrink-0" />
        </div>
        {showSelect && !exercicio.agrupamentoId && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              onToggleSelect?.()
            }}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
              isSelected ? 'bg-accent border-accent  text-white' : 'border-border-strong'
            }`}
          >
            {isSelected && <span className="text-xs">✓</span>}
          </button>
        )}
        {exercicio.agrupamentoId && onRemoveFromGroup && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              onRemoveFromGroup()
            }}
            className="p-1 rounded-lg hover:bg-surface-2 text-text-subtle shrink-0"
            title="Remover do agrupamento"
          >
            <Unlink size={14} />
          </button>
        )}
        {exercicio.exercicio.gifUrl ? (
          <img
            src={exercicio.exercicio.gifUrl}
            alt={exercicio.exercicio.nome}
            className="w-10 h-10 rounded-lg object-cover bg-surface-2"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
            <span className="text-lg">💪</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-text font-semibold text-sm truncate">{exercicio.exercicio.nome}</p>
          <p className="text-text-muted text-xs">
            {series.length} séries {series.length > 0 && `(Meta: ${series[0].repeticoes} reps)`}
          </p>
        </div>
        <button type="button" onClick={() => setExpanded(e => !e)} className="btn-ghost p-2">
          <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        <button type="button" onClick={onRemove} className="btn-ghost p-2 text-danger">
          <Trash2 size={15} />
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 px-2 text-[10px] font-bold uppercase tracking-wider">
            <span className="text-center text-text-subtle">#</span>
            <span className="text-center text-text-subtle">PESO (KG)</span>
            <button
              type="button"
              onClick={() => {
                const updates: Partial<ExercicioNoPlano> = { tipoSerie: proximo }
                if (proximo === 'tempo') {
                  updates.seriesDetalhadas = series.map(s => ({ ...s, repeticoes: 1 }))
                }
                onUpdate(updates)
                setApplyAll(null)
              }}
              title={`Mudar para: ${nextLabels[tipo]}`}
              className={`flex items-center justify-center gap-1 rounded-md border px-1.5 py-0.5 transition-colors ${
                tipo === 'reps'
                  ? 'text-text-muted border-border hover:text-accent hover:border-accent /50'
                  : 'text-accent border-accent /40 bg-accent/10'
              }`}
            >
              {labels[tipo]}
              <RefreshCw size={8} className="opacity-60" />
            </button>
            <span />
          </div>

          <div className="flex flex-col gap-2">
            {series.map((s, i) => (
              <div
                key={i}
                className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 items-center bg-surface-2/50 p-1 rounded-lg"
              >
                <span className="text-[11px] font-bold text-text-muted text-center">{i + 1}</span>
                <input
                  type="number"
                  className="set-input h-9! py-0! text-sm!"
                  value={s.peso === 0 ? '' : s.peso}
                  onChange={e =>
                    updateSerie(i, { peso: e.target.value === '' ? 0 : parseFloat(e.target.value) })
                  }
                  onFocus={e => e.target.select()}
                  placeholder="0"
                />
                <input
                  type="number"
                  className="set-input h-9! py-0! text-sm!"
                  value={
                    tipo === 'tempo'
                      ? s.repeticoes === 0
                        ? ''
                        : s.repeticoes
                      : s.repeticoes === 0
                        ? ''
                        : s.repeticoes
                  }
                  onChange={e =>
                    updateSerie(i, {
                      repeticoes:
                        e.target.value === ''
                          ? 0
                          : tipo === 'tempo'
                            ? parseFloat(e.target.value)
                            : parseInt(e.target.value, 10),
                    })
                  }
                  onFocus={e => e.target.select()}
                  placeholder={tipo === 'falha' ? 'Falha' : tipo === 'tempo' ? '0.0' : '0'}
                  step={tipo === 'tempo' ? '0.5' : '1'}
                />
                <button
                  type="button"
                  onClick={() => removeSerie(i)}
                  className="btn-ghost p-1.5 text-text-subtle hover:text-danger"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {applyAll && (
            <div className="bg-accent/10 border border-accent /20 rounded-xl px-3 py-2.5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-text-muted">
                  Repetir{' '}
                  <strong className="text-text">
                    {applyAll.field === 'peso'
                      ? `${applyAll.value} kg`
                      : applyAll.field === 'repeticoes' && (exercicio.tipoSerie ?? 'reps') === 'tempo'
                        ? `${applyAll.value} min`
                        : `${applyAll.value} reps`}
                  </strong>{' '}
                  em:
                </p>
                <button
                  type="button"
                  onClick={() => setApplyAll(null)}
                  className="w-5 h-5 flex items-center justify-center rounded-full text-text-subtle hover:text-text hover:bg-surface-2 transition-colors text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-1.5">
                {applyAll.sIdx < series.length - 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const novasSeries = series.map((s: SeriePlano, i: number) =>
                        i > applyAll.sIdx ? { ...s, [applyAll.field]: applyAll.value } : s
                      )
                      onUpdate({ seriesDetalhadas: novasSeries })
                      setApplyAll(null)
                    }}
                    className="flex-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-accent bg-accent/10 border border-accent /20"
                  >
                    ↓ Seguintes
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const novasSeries = series.map((s: SeriePlano) => ({
                      ...s,
                      [applyAll.field]: applyAll.value,
                    }))
                    onUpdate({ seriesDetalhadas: novasSeries })
                    setApplyAll(null)
                  }}
                  className="flex-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-accent"
                >
                  Todas
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={addSerie}
            className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-accent hover:bg-accent/5 rounded-lg border border-dashed border-accent /20 transition-colors"
          >
            <Plus size={14} />
            Adicionar Série
          </button>

          <div className="pt-2">
            <label className="text-[10px] text-text-subtle font-bold uppercase block mb-1.5 pl-1">
              OBSERVAÇÕES DO EXERCÍCIO
            </label>
            <textarea
              className="input h-16 text-sm resize-none py-2"
              placeholder="Dica: manter cotovelos fechados..."
              value={exercicio.notas || ''}
              onChange={e => onUpdate({ notas: e.target.value })}
            />
          </div>

          <div className="pt-1">
            <label className="text-[10px] text-text-subtle font-bold uppercase block mb-1.5 pl-1">
              Descanso (segundos)
            </label>
            <input
              type="number"
              className="input h-10 text-sm"
              value={exercicio.descansoSegundos}
              onChange={e => onUpdate({ descansoSegundos: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      )}
    </div>
  )
}
