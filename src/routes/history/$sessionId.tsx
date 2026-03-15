import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useHistory } from '../../hooks/useHistory'
import { useHistoryStore, useActiveWorkoutStore } from '../../stores'
import { calcularRecordes } from '../../lib/records'
import { useSessionEdit } from '../../hooks/useSessionEdit'
import { useMemo } from 'react'
import { SessionDetailHeader } from './components/-SessionDetailHeader'
import { SessionStats } from './components/-SessionStats'
import { SetsProgress } from './components/-SetsProgress'
import { ReturnToWorkoutButton } from './components/-ReturnToWorkoutButton'
import { WorkoutNotes } from './components/-WorkoutNotes'
import { ExerciseSessionCard } from './components/-ExerciseSessionCard'

export const Route = createFileRoute('/history/$sessionId')({
  component: SessaoDetalhePage,
})

function SessaoDetalhePage() {
  const { sessionId } = Route.useParams()
  const navigate = useNavigate()
  const { sessions, saveSessionComplete } = useHistory()
  const allSessions = useHistoryStore((s) => s.sessions)
  const session = sessions.find((s) => s.id === sessionId)
  const restoreFromHistory = useActiveWorkoutStore(
    (s) => s.restoreFromHistory
  )

  const edicao = useSessionEdit(session, saveSessionComplete)
  const {
    editando,
    editData,
    displaySessao,
    iniciarEdicao,
    salvarEdicao,
    cancelarEdicao,
    updateSerie,
    updateDuracao,
    updateIniciadoEm,
  } = edicao

  const recordesSemAtual = useMemo(
    () => calcularRecordes(allSessions.filter((s) => s.id !== sessionId)),
    [allSessions, sessionId]
  )

  if (!session) {
    return (
      <div className="page-container pt-6 text-center">
        <p className="text-text-muted">Sessão não encontrada.</p>
        <Link
          to="/history"
          className="text-accent text-sm mt-2 block"
          style={{ textDecoration: 'none' }}
        >
          Voltar
        </Link>
      </div>
    )
  }

  const data = new Date(displaySessao!.startedAt)
  const dataStr = data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const totalSeries = displaySessao!.exercises.reduce(
    (s, ex) => s + ex.sets.length,
    0
  )
  const seriesOk = displaySessao!.exercises.reduce(
    (s, ex) => s + ex.sets.filter((sr) => sr.completed).length,
    0
  )

  return (
    <div className="page-container pt-4">
      <SessionDetailHeader
        planName={displaySessao!.planName}
        dataStr={dataStr}
        editando={editando}
        autoClosed={displaySessao!.autoClosed}
        startedAt={
          editando && editData ? editData.startedAt : displaySessao!.startedAt
        }
        finishedAt={displaySessao!.finishedAt}
        onStartedAtChange={editando ? updateIniciadoEm : undefined}
        onVoltar={() => navigate({ to: '/history' })}
        onIniciarEdicao={iniciarEdicao}
        onCancelarEdicao={cancelarEdicao}
        onSalvarEdicao={salvarEdicao}
      />

      <SessionStats
        durationSeconds={displaySessao!.durationSeconds}
        numExercicios={displaySessao!.exercises.length}
        totalVolume={displaySessao!.totalVolume}
        editando={editando}
        durationMinutes={
          editData?.durationSeconds != null
            ? Math.round(editData.durationSeconds / 60)
            : undefined
        }
        onDurationChange={editando ? updateDuracao : undefined}
        idleSecondsDeducted={displaySessao!.idleSecondsDeducted}
      />

      <SetsProgress seriesOk={seriesOk} totalSeries={totalSeries} />

      <ReturnToWorkoutButton
        onClick={() => {
          restoreFromHistory(displaySessao!)
          navigate({
            to: '/active-workout/$planId',
            params: { planId: displaySessao!.planId },
          })
        }}
      />

      {displaySessao!.notes && (
        <WorkoutNotes notas={displaySessao!.notes} />
      )}

      <div className="flex flex-col gap-3">
        {displaySessao!.exercises.map((ex, eIdx) => (
          <ExerciseSessionCard
            key={`${ex.exerciseId}-${eIdx}`}
            ex={ex}
            exIdx={eIdx}
            editando={editando}
            recordesSemAtual={recordesSemAtual}
            onUpdateSerie={updateSerie}
          />
        ))}
      </div>
    </div>
  )
}
