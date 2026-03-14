import { AlertCircle } from 'lucide-react'

interface ImportErrorsProps {
  erros: string[]
}

export function ImportErrors({ erros }: ImportErrorsProps) {
  if (erros.length === 0) return null

  return (
    <div className="mt-4 card p-4 border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.05)] animate-fade-up">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle size={16} className="text-danger" />
        <p className="text-sm font-semibold text-danger">{erros.length} erro(s) encontrado(s)</p>
      </div>
      <ul className="list-disc list-inside space-y-1">
        {erros.map((e, i) => (
          <li key={i} className="text-xs text-text-muted">
            {e}
          </li>
        ))}
      </ul>
    </div>
  )
}
