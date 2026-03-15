import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuthStore } from '../stores'
import { useHistory } from '../hooks/useHistory'
import { usePlans } from '../hooks/usePlans'
import { useActiveWorkoutStore } from '../stores'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { useUserConfig } from '../hooks/useUserConfig'
import { useHomeStats } from '../hooks/useHomeStats'
import { HomeHeader } from './index/components/-HomeHeader'
import { PullToRefreshIndicator } from './index/components/-PullToRefreshIndicator'
import { ActiveWorkoutBanner } from './index/components/-ActiveWorkoutBanner'
import { HomeStats } from './index/components/-HomeStats'
import { StreakGoalSection } from './index/components/-StreakMetaSection'
import { WeekDaysCard } from './index/components/-WeekDaysCard'
import { NextWorkoutSection } from './index/components/-NextWorkoutSection'
import { GroupFrequencyCard } from './index/components/-GroupFrequencyCard'
import { MyPlansSection } from './index/components/-MyPlansSection'
import { LastWorkoutsSection } from './index/components/-LastWorkoutsSection'
import { EditGoalModal } from './index/components/-EditMetaModal'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function HomePage() {
  const user = useAuthStore((s) => s.user)
  const { activePlans, loading, sync: syncPlans } = usePlans()
  const { sessions, loading: loadingSessions, sync: syncSessions } =
    useHistory()
  const [syncing, setSyncing] = useState(false)
  const [showEditGoal, setShowEditGoal] = useState(false)
  const [goalInput, setGoalInput] = useState('4')

  const hasActiveWorkout = useActiveWorkoutStore((s) => s.started)
  const activeSession = useActiveWorkoutStore((s) => s.session)
  const currentExerciseIndex = useActiveWorkoutStore((s) => s.currentExerciseIndex)
  const isPaused = useActiveWorkoutStore((s) => s.paused)
  const totalTimerSeconds = useActiveWorkoutStore(
    (s) => s.totalTimerSeconds
  )

  const { weeklyGoal, optionalDays, handleSaveGoal } =
    useUserConfig(user)

  const {
    pullDistance,
    isRefreshing,
    containerRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    threshold: pullThreshold,
  } = usePullToRefresh(async () => {
    await Promise.all([syncPlans(), syncSessions()])
  })

  const stats = useHomeStats({
    sessions,
    activePlans,
    weeklyGoal,
    optionalDays,
    loading,
    loadingSessions,
  })
  const {
    workoutsThisWeek,
    totalVolume,
    lastSessions,
    isLoading,
    streaks,
    nextPlan,
    groupAlerts,
    today,
    weekStart,
    lastSession,
  } = stats

  const firstName = user?.displayName?.split(' ')[0] ?? 'Atleta'
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const currentExercise = activeSession?.exercises[currentExerciseIndex]

  return (
    <div
      ref={containerRef}
      className="page-container pt-6 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        threshold={pullThreshold}
      />

      <HomeHeader
        greeting={greeting}
        name={firstName}
        onSync={async () => {
          setSyncing(true)
          await Promise.all([syncPlans(), syncSessions()])
          setSyncing(false)
        }}
        isSyncing={syncing}
      />

      {hasActiveWorkout && activeSession && (
        <ActiveWorkoutBanner
          planId={activeSession.planId}
          isPaused={isPaused}
          totalTimerSeconds={totalTimerSeconds}
          currentExerciseName={currentExercise?.exerciseName ?? null}
          planName={activeSession.planName}
        />
      )}

      {isLoading ? (
        <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-up" style={{ animationDelay: '50ms' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-[88px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <HomeStats
          workoutsThisWeek={workoutsThisWeek}
          totalVolume={totalVolume}
          totalWorkouts={sessions.length}
        />
      )}

      {!isLoading && sessions.length > 0 && (
        <StreakGoalSection
          currentStreak={streaks.currentStreak}
          workoutsThisWeek={streaks.workoutsThisWeek}
          weeklyGoal={streaks.weeklyGoal}
          onEditGoal={() => {
            setGoalInput(String(weeklyGoal))
            setShowEditGoal(true)
          }}
        />
      )}


      <WeekDaysCard
        weekDayLabels={WEEKDAY_LABELS}
        weekStart={weekStart}
        today={today}
        sessions={sessions}
        optionalDays={optionalDays}
      />

      {!hasActiveWorkout && nextPlan && (
        <NextWorkoutSection
          nextPlan={nextPlan}
          lastSession={lastSession}
        />
      )}

      {!isLoading && sessions.length > 0 && (
        <GroupFrequencyCard groupAlerts={groupAlerts} />
      )}

      <MyPlansSection plans={activePlans} loading={isLoading} />

      <LastWorkoutsSection
        sessions={lastSessions.map(s => ({
          id: s.id,
          planName: s.planName,
          startedAt: s.startedAt,
          durationSeconds: s.durationSeconds,
          totalVolume: s.totalVolume,
        }))}
        loading={isLoading}
      />

      {showEditGoal && (
        <EditGoalModal
          goalInput={goalInput}
          onGoalInputChange={setGoalInput}
          onSave={handleSaveGoal}
          onClose={() => setShowEditGoal(false)}
        />
      )}
    </div>
  )
}
