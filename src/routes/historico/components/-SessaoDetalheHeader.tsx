import { ArrowLeft, Edit2, Save, TimerOff } from 'lucide-react'

interface SessaoDetalheHeaderProps {
  planoNome: string
  dataStr: string
  editando: boolean
  /** Treino encerrado automaticamente por inatividade */
  autoEncerrado?: boolean
  /** Timestamp (iniciadoEm) para edição da data; quando editando, permite alterar */
  iniciadoEm?: number
  /** Timestamp (finalizadoEm) para exibir hora de fim */
  finalizadoEm?: number
  onIniciadoEmChange?: (timestamp: number) => void
  onVoltar: () => void
  onIniciarEdicao: () => void
  onCancelarEdicao: () => void
  onSalvarEdicao: () => void
}

function toDateInputValue(timestamp: number): string {
  const d = new Date(timestamp)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatarHora(ts: number): string {
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function SessaoDetalheHeader({
  planoNome,
  dataStr,
  editando,
  autoEncerrado,
  iniciadoEm,
  finalizadoEm,
  onIniciadoEmChange,
  onVoltar,
  onIniciarEdicao,
  onCancelarEdicao,
  onSalvarEdicao,
}: SessaoDetalheHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6 animate-fade-up">
      <button
        onClick={onVoltar}
        className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-muted"
      >
        <ArrowLeft size={18} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-text truncate">{planoNome}</h1>
          {autoEncerrado && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 text-[10px] font-medium border border-amber-500/25 shrink-0">
              <TimerOff size={10} />
              Encerrado automaticamente
            </span>
          )}
        </div>
        {editando && iniciadoEm != null && onIniciadoEmChange ? (
          <label className="block mt-1">
            <span className="text-xs text-text-muted block mb-1">Data do treino</span>
            <input
              type="date"
              value={toDateInputValue(iniciadoEm)}
              onChange={(e) => {
                const v = e.target.value
                if (!v) return
                const [y, m, d] = v.split('-').map(Number)
                const ts = new Date(y, m - 1, d).getTime()
                onIniciadoEmChange(ts)
              }}
              className="text-xs bg-surface-2 text-text rounded-lg px-2 py-1.5 border border-border focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </label>
        ) : (
          <div className="mt-0.5 space-y-0.5">
            <p className="text-xs text-text-muted capitalize">{dataStr}</p>
            <p className="text-xs text-text-subtle">
              Início {iniciadoEm != null ? formatarHora(iniciadoEm) : '–'}
              {finalizadoEm != null && (
                <> · Fim {formatarHora(finalizadoEm)}</>
              )}
            </p>
          </div>
        )}
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
