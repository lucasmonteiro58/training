import { createFileRoute } from '@tanstack/react-router'
import { useTreinoAtivoStore } from '../../stores'
import { Link } from '@tanstack/react-router'
import { Play, Dumbbell } from 'lucide-react'

export const Route = createFileRoute('/treino-ativo/')({
  component: TreinoAtivoIndexPage,
})

function TreinoAtivoIndexPage() {
  const { iniciado, sessao } = useTreinoAtivoStore()

  if (iniciado && sessao) {
    return (
      <div className="page-container pt-6">
        <div className="flex flex-col items-center gap-6 mt-8 animate-fade-up">
          <div className="w-20 h-20 rounded-3xl bg-[var(--color-accent-subtle)] flex items-center justify-center animate-pulse-glow">
            <Dumbbell size={36} className="text-[var(--color-accent)]" />
          </div>
          <div className="text-center">
            <p className="text-[var(--color-text-muted)] text-sm">Treino em andamento</p>
            <h2 className="text-xl font-bold text-[var(--color-text)] mt-1">{sessao.planoNome}</h2>
          </div>
          <Link to="/treino-ativo/$planoId" params={{ planoId: sessao.planoId }} style={{ textDecoration: 'none' }}>
            <button className="btn-primary flex items-center gap-2">
              <Play size={18} />
              Continuar Treino
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container pt-6">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6 animate-fade-up">Treinar</h1>
      <div className="flex flex-col items-center gap-4 mt-12 animate-scale-in">
        <div className="w-20 h-20 rounded-3xl bg-[var(--color-surface-2)] flex items-center justify-center">
          <Dumbbell size={36} className="text-[var(--color-text-subtle)]" />
        </div>
        <p className="text-[var(--color-text-muted)] text-center text-sm">
          Escolha um plano para iniciar seu treino
        </p>
        <Link to="/treinos" style={{ textDecoration: 'none' }}>
          <button className="btn-primary">Ver Meus Planos</button>
        </Link>
      </div>
    </div>
  )
}
