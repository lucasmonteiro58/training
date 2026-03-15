interface WorkoutNotesProps {
  notes: string
}

export function WorkoutNotes({ notes }: WorkoutNotesProps) {
  if (!notes) return null
  return (
    <div className="card p-4 mb-5 animate-fade-up" style={{ animationDelay: '120ms' }}>
      <p className="text-xs font-semibold text-text-muted mb-2">📝 NOTES</p>
      <p className="text-sm text-text whitespace-pre-wrap">{notes}</p>
    </div>
  )
}
