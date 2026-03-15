import { RefreshCw } from 'lucide-react'

interface HomeHeaderProps {
  greeting: string
  name: string
  onSync: () => void
  isSyncing: boolean
}

export function HomeHeader({ greeting, name, onSync, isSyncing }: HomeHeaderProps) {
  return (
    <div className="mb-6 animate-fade-up flex items-start justify-between">
      <div>
        <p className="text-text-muted text-sm">{greeting},</p>
        <h1 className="text-2xl font-bold text-text mt-0.5">{name} 👋</h1>
      </div>
      <button
        type="button"
        onClick={onSync}
        disabled={isSyncing}
        className="mt-1 w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-text-muted hover:bg-surface-2 transition-colors disabled:opacity-50"
        title="Sincronizar com Firebase"
      >
        <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
      </button>
    </div>
  )
}
