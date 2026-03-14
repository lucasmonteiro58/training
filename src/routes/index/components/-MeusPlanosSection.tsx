import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import type { PlanoDeTreino } from '../../../types'
import { PlanoCard } from './-PlanoCard'

interface MeusPlanosSectionProps {
  planos: PlanoDeTreino[]
  carregando: boolean
}

export function MeusPlanosSection({ planos, carregando }: MeusPlanosSectionProps) {
  return (
    <div className="mb-6 animate-fade-up" style={{ animationDelay: '150ms' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-text">Meus Planos</h2>
        <Link to="/treinos" className="text-accent text-sm font-medium" style={{ textDecoration: 'none' }}>
          Ver todos
        </Link>
      </div>

      {carregando ? (
        <div className="flex flex-col gap-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="skeleton h-[68px] rounded-2xl" />
          ))}
        </div>
      ) : planos.length === 0 ? (
        <Link to="/treinos/novo" style={{ textDecoration: 'none' }}>
          <div className="card p-6 border-dashed border-border-strong flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-accent-subtle flex items-center justify-center">
              <Plus size={24} className="text-accent" />
            </div>
            <div>
              <p className="text-text font-semibold text-sm">Crie seu primeiro plano</p>
              <p className="text-text-muted text-xs mt-1">Monte sua rotina de treino personalizada</p>
            </div>
          </div>
        </Link>
      ) : (
        <div className="flex flex-col gap-2">
          {planos.slice(0, 3).map(plano => (
            <PlanoCard key={plano.id} plano={plano} />
          ))}
        </div>
      )}
    </div>
  )
}
