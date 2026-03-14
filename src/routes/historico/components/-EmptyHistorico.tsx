import { Link } from '@tanstack/react-router'
import { History } from 'lucide-react'

interface EmptyHistoricoProps {
  filtroAtivo: boolean
  onLimparFiltros?: () => void
}

export function EmptyHistorico({ filtroAtivo, onLimparFiltros }: EmptyHistoricoProps) {
  return (
    <div className="flex flex-col items-center gap-4 mt-16 animate-scale-in text-center">
      <div className="w-20 h-20 rounded-3xl bg-surface-2 flex items-center justify-center">
        <History size={36} className="text-text-subtle" />
      </div>
      <p className="text-text font-semibold">
        {filtroAtivo ? 'Nenhum treino encontrado' : 'Nenhum treino registrado ainda'}
      </p>
      <p className="text-text-muted text-sm">
        {filtroAtivo ? 'Tente ajustar os filtros' : 'Faça seu primeiro treino para começar o histórico'}
      </p>
      {filtroAtivo && onLimparFiltros ? (
        <button onClick={onLimparFiltros} className="btn-secondary">Limpar Filtros</button>
      ) : (
        <Link to="/treinos" style={{ textDecoration: 'none' }}>
          <button className="btn-primary">Ver Planos</button>
        </Link>
      )}
    </div>
  )
}
