import { CheckCircle } from 'lucide-react'

interface ImportSuccessProps {
  plansCount: number
}

export function ImportSuccess({ plansCount }: ImportSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-4 mt-16 animate-scale-in">
      <CheckCircle size={48} className="text-success" />
      <p className="text-text font-semibold text-lg">
        {plansCount > 1 ? `${plansCount} plans created successfully!` : 'Plan created successfully!'}
      </p>
      <p className="text-text-muted text-sm">Redirecting...</p>
    </div>
  )
}
