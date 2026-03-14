interface NotasTreinoProps {
  notas: string
}

export function NotasTreino({ notas }: NotasTreinoProps) {
  if (!notas) return null
  return (
    <div className="card p-4 mb-5 animate-fade-up" style={{ animationDelay: '120ms' }}>
      <p className="text-xs font-semibold text-text-muted mb-2">📝 NOTAS</p>
      <p className="text-sm text-text whitespace-pre-wrap">{notas}</p>
    </div>
  )
}
