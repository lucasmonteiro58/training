import { ArrowLeft, Edit2, Save } from 'lucide-react'

interface SessaoDetalheHeaderProps {
  planoNome: string
  dataStr: string
  editando: boolean
  onVoltar: () => void
  onIniciarEdicao: () => void
  onCancelarEdicao: () => void
  onSalvarEdicao: () => void
}

export function SessaoDetalheHeader({
  planoNome,
  dataStr,
  editando,
  onVoltar,
  onIniciarEdicao,
  onCancelarEdicao,
  onSalvarEdicao,
}: SessaoDetalheHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6 animate-fade-up">
      <button
        onClick={onVoltar}
        className="w-10 h-10 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-muted)]"
      >
        <ArrowLeft size={18} />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold text-[var(--color-text)] truncate">{planoNome}</h1>
        <p className="text-xs text-[var(--color-text-muted)] capitalize mt-0.5">{dataStr}</p>
      </div>
      {editando ? (
        <div className="flex gap-2">
          <button onClick={onCancelarEdicao} className="btn-ghost p-2.5 text-text-muted text-sm">
            Cancelar
          </button>
          <button onClick={onSalvarEdicao} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
            <Save size={14} /> Salvar
          </button>
        </div>
      ) : (
        <button onClick={onIniciarEdicao} className="btn-ghost p-2.5">
          <Edit2 size={16} />
        </button>
      )}
    </div>
  )
}
