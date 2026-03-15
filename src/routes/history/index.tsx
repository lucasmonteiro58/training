import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useHistory } from '../../hooks/useHistory'
import { useActiveWorkoutStore, useHistoryStore } from '../../stores'
import { useMemo, useState } from 'react'
import { HistoryHeader } from './components/-HistoryHeader'
import { HistoryFilters, type Period } from './components/-HistoryFilters'
import { VolumeChart } from './components/-VolumeChart'
import { EmptyHistory } from './components/-EmptyHistory'
import { SessionCard } from './components/-SessionCard'
import { ConfirmDeleteModal } from './components/-ConfirmDeleteModal'

export const Route = createFileRoute('/history/')({
  component: HistoryPage,
})

function HistoryPage() {
  const navigate = useNavigate()
  const { sessions, loading, deleteSessionById } = useHistory()
  const restoreFromHistory = useActiveWorkoutStore(s => s.restoreFromHistory)
  const removeSession = useHistoryStore(s => s.removeSession)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [planFilter, setPlanFilter] = useState<string>('todos')
  const [periodFilter, setPeriodFilter] = useState<Period>('todos')
  const [showFilters, setShowFilters] = useState(false)

  const sessionNames = useMemo(() => {
    const names = new Set<string>()
    sessions.forEach(s => names.add(s.planName))
    return Array.from(names).sort()
  }, [sessions])

  const filteredSessions = useMemo(() => {
    let result = sessions
    if (planFilter !== 'todos') {
      result = result.filter(s => s.planName === planFilter)
    }
    if (periodFilter !== 'todos') {
      const now = Date.now()
      const days = periodFilter === '7d' ? 7 : periodFilter === '30d' ? 30 : 90
      const limit = now - days * 24 * 60 * 60 * 1000
      result = result.filter(s => s.startedAt >= limit)
    }
    return result
  }, [sessions, planFilter, periodFilter])

  const hasActiveFilter = planFilter !== 'todos' || periodFilter !== 'todos'

  const chartData = useMemo(() => {
    const weeks: Record<string, number> = {}
    filteredSessions.forEach((s) => {
      const d = new Date(s.startedAt)
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())
      const key = weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      weeks[key] = (weeks[key] ?? 0) + (s.totalVolume ?? 0)
    })
    return Object.entries(weeks)
      .slice(-8)
      .map(([week, volume]) => ({ week, volume: Math.round(volume) }))
  }, [filteredSessions])

  const clearFilters = () => {
    setPlanFilter('todos')
    setPeriodFilter('todos')
  }

  return (
    <div className="page-container pt-6">
      <HistoryHeader
        hasSessions={sessions.length > 0}
        hasActiveFilter={hasActiveFilter}
        onBack={() => navigate({ to: '/profile' })}
        onToggleFilters={() => setShowFilters(v => !v)}
      />

      {showFilters && (
        <HistoryFilters
          planFilter={planFilter}
          periodFilter={periodFilter}
          hasActiveFilter={hasActiveFilter}
          sessionNames={sessionNames}
          onPlanChange={setPlanFilter}
          onPeriodChange={setPeriodFilter}
          onClear={clearFilters}
        />
      )}

      <VolumeChart data={chartData} />

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : filteredSessions.length === 0 ? (
        <EmptyHistory hasActiveFilter={hasActiveFilter} onClearFilters={clearFilters} />
      ) : (
        <div className="flex flex-col gap-3">
          {hasActiveFilter && (
            <p className="text-xs text-text-muted mb-1">
              {filteredSessions.length} resultado{filteredSessions.length !== 1 ? 's' : ''}
            </p>
          )}
          {filteredSessions.map((session, idx) => (
            <SessionCard
              key={session.id}
              session={session}
              index={idx}
              onDelete={setConfirmDeleteId}
              onRestore={(session) => {
                removeSession(session.id)
                restoreFromHistory(session)
                deleteSessionById(session.id)
              }}
            />
          ))}
        </div>
      )}

      {confirmDeleteId && (
        <ConfirmDeleteModal
          onConfirm={() => {
            deleteSessionById(confirmDeleteId)
            setConfirmDeleteId(null)
          }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  )
}
