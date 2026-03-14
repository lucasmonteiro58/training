import { Link } from '@tanstack/react-router'
import { Plus, FileUp, ArrowUpDown } from 'lucide-react'

interface TreinosHeaderProps {
  reordenando: boolean
  podeOrdenar: boolean
  onToggleReordenar: () => void
}

export function TreinosHeader({
  reordenando,
  podeOrdenar,
  onToggleReordenar,
}: TreinosHeaderProps) {
  return (
    <div className="flex flex-col gap-2 mb-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Meus Treinos</h1>
        <Link to="/treinos/novo" style={{ textDecoration: 'none' }}>
          <button type="button" className="btn-primary flex items-center gap-1.5 py-2 px-3 text-sm">
            <Plus size={16} />
            Novo
          </button>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {podeOrdenar && (
          <button
            type="button"
            className={`btn-ghost flex items-center gap-1.5 text-sm ${
              reordenando ? 'text-accent font-semibold' : ''
            }`}
            onClick={onToggleReordenar}
          >
            <ArrowUpDown size={16} />
            {reordenando ? 'Salvar ordem' : 'Ordenar'}
          </button>
        )}
        {!reordenando && (
          <Link to="/treinos/importar" style={{ textDecoration: 'none' }}>
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
