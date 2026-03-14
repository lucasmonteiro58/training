import { ArrowLeft } from 'lucide-react'

interface NewPlanHeaderProps {
  onBack: () => void
  onSave: () => void
  saving: boolean
  saveDisabled: boolean
}

export function NewPlanHeader({
  onBack,
  onSave,
  saving,
  saveDisabled,
}: NewPlanHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        type="button"
        onClick={onBack}
        className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-muted hover:text-text transition-colors"
      >
        <ArrowLeft size={18} />
      </button>
      <h1 className="text-xl font-bold text-text">Novo Plano</h1>
      <div className="ml-auto">
        <button
          type="button"
          onClick={onSave}
          disabled={saveDisabled || saving}
          className="btn-primary py-2.5 px-5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}
