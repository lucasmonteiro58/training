import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useHistory } from '../../hooks/useHistory'
import { useHistoryStore, useActiveWorkoutStore } from '../../stores'
import { calculateRecords } from '../../lib/records'
import { useSessionEdit } from '../../hooks/useSessionEdit'
import { useMemo, useState } from 'react'
import { SessionDetailHeader } from './components/-SessionDetailHeader'
import { SessionStats } from './components/-SessionStats'
import { SetsProgress } from './components/-SetsProgress'
import { ReturnToWorkoutButton } from './components/-ReturnToWorkoutButton'
import { WorkoutNotes } from './components/-WorkoutNotes'
import { ExerciseSessionCard } from './components/-ExerciseSessionCard'
import { ConfirmReplaceWorkoutModal } from './components/-ConfirmReplaceWorkoutModal'

export const Route = createFileRoute('/history/$sessionId')({
  component: SessaoDetalhePage,
})

function SessaoDetalhePage() {
  const { sessionId } = Route.useParams()
  const navigate = useNavigate()
  const { sessions, saveSessionComplete, deleteSessionById } = useHistory()
  const allSessions = useHistoryStore((s) => s.sessions)
  const removeSession = useHistoryStore((s) => s.removeSession)
  const session = sessions.find((s) => s.id === sessionId)
  const restoreFromHistory = useActiveWorkoutStore(
    (s) => s.restoreFromHistory
  )
  const hasActiveWorkout = useActiveWorkoutStore((s) => s.started && s.session != null)
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false)

  const doRestoreAndNavigate = () => {
    if (!displaySession) return
    removeSession(displaySession.id)
    restoreFromHistory(displaySession)
    deleteSessionById(displaySession.id)
    navigate({
      to: '/active-workout/$planId',
      params: { planId: displaySession.planId },
    })
  }

  const sessionEdit = useSessionEdit(session, saveSessionComplete)
  const {
    isEditing,
    editData,
    displaySession,
    startEditing,
    saveEdit,
    cancelEdit,
    updateSet,
    updateDuration,
    updateStartedAt,
  } = sessionEdit

  const recordsExcludingCurrent = useMemo(
    () => calculateRecords(allSessions.filter((s) => s.id !== sessionId)),
    [allSessions, sessionId]
  )

  if (!session) {
    return (
      <div className="page-container pt-6 text-center">
        <p className="text-text-muted">Session not found.</p>
        <Link
          to="/history"
          className="text-accent text-sm mt-2 block"
          style={{ textDecoration: 'none' }}
        >
          Back
        </Link>
      </div>
    )
  }

  const date = new Date(displaySession!.startedAt)
  const dateStr = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const totalSeries = displaySession!.exercises.reduce(
    (s, ex) => s + ex.sets.length,
    0
  )
  const seriesOk = displaySession!.exercises.reduce(
    (s, ex) => s + ex.sets.filter((sr) => sr.completed).length,
    0
  )

  return (
    <div className="page-container pt-4">
      <SessionDetailHeader
        planName={displaySession!.planName}
        dateStr={dateStr}
        isEditing={isEditing}
        autoClosed={displaySession!.autoClosed}
        startedAt={
          isEditing && editData ? editData.startedAt : displaySession!.startedAt
        }
        finishedAt={displaySession!.finishedAt}
        onStartedAtChange={isEditing ? updateStartedAt : undefined}
        onBack={() => navigate({ to: '/history' })}
        onStartEdit={startEditing}
        onCancelEdit={cancelEdit}
        onSaveEdit={saveEdit}
      />

      <SessionStats
        durationSeconds={displaySession!.durationSeconds}
        numExercises={displaySession!.exercises.length}
        totalVolume={displaySession!.totalVolume}
        editing={isEditing}
        durationMinutes={
          editData?.durationSeconds != null
            ? Math.round(editData.durationSeconds / 60)
            : undefined
        }
        onDurationChange={isEditing ? updateDuration : undefined}
        idleSecondsDeducted={displaySession!.idleSecondsDeducted}
      />

      <SetsProgress seriesOk={seriesOk} totalSeries={totalSeries} />

      <ReturnToWorkoutButton
        onClick={() => {
          if (hasActiveWorkout) {
            setShowReplaceConfirm(true)
          } else {
            doRestoreAndNavigate()
          }
        }}
      />

      {showReplaceConfirm && (
        <ConfirmReplaceWorkoutModal
          onConfirm={() => {
            doRestoreAndNavigate()
            setShowReplaceConfirm(false)
          }}
          onCancel={() => setShowReplaceConfirm(false)}
        />
      )}

      {displaySession!.notes && (
        <WorkoutNotes notes={displaySession!.notes} />
      )}

      <div className="flex flex-col gap-3">
        {displaySession!.exercises.map((ex, eIdx) => (
          <ExerciseSessionCard
            key={`${ex.exerciseId}-${eIdx}`}
            ex={ex}
            exIdx={eIdx}
            editing={isEditing}
            recordsExcludingCurrent={recordsExcludingCurrent}
            onUpdateSet={updateSet}
          />
        ))}
      </div>
    </div>
  )
}
