import { RefreshCw } from 'lucide-react'

interface HomeHeaderProps {
  saudacao: string
  nome: string
  onSync: () => void
  sincronizando: boolean
}

export function HomeHeader({ saudacao, nome, onSync, sincronizando }: HomeHeaderProps) {
  return (
    <div className="mb-6 animate-fade-up flex items-start justify-between">
      <div>
        <p className="text-text-muted text-sm">{saudacao},</p>
        <h1 className="text-2xl font-bold text-text mt-0.5">{nome} 👋</h1>
      </div>
      <button
        type="button"
        onClick={onSync}
        disabled={sincronizando}
        className="mt-1 w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-text-muted hover:bg-surface-2 transition-colors disabled:opacity-50"
        title="Sincronizar com Firebase"
      >
        <RefreshCw size={16} className={sincronizando ? 'animate-spin' : ''} />
      </button>
    </div>
  )
}
