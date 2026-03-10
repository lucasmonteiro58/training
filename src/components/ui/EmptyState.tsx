import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 mt-16 animate-scale-in text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-[var(--color-surface-2)] flex items-center justify-center">
        <Icon size={36} className="text-[var(--color-text-subtle)]" />
      </div>
      <p className="text-[var(--color-text)] font-semibold text-lg">{title}</p>
      <p className="text-[var(--color-text-muted)] text-sm max-w-[280px] leading-relaxed">
        {description}
      </p>
      {action && (
        <button onClick={action.onClick} className="btn-primary mt-2">
          {action.label}
        </button>
      )}
    </div>
  )
}
