import { Dumbbell, BarChart2 } from 'lucide-react'

export type EvolucaoTabId = 'grafico' | 'exercicios'

interface EvolucaoTabsProps {
  tab: EvolucaoTabId
  onTabChange: (tab: EvolucaoTabId) => void
}

const TABS: { id: EvolucaoTabId; label: string; icon: React.ElementType }[] = [
  { id: 'exercicios', label: 'Por Exercício', icon: Dumbbell },
  { id: 'grafico', label: 'Volume', icon: BarChart2 },
]

export function EvolucaoTabs({ tab, onTabChange }: EvolucaoTabsProps) {
  return (
    <div className="flex gap-2 mb-5 animate-fade-up bg-surface-2 p-1 rounded-2xl">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onTabChange(id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === id
              ? 'bg-surface text-text shadow-sm'
              : 'text-text-muted'
          }`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  )
}
