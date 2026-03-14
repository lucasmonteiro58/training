interface ProgressoSeriesProps {
  seriesOk: number
  totalSeries: number
}

export function ProgressoSeries({ seriesOk, totalSeries }: ProgressoSeriesProps) {
  return (
    <div className="card p-4 mb-5 animate-fade-up" style={{ animationDelay: '100ms' }}>
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs font-semibold text-text-muted">SÉRIES COMPLETADAS</p>
        <p className="text-sm font-bold text-text">{seriesOk}/{totalSeries}</p>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${totalSeries ? (seriesOk / totalSeries) * 100 : 0}%` }} />
      </div>
    </div>
  )
}
