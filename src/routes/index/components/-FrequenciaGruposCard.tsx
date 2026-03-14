import { CORES_GRUPO } from '../../../types'

interface AlertaGrupo {
  grupo: string
  dias: number
  cor: string
}

interface FrequenciaGruposCardProps {
  alertas: AlertaGrupo[]
}

export function FrequenciaGruposCard({ alertas }: FrequenciaGruposCardProps) {
  if (alertas.length === 0) return null

  return (
    <div className="card p-4 mb-6 animate-fade-up" style={{ animationDelay: '125ms' }}>
      <p className="text-xs text-text-muted font-medium mb-3">GRUPOS MUSCULARES</p>
      <div className="flex flex-col gap-2">
        {alertas.map(a => (
          <div key={a.grupo} className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: a.cor }}
            />
            <span className="text-sm text-text font-medium flex-1">{a.grupo}</span>
            <span
              className={`text-xs font-semibold ${a.dias >= 14 ? 'text-warning' : 'text-text-muted'}`}
            >
              {a.dias === 1 ? '1 dia' : `${a.dias} dias`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
