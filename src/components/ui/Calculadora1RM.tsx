import { useState } from 'react'
import { Calculator, X } from 'lucide-react'
import { calculate1RM, getWeightsTable } from '../../lib/calculadora1rm'

interface Calculadora1RMProps {
  onClose: () => void
  initialWeight?: number
  initialReps?: number
}

export function Calculadora1RM({ onClose, initialWeight, initialReps }: Calculadora1RMProps) {
  const [weight, setWeight] = useState(initialWeight ?? 0)
  const [reps, setReps] = useState(initialReps ?? 0)

  const oneRM = calculate1RM(weight, reps)
  const loadTable = oneRM > 0 ? getWeightsTable(oneRM) : []

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-h-[80dvh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
              <Calculator size={18} className="text-accent" />
            </div>
            <h2 className="text-lg font-bold text-text">Calculadora 1RM</h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-2">
            <X size={18} />
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-subtle block mb-1.5 pl-1">
              PESO (KG)
            </label>
            <input
              type="number"
              className="input text-center text-lg font-bold"
              value={weight === 0 ? '' : weight}
              onChange={(e) => setWeight(e.target.value === '' ? 0 : parseFloat(e.target.value))}
              onFocus={(e) => e.target.select()}
              placeholder="0"
              min={0}
              step={0.5}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-subtle block mb-1.5 pl-1">
              REPETIÇÕES
            </label>
            <input
              type="number"
              className="input text-center text-lg font-bold"
              value={reps === 0 ? '' : reps}
              onChange={(e) => setReps(e.target.value === '' ? 0 : parseInt(e.target.value))}
              onFocus={(e) => e.target.select()}
              placeholder="0"
              min={0}
              max={36}
            />
          </div>
        </div>

        {/* 1RM Result */}
        {oneRM > 0 && (
          <div className="bg-accent/10 border border-accent /20 rounded-2xl p-4 mb-4 text-center shrink-0 animate-scale-in">
            <p className="text-xs text-text-muted mb-1">1RM Estimada</p>
            <p className="text-3xl font-black text-accent">
              {Math.round(oneRM * 10) / 10} <span className="text-sm font-medium">kg</span>
            </p>
          </div>
        )}

        {/* Load Table */}
        {loadTable.length > 0 && (
          <div className="flex-1 overflow-y-auto -mx-1 px-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-2 pl-1">
              TABELA DE CARGAS
            </p>
            <div className="space-y-1">
              {loadTable.map((row) => (
                <div
                  key={row.percentage}
                  className={`grid grid-cols-3 items-center py-2 px-3 rounded-lg text-sm ${
                    row.percentage === 100
                      ? 'bg-accent/15 text-accent font-bold'
                      : 'bg-surface-2/50'
                  }`}
                >
                  <span className="text-text-muted font-medium">{row.percentage}%</span>
                  <span className="text-text font-bold text-center">{row.weight} kg</span>
                  <span className="text-text-muted text-right text-xs">{row.estimatedReps} reps</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {oneRM <= 0 && (
          <p className="text-text-muted text-sm text-center mt-4">
            Insira o peso e o número de repetições para calcular a 1RM
          </p>
        )}
      </div>
    </div>
  )
}
