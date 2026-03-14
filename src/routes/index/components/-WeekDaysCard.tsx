interface WeekDaysCardProps {
  diasDaSemana: string[]
  inicioSemana: Date
  hoje: Date
  sessoes: { iniciadoEm: number }[]
}

export function WeekDaysCard({
  diasDaSemana,
  inicioSemana,
  hoje,
  sessoes,
}: WeekDaysCardProps) {
  return (
    <div className="card p-4 mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
      <p className="text-xs text-text-muted font-medium mb-3">ESTA SEMANA</p>
      <div className="flex justify-between">
        {diasDaSemana.map((dia, idx) => {
          const diaDate = new Date(inicioSemana)
          diaDate.setDate(inicioSemana.getDate() + idx)
          const temTreino = sessoes.some(s => {
            const d = new Date(s.iniciadoEm)
            return d.toDateString() === diaDate.toDateString()
          })
          const isHoje = diaDate.toDateString() === hoje.toDateString()
          return (
            <div key={idx} className="flex flex-col items-center gap-1.5">
              <span
                className={`text-[10px] ${isHoje ? 'text-accent font-semibold' : 'text-text-subtle'}`}
              >
                {dia}
              </span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  temTreino
                    ? 'bg-accent text-white'
                    : isHoje
                      ? 'border-2 border-accent text-accent'
                      : 'bg-surface-2 text-text-subtle'
                }`}
              >
                {temTreino ? '✓' : diaDate.getDate()}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
