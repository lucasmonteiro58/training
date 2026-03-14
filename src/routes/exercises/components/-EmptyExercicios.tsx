import { SearchX, Plus } from 'lucide-react'

interface EmptyExerciciosProps {
  onCriar: () => void
}

export function EmptyExercicios({ onCriar }: EmptyExerciciosProps) {
  return (
    <div className="flex flex-col items-center gap-4 mt-12 animate-scale-in text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center">
        <SearchX size={28} className="text-text-subtle" />
      </div>
      <p className="text-text font-semibold">Nenhum exercício encontrado</p>
      <p className="text-text-muted text-sm">
        Tente buscar com outro nome ou crie um exercício personalizado
      </p>
      <button type="button" onClick={onCriar} className="btn-primary mt-1">
        <Plus size={16} /> Criar Exercício
      </button>
    </div>
  )
}
