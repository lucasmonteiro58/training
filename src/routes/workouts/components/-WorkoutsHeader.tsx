import { Link } from '@tanstack/react-router'
import { Plus, FileUp, ArrowUpDown } from 'lucide-react'

interface WorkoutsHeaderProps {
  isReordering: boolean
  canReorder: boolean
  onToggleReorder: () => void
}

export function WorkoutsHeader({
  isReordering,
  canReorder,
  onToggleReorder,
}: WorkoutsHeaderProps) {
  return (
    <div className="flex flex-col gap-2 mb-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Meus Treinos</h1>
        <Link to="/workouts/new" style={{ textDecoration: 'none' }}>
          <button type="button" className="btn-primary flex items-center gap-1.5 py-2 px-3 text-sm">
            <Plus size={16} />
            Novo
          </button>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {canReorder && (
          <button
            type="button"
            className={`btn-ghost flex items-center gap-1.5 text-sm ${
              isReordering ? 'text-accent font-semibold' : ''
            }`}
            onClick={onToggleReorder}
          >
            <ArrowUpDown size={16} />
            {isReordering ? 'Salvar ordem' : 'Ordenar'}
          </button>
        )}
        {!isReordering && (
          <Link to="/workouts/import" style={{ textDecoration: 'none' }}>
            <button type="button" className="btn-ghost flex items-center gap-1.5 text-sm" title="Importar CSV">
              <FileUp size={16} />
              Importar CSV
            </button>
          </Link>
        )}
      </div>
    </div>
  )
}
