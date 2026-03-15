import { ChevronLeft, Plus } from 'lucide-react'

interface MeasurementsHeaderProps {
  onBack: () => void
  onNew: () => void
}

export function MeasurementsHeader({ onBack, onNew }: MeasurementsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="btn-icon">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-text">Medidas Corporais</h1>
      </div>
      <button
        type="button"
        onClick={onNew}
        className="btn-primary flex items-center gap-1.5 text-sm py-2 px-3"
      >
        <Plus size={16} />
        Nova
      </button>
    </div>
  )
}
