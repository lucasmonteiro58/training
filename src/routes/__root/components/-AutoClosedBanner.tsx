import { useNavigate } from '@tanstack/react-router'
import { useHistoryStore } from '../../../stores'
import { useHistory } from '../../../hooks/useHistory'
import { useActiveWorkoutStore } from '../../../stores'

export function AutoClosedBanner() {
  const navigate = useNavigate()
  const sessaoAutoEncerrada = useHistoryStore(s => s.sessaoAutoEncerrada)
  const setSessaoAutoEncerrada = useHistoryStore(s => s.setSessaoAutoEncerrada)
  const { excluirSessao } = useHistory()
  const restaurarDeAutoEncerrado = useActiveWorkoutStore(s => s.restaurarDeAutoEncerrado)

  if (!sessaoAutoEncerrada) return null

  const handleRetornar = () => {
    excluirSessao(sessaoAutoEncerrada.sessao.id)
    restaurarDeAutoEncerrado(sessaoAutoEncerrada)
    setSessaoAutoEncerrada(null)
    navigate({
      to: '/active-workout/$planId',
      params: { planId: sessaoAutoEncerrada.sessao.planoId },
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
