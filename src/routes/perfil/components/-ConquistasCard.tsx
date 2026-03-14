import type { Conquista } from '../../../lib/streaks'

interface ConquistasCardProps {
  conquistas: Conquista[]
}

export function ConquistasCard({ conquistas }: ConquistasCardProps) {
  const desbloqueadas = conquistas.filter(c => c.desbloqueada).length

  return (
    <div className="card p-4 mb-5 animate-fade-up" style={{ animationDelay: '75ms' }}>
      <p className="text-xs font-bold text-text-muted mb-3">
        CONQUISTAS ({desbloqueadas}/{conquistas.length})
      </p>
      <div className="grid grid-cols-4 gap-2">
        {conquistas.map(c => (
          <div
            key={c.id}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              c.desbloqueada ? '' : 'opacity-30 grayscale'
            }`}
            title={`${c.nome}: ${c.descricao}`}
          >
            <span className="text-2xl">{c.icone}</span>
            <span className="text-[9px] font-semibold text-text-muted text-center leading-tight">
              {c.nome}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
