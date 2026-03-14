import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import type { PlanoImportado } from '../../../lib/csvImport'
import type { ExercicioNoPlano } from '../../../types'
import { ExercicioEditCard } from './-ExercicioEditCard'

export type PlanoEditado = PlanoImportado & { collapsed: boolean }

interface PlanoEditCardProps {
  plano: PlanoEditado
  expandedExs: Set<string>
  onToggleEx: (id: string) => void
  onChange: (fn: (p: PlanoEditado) => PlanoEditado) => void
  onRemove: () => void
}

export function PlanoEditCard({
  plano,
  expandedExs,
  onToggleEx,
  onChange,
  onRemove,
}: PlanoEditCardProps) {
  const totalExs = plano.exercicios.length
  const totalSeries = plano.exercicios.reduce(
    (acc, e) => acc + (e.seriesDetalhadas?.length ?? e.series),
    0
  )

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-surface-2/60">
        <button
          type="button"
          onClick={() => onChange(p => ({ ...p, collapsed: !p.collapsed }))}
          className="text-text-muted"
        >
          {plano.collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
        <div className="flex-1 min-w-0">
          <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1 block">
            NOME DO PLANO
          </label>
          <input
            className="input py-1.5 text-sm font-semibold w-full"
            value={plano.nome}
            onChange={e => onChange(p => ({ ...p, nome: e.target.value }))}
            onClick={e => e.stopPropagation()}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-danger opacity-60 hover:opacity-100 shrink-0"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {!plano.collapsed && (
        <div className="p-3 flex flex-col gap-2">
          <p className="text-xs text-text-muted mb-1">
            {totalExs} exercício{totalExs !== 1 ? 's' : ''} · {totalSeries} série
            {totalSeries !== 1 ? 's' : ''} no total
          </p>
          {plano.exercicios.map((ex, i) => (
            <ExercicioEditCard
              key={ex.id}
              ex={ex}
              idx={i}
              expanded={expandedExs.has(ex.id)}
              onToggle={() => onToggleEx(ex.id)}
              onUpdate={fn =>
                onChange(p => ({
                  ...p,
                  exercicios: p.exercicios.map(e => (e.id === ex.id ? fn(e) : e)),
                }))
              }
              onRemove={() =>
                onChange(p => ({ ...p, exercicios: p.exercicios.filter(e => e.id !== ex.id) }))
              }
            />
          ))}
          {plano.exercicios.length === 0 && (
            <p className="text-xs text-text-subtle text-center py-4">
              Nenhum exercício. Remova este plano ou adicione exercícios manualmente.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
