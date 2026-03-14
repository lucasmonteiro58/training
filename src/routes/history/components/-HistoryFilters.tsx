import { X } from 'lucide-react'

export type Periodo = 'todos' | '7d' | '30d' | '90d'

interface HistoryFiltersProps {
  filtroPlano: string
  filtroPeriodo: Periodo
  filtroAtivo: boolean
  sessoesNomes: string[]
  onPlanoChange: (v: string) => void
  onPeriodoChange: (v: Periodo) => void
  onLimpar: () => void
}

export function HistoryFilters({
  filtroPlano,
  filtroPeriodo,
  filtroAtivo,
  sessoesNomes,
  onPlanoChange,
  onPeriodoChange,
  onLimpar,
}: HistoryFiltersProps) {
  return (
    <div className="card p-4 mb-4 animate-scale-in space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Filtros</p>
        {filtroAtivo && (
          <button onClick={onLimpar} className="text-xs text-accent flex items-center gap-1">
            <X size={12} /> Limpar
          </button>
        )}
      </div>
      <div>
        <label className="text-[10px] font-bold text-text-subtle uppercase tracking-wider block mb-1.5">Plano</label>
        <select className="input text-sm w-full" value={filtroPlano} onChange={e => onPlanoChange(e.target.value)}>
          <option value="todos">Todos os planos</option>
          {sessoesNomes.map(nome => (
            <option key={nome} value={nome}>{nome}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-[10px] font-bold text-text-subtle uppercase tracking-wider block mb-1.5">Período</label>
        <div className="flex gap-2">
          {([['todos', 'Todos'], ['7d', '7 dias'], ['30d', '30 dias'], ['90d', '90 dias']] as [Periodo, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => onPeriodoChange(val)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filtroPeriodo === val ? 'bg-accent text-white' : 'bg-surface-2 text-text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
