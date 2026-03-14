import { useNavigate } from '@tanstack/react-router'
import { useHistoricoStore } from '../../../stores'
import { useHistorico } from '../../../hooks/useHistorico'
import { useTreinoAtivoStore } from '../../../stores'

export function AutoEncerradoBanner() {
  const navigate = useNavigate()
  const sessaoAutoEncerrada = useHistoricoStore(s => s.sessaoAutoEncerrada)
  const setSessaoAutoEncerrada = useHistoricoStore(s => s.setSessaoAutoEncerrada)
  const { excluirSessao } = useHistorico()
  const restaurarDeAutoEncerrado = useTreinoAtivoStore(s => s.restaurarDeAutoEncerrado)

  if (!sessaoAutoEncerrada) return null

  const handleRetornar = () => {
    excluirSessao(sessaoAutoEncerrada.sessao.id)
    restaurarDeAutoEncerrado(sessaoAutoEncerrada)
    setSessaoAutoEncerrada(null)
    navigate({
      to: '/treino-ativo/$planoId',
      params: { planoId: sessaoAutoEncerrada.sessao.planoId },
    })
  }

  const handleFechar = () => {
    setSessaoAutoEncerrada(null)
  }

  return (
    <div className="mx-4 mt-4 mb-1 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 animate-scale-in">
      <p className="text-sm font-semibold text-amber-200 mb-1">Treino encerrado por inatividade</p>
      <p className="text-xs text-text-muted mb-3">
        Não houve interação nos últimos 20 minutos. Você pode retornar ao treino ou continuar depois.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleRetornar}
          className="btn-primary py-2 px-4 text-sm flex-1"
        >
          Retornar ao treino
        </button>
        <button type="button" onClick={handleFechar} className="btn-ghost py-2 px-4 text-sm">
          Fechar
        </button>
      </div>
    </div>
  )
}
