import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useHistory } from '../../hooks/useHistory'
import { useActiveWorkoutStore } from '../../stores'
import { useMemo, useState } from 'react'
import { HistoryHeader } from './components/-HistoryHeader'
import { HistoryFilters, type Periodo } from './components/-HistoryFilters'
import { VolumeChart } from './components/-VolumeChart'
import { EmptyHistory } from './components/-EmptyHistory'
import { SessionCard } from './components/-SessionCard'
import { ConfirmDeleteModal } from './components/-ConfirmDeleteModal'

export const Route = createFileRoute('/history/')({
  component: HistoricoPage,
})

function HistoricoPage() {
  const navigate = useNavigate()
  const { sessions, loading, deleteSessionById } = useHistory()
  const restoreFromHistory = useActiveWorkoutStore(s => s.restoreFromHistory)
  const [confirmExcluir, setConfirmExcluir] = useState<string | null>(null)
  const [filtroPlano, setFiltroPlano] = useState<string>('todos')
  const [filtroPeriodo, setFiltroPeriodo] = useState<Periodo>('todos')
  const [showFiltros, setShowFiltros] = useState(false)

  const sessoesNomes = useMemo(() => {
    const nomes = new Set<string>()
    sessions.forEach(s => nomes.add(s.planoNome))
    return Array.from(nomes).sort()
  }, [sessions])

  const sessoesFiltradas = useMemo(() => {
    let resultado = sessions
    if (filtroPlano !== 'todos') {
      resultado = resultado.filter(s => s.planoNome === filtroPlano)
    }
    if (filtroPeriodo !== 'todos') {
      const agora = Date.now()
      const dias = filtroPeriodo === '7d' ? 7 : filtroPeriodo === '30d' ? 30 : 90
      const limite = agora - dias * 24 * 60 * 60 * 1000
      resultado = resultado.filter(s => s.iniciadoEm >= limite)
    }
    return resultado
  }, [sessions, filtroPlano, filtroPeriodo])

  const filtroAtivo = filtroPlano !== 'todos' || filtroPeriodo !== 'todos'

  const dadosGrafico = useMemo(() => {
    const semanas: Record<string, number> = {}
    sessoesFiltradas.forEach((s) => {
      const d = new Date(s.iniciadoEm)
      const inicio = new Date(d)
      inicio.setDate(d.getDate() - d.getDay())
      const chave = inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      semanas[chave] = (semanas[chave] ?? 0) + (s.volumeTotal ?? 0)
    })
    return Object.entries(semanas)
      .slice(-8)
      .map(([semana, volume]) => ({ semana, volume: Math.round(volume) }))
  }, [sessoesFiltradas])

  const handleLimparFiltros = () => {
    setFiltroPlano('todos')
    setFiltroPeriodo('todos')
  }

  return (
    <div className="page-container pt-6">
      <HistoryHeader
        hasSessoes={sessions.length > 0}
        filtroAtivo={filtroAtivo}
        onVoltar={() => navigate({ to: '/profile' })}
        onToggleFiltros={() => setShowFiltros(v => !v)}
      />

      {showFiltros && (
        <HistoryFilters
          filtroPlano={filtroPlano}
          filtroPeriodo={filtroPeriodo}
          filtroAtivo={filtroAtivo}
          sessoesNomes={sessoesNomes}
          onPlanoChange={setFiltroPlano}
          onPeriodoChange={setFiltroPeriodo}
          onLimpar={handleLimparFiltros}
        />
      )}

      <VolumeChart dados={dadosGrafico} />

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : sessoesFiltradas.length === 0 ? (
        <EmptyHistory filtroAtivo={filtroAtivo} onLimparFiltros={handleLimparFiltros} />
      ) : (
        <div className="flex flex-col gap-3">
          {filtroAtivo && (
            <p className="text-xs text-text-muted mb-1">
              {sessoesFiltradas.length} resultado{sessoesFiltradas.length !== 1 ? 's' : ''}
            </p>
          )}
          {sessoesFiltradas.map((sessao, idx) => (
            <SessionCard
              key={sessao.id}
              sessao={sessao}
              index={idx}
              onExcluir={setConfirmExcluir}
              onRetornar={restoreFromHistory}
            />
          ))}
        </div>
      )}

      {confirmExcluir && (
        <ConfirmDeleteModal
          onConfirm={() => {
            deleteSessionById(confirmExcluir)
            setConfirmExcluir(null)
          }}
          onCancel={() => setConfirmExcluir(null)}
        />
      )}
    </div>
  )
}
