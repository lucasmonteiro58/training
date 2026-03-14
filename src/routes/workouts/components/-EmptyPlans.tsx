import { Link } from '@tanstack/react-router'
import { Dumbbell, FileUp } from 'lucide-react'

export function EmptyPlans() {
  return (
    <div className="flex flex-col items-center gap-6 mt-16 animate-scale-in">
      <div className="w-20 h-20 rounded-3xl bg-surface-2 flex items-center justify-center">
        <Dumbbell size={36} className="text-text-subtle" />
      </div>
      <div className="text-center">
        <p className="text-text font-semibold text-lg">Nenhum plano ainda</p>
        <p className="text-text-muted text-sm mt-1">Crie seu primeiro plano ou importe via CSV</p>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <Link to="/workouts/new" style={{ textDecoration: 'none' }}>
          <button type="button" className="btn-primary w-full">
            Criar Plano
          </button>
        </Link>
        <Link to="/workouts/import" style={{ textDecoration: 'none' }}>
          <button type="button" className="btn-secondary w-full">
            <FileUp size={16} />
            Importar CSV
          </button>
        </Link>
      </div>
    </div>
  )
}
