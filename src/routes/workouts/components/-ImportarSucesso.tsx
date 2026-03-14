import { CheckCircle } from 'lucide-react'

interface ImportarSucessoProps {
  planosCount: number
}

export function ImportarSucesso({ planosCount }: ImportarSucessoProps) {
  return (
    <div className="flex flex-col items-center gap-4 mt-16 animate-scale-in">
      <CheckCircle size={48} className="text-success" />
      <p className="text-text font-semibold text-lg">
        {planosCount > 1 ? `${planosCount} planos criados com sucesso!` : 'Plano criado com sucesso!'}
      </p>
      <p className="text-text-muted text-sm">Redirecionando...</p>
    </div>
  )
}
