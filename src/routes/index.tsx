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
import { StreakMetaSection } from './index/components/-StreakMetaSection'
import { WeekDaysCard } from './index/components/-WeekDaysCard'
import { NextWorkoutSection } from './index/components/-NextWorkoutSection'
import { GroupFrequencyCard } from './index/components/-GroupFrequencyCard'
import { MyPlansSection } from './index/components/-MyPlansSection'
import { LastWorkoutsSection } from './index/components/-LastWorkoutsSection'
import { EditMetaModal } from './index/components/-EditMetaModal'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const DIAS_DA_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function HomePage() {
  const user = useAuthStore((s) => s.user)
  const { activePlans, loading, sync: syncPlans } = usePlans()
  const { sessions, loading: loadingSessions, sync: syncSessions } =
    useHistory()
  const [sincronizando, setSincronizando] = useState(false)
  const [showEditMeta, setShowEditMeta] = useState(false)
  const [metaInput, setMetaInput] = useState('4')

  const treinoAtivo = useActiveWorkoutStore((s) => s.started)
  const sessaoAtiva = useActiveWorkoutStore((s) => s.session)
  const exercicioAtualIndex = useActiveWorkoutStore((s) => s.currentExerciseIndex)
  const pausado = useActiveWorkoutStore((s) => s.paused)
  const totalTimerSeconds = useActiveWorkoutStore(
    (s) => s.totalTimerSeconds
  )

  const { metaSemanal, diasOpcionais, handleSaveMeta } =
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
    metaSemanal,
    diasOpcionais,
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

  const nome = user?.displayName?.split(' ')[0] ?? 'Atleta'
  const hora = new Date().getHours()
  const saudacao =
    hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const exercicioAtual = sessaoAtiva?.exercicios[exercicioAtualIndex]

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
        saudacao={saudacao}
        nome={nome}
        onSync={async () => {
          setSincronizando(true)
          await Promise.all([syncPlans(), syncSessions()])
          setSincronizando(false)
        }}
        sincronizando={sincronizando}
      />

      {treinoAtivo && sessaoAtiva && (
        <ActiveWorkoutBanner
          planoId={sessaoAtiva.planoId}
          pausado={pausado}
          cronometroGeralSegundos={totalTimerSeconds}
          exercicioAtualNome={exercicioAtual?.exercicioNome ?? null}
          planoNome={sessaoAtiva.planoNome}
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
          treinosSemana={workoutsThisWeek}
          volumeTotal={totalVolume}
          treinosTotal={sessions.length}
        />
      )}

      {!isLoading && sessions.length > 0 && (
        <StreakMetaSection
          streakAtual={streaks.streakAtual}
          treinosEstaSemana={streaks.treinosEstaSemana}
          metaSemanal={streaks.metaSemanal}
          onEditMeta={() => {
            setMetaInput(String(metaSemanal))
            setShowEditMeta(true)
          }}
        />
      )}


      <WeekDaysCard
        diasDaSemana={DIAS_DA_SEMANA}
        inicioSemana={weekStart}
        hoje={today}
        sessoes={sessions}
        diasOpcionais={diasOpcionais}
      />

      {!treinoAtivo && nextPlan && (
        <NextWorkoutSection
          proximoPlano={nextPlan}
          ultimaSessao={lastSession}
        />
      )}

      {!isLoading && sessions.length > 0 && (
        <GroupFrequencyCard alertas={groupAlerts} />
      )}

      <MyPlansSection planos={activePlans} carregando={isLoading} />

      <LastWorkoutsSection
        sessoes={lastSessions.map(s => ({
          id: s.id,
          planoNome: s.planoNome,
          iniciadoEm: s.iniciadoEm,
          duracaoSegundos: s.duracaoSegundos,
          volumeTotal: s.volumeTotal,
        }))}
        carregando={isLoading}
      />

      {showEditMeta && (
        <EditMetaModal
          metaInput={metaInput}
          onMetaInputChange={setMetaInput}
          onSave={handleSaveMeta}
          onClose={() => setShowEditMeta(false)}
        />
      )}
    </div>
  )
}
