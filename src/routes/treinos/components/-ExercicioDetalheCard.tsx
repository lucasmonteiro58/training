import { useState } from 'react'
import {
  GripVertical,
  ChevronDown,
  Trash2,
  Search,
  RefreshCw,
  Unlink,
} from 'lucide-react'
import type { ExercicioNoPlano, SeriePlano, TipoSerie } from '../../../types'
import { GRUPOS_MUSCULARES } from '../../../types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useBuscaImagemGiphy } from '../../../hooks/useBuscaImagemGiphy'

export interface ExercicioDetalheCardProps {
  ex: ExercicioNoPlano
  editando: boolean
  isExpanded: boolean
  onToggleExpand: () => void
  onRemove: () => void
  onUpdateSerie: (sIdx: number, campo: Partial<SeriePlano>) => void
  onUpdateDescanso: (segundos: number) => void
  onUpdateTipoSerie: (tipo: TipoSerie) => void
  onUpdateExercicio: (campos: Partial<ExercicioNoPlano['exercicio']>) => void
  showSelect?: boolean
  isSelected?: boolean
  onToggleSelect?: () => void
  onRemoveFromGroup?: () => void
}

export function ExercicioDetalheCard({
  ex,
  editando,
  isExpanded,
  onToggleExpand,
  onRemove,
  onUpdateSerie,
  onUpdateDescanso,
  onUpdateTipoSerie,
  onUpdateExercicio,
  showSelect,
  isSelected,
  onToggleSelect,
  onRemoveFromGroup,
}: ExercicioDetalheCardProps) {
  const {
    termoBusca,
    setTermoBusca,
    imagensWeb,
    buscandoImagem,
    buscarImagem,
  } = useBuscaImagemGiphy(ex.exercicio.nome)

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: ex.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  const tipo = ex.tipoSerie ?? 'reps'
  const ciclo: TipoSerie[] = ['reps', 'tempo', 'falha']
  const proximo = ciclo[(ciclo.indexOf(tipo) + 1) % ciclo.length]
  const tipoLabels: Record<TipoSerie, string> = {
    reps: 'Reps',
    tempo: 'Min',
    falha: 'Falha ⚡',
  }

  const displayReps =
    tipo === 'tempo'
      ? `${ex.seriesDetalhadas?.[0]?.repeticoes ?? 1} min`
      : tipo === 'falha'
        ? 'Falha ⚡'
        : `${ex.repeticoesMeta} reps`

  const seriesEdit = isExpanded
    ? (ex.seriesDetalhadas ??
        Array.from(
          { length: ex.series },
          (_, i) => ({
            peso: ex.pesoMeta ?? 0,
            repeticoes: tipo === 'tempo' ? 1 : ex.repeticoesMeta,
          })
        ))
    : []

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card p-3 transition-opacity ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        {editando && (
          <div
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 touch-none select-none"
          >
            <GripVertical size={16} className="text-text-subtle shrink-0" />
          </div>
        )}
        {showSelect && !ex.agrupamentoId && (
          <button
            onClick={(e) => {
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
        {ex.agrupamentoId && onRemoveFromGroup && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemoveFromGroup()
            }}
            className="p-1 rounded-lg hover:bg-surface-2 text-text-subtle"
            title="Remover do agrupamento"
          >
            <Unlink size={14} />
          </button>
        )}
        {ex.exercicio.gifUrl ? (
          <img
            src={ex.exercicio.gifUrl}
            alt={ex.exercicio.nome}
            className="w-12 h-12 rounded-xl object-cover bg-surface-2 shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center shrink-0">
            <span className="text-2xl">💪</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-text font-semibold text-sm truncate">
            {ex.exercicio.nome}
          </p>
          <div className="flex gap-3 mt-1 flex-wrap">
            <span className="text-xs text-text-muted">{ex.series} séries</span>
            <span className="text-xs text-text-muted">{displayReps}</span>
            <span className="text-xs text-text-muted">
              ⏱ {ex.descansoSegundos}s
            </span>
          </div>
        </div>
        {editando && (
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleExpand}
              className="btn-ghost p-2 text-text-subtle"
              title="Editar séries"
            >
              <ChevronDown
                size={15}
                className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
            <button onClick={onRemove} className="btn-ghost p-2 text-danger">
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-subtle block mb-1 px-1">
              NOME
            </label>
            <input
              className="input text-sm w-full"
              value={ex.exercicio.nome}
              onChange={(e) => onUpdateExercicio({ nome: e.target.value })}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-subtle block mb-1 px-1">
              GRUPO MUSCULAR
            </label>
            <select
              className="input text-sm w-full"
              value={ex.exercicio.grupoMuscular}
              onChange={(e) =>
                onUpdateExercicio({ grupoMuscular: e.target.value })
              }
            >
              {GRUPOS_MUSCULARES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-subtle block mb-1 px-1">
              BUSCAR IMAGEM (WEB)
            </label>
            <div className="flex gap-2">
              <input
                className="input flex-1 text-sm"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscarImagem()}
                placeholder="Ex: bench press"
              />
              <button
                onClick={buscarImagem}
                disabled={buscandoImagem}
                className="btn-secondary px-3 shrink-0"
              >
                {buscandoImagem ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Search size={15} />
                )}
              </button>
            </div>
            {imagensWeb.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2 p-2 bg-surface-2 rounded-xl max-h-44 overflow-y-auto">
                {imagensWeb.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => onUpdateExercicio({ gifUrl: url })}
                    className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                      ex.exercicio.gifUrl === url
                        ? 'border-accent  opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={url}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="mt-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-subtle block mb-1 px-1">
                URL MANUAL
              </label>
              <div className="flex gap-2 items-start">
                <input
                  className="input text-sm flex-1"
                  placeholder="https://exemplo.com/exercicio.gif"
                  value={ex.exercicio.gifUrl ?? ''}
                  onChange={(e) =>
                    onUpdateExercicio({
                      gifUrl: e.target.value || undefined,
                    })
                  }
                />
                {ex.exercicio.gifUrl && (
                  <img
                    src={ex.exercicio.gifUrl}
                    alt={ex.exercicio.nome}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 bg-surface-2"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">
              Modo
            </span>
            <button
              onClick={() => onUpdateTipoSerie(proximo)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors ${
                tipo === 'reps'
                  ? 'text-text-muted border-border hover:text-accent hover:border-accent /50'
                  : 'text-accent border-accent /40 bg-accent/10'
              }`}
            >
              {tipoLabels[tipo]} → {tipoLabels[proximo]}
            </button>
          </div>
          <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle shrink-0">
              Intervalo (s)
            </span>
            <input
              type="number"
              className="set-input h-8! py-0! text-sm! flex-1"
              value={ex.descansoSegundos}
              min={0}
              step={15}
              onChange={(e) =>
                onUpdateDescanso(
                  e.target.value === '' ? 0 : parseInt(e.target.value)
                )
              }
              onFocus={(e) => e.target.select()}
            />
          </div>
          <div className="grid grid-cols-[30px_1fr_1fr] gap-2 px-1 text-[10px] font-bold uppercase tracking-wider text-text-subtle">
            <span className="text-center">#</span>
            <span className="text-center">Peso (kg)</span>
            <span className="text-center">{tipoLabels[tipo]}</span>
          </div>
          {seriesEdit.map((s, i) => (
            <div
              key={i}
              className="grid grid-cols-[30px_1fr_1fr] gap-2 items-center bg-surface-2/50 px-1 py-1 rounded-lg"
            >
              <span className="text-[11px] font-bold text-text-muted text-center">
                {i + 1}
              </span>
              <input
                type="number"
                className="set-input h-9! py-0! text-sm!"
                value={s.peso === 0 ? '' : s.peso}
                onChange={(e) =>
                  onUpdateSerie(i, {
                    peso:
                      e.target.value === '' ? 0 : parseFloat(e.target.value),
                  })
                }
                onFocus={(e) => e.target.select()}
                placeholder="0"
              />
              <input
                type="number"
                className="set-input h-9! py-0! text-sm!"
                value={s.repeticoes === 0 ? '' : s.repeticoes}
                onChange={(e) =>
                  onUpdateSerie(i, {
                    repeticoes:
                      e.target.value === ''
                        ? 0
                        : tipo === 'tempo'
                          ? parseFloat(e.target.value)
                          : parseInt(e.target.value),
                  })
                }
                onFocus={(e) => e.target.select()}
                placeholder={
                  tipo === 'falha' ? 'Falha' : tipo === 'tempo' ? '0.0' : '0'
                }
                step={tipo === 'tempo' ? '0.5' : '1'}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
