import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTreinoAtivoStore } from '../stores'
import { AlertTriangle, Play } from 'lucide-react'

export function useIniciarTreino() {
  const navigate = useNavigate()
  const treinoAtivo = useTreinoAtivoStore((s) => s.iniciado)
  const sessao = useTreinoAtivoStore((s) => s.sessao)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const handleIniciar = (planoId: string) => {
    if (treinoAtivo && sessao?.planoId !== planoId) {
      setPendingId(planoId)
    } else {
      navigate({ to: '/treino-ativo/$planoId', params: { planoId } })
    }
  }

  const confirmar = () => {
    if (!pendingId) return
    navigate({ to: '/treino-ativo/$planoId', params: { planoId: pendingId } })
    setPendingId(null)
  }

  const cancelar = () => setPendingId(null)

  const modal = pendingId ? (
    <div
      className="fixed inset-0 z-200 flex items-end justify-center"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      onClick={cancelar}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-md bg-surface rounded-t-3xl p-6 pb-10 space-y-4 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-amber-400" />
          </div>
          <div>
            <p className="font-bold text-text">Treino em andamento</p>
            <p className="text-xs text-text-muted mt-0.5">
              Iniciar um novo treino irá encerrar o treino atual.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            className="btn-primary w-full flex items-center justify-center gap-2"
            onClick={confirmar}
          >
            <Play size={15} />
            Iniciar novo treino
          </button>
          <button className="btn-secondary w-full" onClick={cancelar}>
            Continuar treino atual
          </button>
        </div>
      </div>
    </div>
  ) : null

  return { handleIniciar, modal }
}
