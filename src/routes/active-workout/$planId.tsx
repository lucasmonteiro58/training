import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState, useMemo } from 'react'
import { usePlans } from '../../hooks/usePlans'
import { useHistory } from '../../hooks/useHistory'
import { useAuthStore, useActiveWorkoutStore, useHistoryStore } from '../../stores'
import {
  clearWorkoutNotifications,
  cancelRestNotification,
  formatDuration,
} from '../../lib/notifications'
import { useSetTimer } from '../../hooks/useSetTimer'
import { useRestNotifications } from '../../hooks/useRestNotifications'
import { useSaveWeightsToPlan } from '../../hooks/useSaveWeightsToPlan'
import { useStartWorkoutSession } from '../../hooks/useStartWorkoutSession'
import { useCompleteWorkoutSet } from '../../hooks/useCompleteWorkoutSet'
import type { WorkoutSession } from '../../types'
import { toast } from 'sonner'
import { calculate1RM } from '../../lib/calculadora1rm'
import { calculateRecords } from '../../lib/records'
import { CheckCircle, SkipForward, Timer, Zap } from 'lucide-react'
import { Confetti } from '../../components/ui/Confetti'
import { generateReportImage } from '../../lib/relatorioImage'
import { WorkoutReportScreen } from './components/-WorkoutReportScreen'
import { ActiveWorkoutHeader } from './components/-ActiveWorkoutHeader'
import { RestCard } from './components/-RestCard'
import { ConfirmCancelModal } from './components/-ConfirmCancelModal'
import { ConfirmFinishModal } from './components/-ConfirmFinishModal'
import { ExerciseInfoModal } from './components/-ExerciseInfoModal'
import { WorkoutNotesModal } from './components/-WorkoutNotesModal'
import { PRCelebrationOverlay } from './components/-PRCelebrationOverlay'

export const Route = createFileRoute('/active-workout/$planId')({
  component: ActiveWorkoutPage,
})

function ActiveWorkoutPage() {
  const { planId } = Route.useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { plans, loading: plansLoading, updatePlanById } = usePlans()
  const { saveSessionComplete } = useHistory()
  const plan = plans.find((p) => p.id === planId)
  const sessions = useHistoryStore((s) => s.sessions)
  const records = useMemo(() => calculateRecords(sessions), [sessions])

  const store = useActiveWorkoutStore()
  const {
    session, currentExerciseIndex, totalTimerSeconds,
    restTimerSeconds, restTimerActive,
    paused, started,
    startWorkout, finishWorkout, pauseWorkout, resume,
    nextExercise, previousExercise, updateSet,
    markSetCompleted,
    startRest, stopRest, tickTotal, tickRest,
    updateNotes, clearLocal, heartbeat,
  } = store

  const timerRef = useRef<number | null>(null)
  const restIntervalRef = useRef<number | null>(null)

  const [applyAll, setApplyAll] = useState<{ field: 'weight' | 'reps'; sIdx: number; value: number } | null>(null)
  const { saveWeightsToPlan } = useSaveWeightsToPlan(
    plan ?? undefined,
    session,
    currentExerciseIndex,
    updatePlanById,
    () => setApplyAll(null)
  )

  const { timerSet: setTimer, startSetTimer, stopSetTimer } = useSetTimer(currentExerciseIndex)
  const { restEndedNaturalRef } = useRestNotifications({
    restTimerActive,
    restTimerSeconds,
    session,
    currentExerciseIndex,
  })

  // Heartbeat: atualiza Firestore a cada 1 min para não encerrar por inatividade (20 min)
  useEffect(() => {
    if (!started || !session) return
    const id = setInterval(heartbeat, 60 * 1000)
    return () => clearInterval(id)
  }, [started, session, heartbeat])

  const [finishing, setFinishing] = useState(false)
  const [showFinishConfirm, setShowFinishConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [report, setReport] = useState<WorkoutSession | null>(null)
  const [copied, setCopied] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [notesDraft, setNotesDraft] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [showPrCelebration, setShowPrCelebration] = useState(false)

  useStartWorkoutSession({
    planId,
    plan: plan ?? undefined,
    user,
    sessions,
    started,
    session,
    startWorkout,
  })

  const { handleCompleteSet } = useCompleteWorkoutSet({
    session,
    currentExerciseIndex,
    records,
    saveWeightsToPlan,
    markSetCompleted,
    updateSet,
    startRest,
    nextExercise,
    previousExercise,
    stopRest,
    cancelRestNotification,
    restEndedNaturalRef,
    onPrDetected: () => {
      setShowPrCelebration(true)
      setShowConfetti(true)
      navigator.vibrate?.([100, 50, 100, 50, 200])
      setTimeout(() => {
        setShowPrCelebration(false)
        setShowConfetti(false)
      }, 3000)
    },
    onWorkoutComplete: () => setShowFinishConfirm(true),
  })

  // ─── Cronômetro geral ──────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = window.setInterval(() => { tickTotal() }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [tickTotal])

  // ─── Cronômetro de descanso ────────────────────────────────────────────────
  useEffect(() => {
    if (!restTimerActive) {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current)
      return
    }
    restIntervalRef.current = window.setInterval(() => { tickRest() }, 1000)
    return () => { if (restIntervalRef.current) clearInterval(restIntervalRef.current) }
  }, [restTimerActive, tickRest])

  const currentExercise = session?.exercises[currentExerciseIndex]
  const planExercise = plan?.exercises.find((ex) => ex.exerciseId === currentExercise?.exerciseId)
  const totalExercises = session?.exercises.length ?? 0
  const progress = totalExercises ? (currentExerciseIndex / totalExercises) * 100 : 0

  const handleFinish = async () => {
    // Salvar pesos do exercício atual antes de finalizar
    saveWeightsToPlan()
    setFinishing(true)
    const finishedSession = finishWorkout()
    cancelRestNotification()
    clearWorkoutNotifications()
    if (finishedSession) {
      await saveSessionComplete(finishedSession)
      setShowFinishConfirm(false)
      setShowConfetti(true)
      setReport(finishedSession)
      navigator.vibrate?.([100, 50, 100, 50, 200])
    } else {
      navigate({ to: '/history' })
    }
    setFinishing(false)
  }

  const handleShare = async (s: WorkoutSession) => {
    setGeneratingImage(true)
    try {
      const blob = await generateReportImage(s)
      if (!blob) throw new Error('Falha ao gerar imagem')

      const file = new File([blob], `treino-${Date.now()}.png`, { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `Treino: ${s.planName}` })
      } else {
        // Fallback: download the image
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `treino-${s.planName.replace(/\s+/g, '-')}.png`
        a.click()
        URL.revokeObjectURL(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    } catch {
      // user cancelled or error — ignore
    } finally {
      setGeneratingImage(false)
    }
  }

  if (report) {
    return (
      <>
        <Confetti active={showConfetti} />
        <WorkoutReportScreen
          report={report}
          isGeneratingImage={generatingImage}
          copied={copied}
          onShare={handleShare}
        />
      </>
    )
  }

  // Plano ainda carregando
  if (plansLoading && !plan) {
    return (
      <div className="page-container pt-6 text-center">
        <p className="text-text-muted">Carregando treino...</p>
      </div>
    )
  }

  // Plano não encontrado (ex.: ID inválido ou plano de outro usuário)
  if (!plansLoading && !plan) {
    return (
      <div className="page-container pt-6 text-center space-y-4">
        <p className="text-text-muted">Plano não encontrado.</p>
        <button
          type="button"
          onClick={() => navigate({ to: '/workouts' })}
          className="text-accent text-sm font-medium underline underline-offset-2"
        >
          Voltar aos treinos
        </button>
      </div>
    )
  }

  // Plano sem exercícios
  if (plan && !plan.exercises?.length) {
    return (
      <div className="page-container pt-6 text-center space-y-4">
        <p className="text-text-muted">Este plano não tem exercícios. Adicione exercícios para começar o treino.</p>
        <button
          type="button"
          onClick={() => navigate({ to: '/workouts' })}
          className="text-accent text-sm font-medium underline underline-offset-2"
        >
          Voltar aos treinos
        </button>
      </div>
    )
  }

  // Aguardando sessão ser criada (plan e user já existem; useStartWorkoutSession roda no effect)
  if (!plan || !session || !currentExercise) {
    return (
      <div className="page-container pt-6 text-center">
        <p className="text-text-muted">Carregando treino...</p>
      </div>
    )
  }

  const completedSets = currentExercise.sets.filter((s) => s.completed).length

  return (
    <div className="flex flex-col min-h-dvh bg-bg max-w-[480px] mx-auto w-full border-x border-border/50 shadow-2xl">
      <Confetti active={showConfetti} />
      {showPrCelebration && <PRCelebrationOverlay />}
      <ActiveWorkoutHeader
        totalTimerSeconds={totalTimerSeconds}
        isPaused={paused}
        onPause={pauseWorkout}
        onResume={resume}
        currentExercise={currentExercise}
        currentExerciseIndex={currentExerciseIndex}
        totalExercises={totalExercises}
        onPrev={previousExercise}
        onNext={nextExercise}
        onNotes={() => { setNotesDraft(session?.notes ?? ''); setShowNotes(true) }}
        onFinish={() => setShowFinishConfirm(true)}
        onClose={() => navigate({ to: '/workouts' })}
        onInfo={() => setShowInfo(true)}
        hasNotes={!!session?.notes}
        isFinishing={finishing}
        progress={progress}
      />

      {/* ─── GIF do exercício ──────────────────────────────────────── */}
      <div className="px-4 mb-4 flex items-center justify-center">
        {currentExercise.gifUrl ? (
          <div className="aspect-video max-h-48  rounded-2xl overflow-hidden bg-surface">
            <img
              src={currentExercise.gifUrl}
              alt={currentExercise.exerciseName}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-24 rounded-2xl bg-surface flex items-center justify-center">
            <span className="text-5xl">💪</span>
          </div>
        )}
      </div>

      {restTimerActive && (
        <RestCard
          secondsRemaining={restTimerSeconds}
          onSkip={() => {
            restEndedNaturalRef.current = false
            cancelRestNotification()
            stopRest()
          }}
        />
      )}

      {/* ─── Tabela de séries ──────────────────────────────────────── */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {/* 1RM estimate */}
        {(() => {
          const completedSeries = currentExercise.sets.filter((s) => s.completed && s.weight > 0 && s.reps > 0)
          if (completedSeries.length === 0) return null
          const bestSet = completedSeries.reduce((best, s) => {
            const rm = calculate1RM(s.weight, s.reps)
            return rm > best.rm ? { rm, peso: s.weight, reps: s.reps } : best
          }, { rm: 0, peso: 0, reps: 0 })
          if (bestSet.rm <= 0) return null
          return (
            <div className="flex items-center justify-center gap-2 mb-2 px-3 py-1.5 rounded-xl bg-accent-subtle animate-scale-in">
              <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                1RM estimado: {Math.round(bestSet.rm)} kg
              </span>
            </div>
          )
        })()}

        {/* Header */}
        {(() => {
          const tipo = currentExercise.setType ?? 'reps'
          const labels: Record<string, string> = { reps: 'Reps', tempo: 'Min', falha: 'Falha ⚡' }
          return (
            <div className="grid grid-cols-[32px_1fr_1fr_40px] gap-2 px-3 mb-1">
              {['#', 'Peso (kg)', labels[tipo] ?? 'Reps', ''].map((h, i) => (
                <span key={i} className="text-[10px] text-text-subtle font-semibold text-center">{h}</span>
              ))}
            </div>
          )
        })()}

        {currentExercise.setType === 'falha' && (
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Zap size={12} className="text-yellow-400" />
            <span className="text-[10px] font-semibold text-yellow-400">Executar até a falha muscular</span>
          </div>
        )}

        <div className="flex flex-col">
          {currentExercise.sets.map((serie, sIdx) => {
            const tipo = currentExercise.setType ?? 'reps'
            const isSetTimerActive = setTimer?.sIdx === sIdx
            return (
            <div key={serie.id} className="contents">
            <div
              className={`set-row ${serie.completed ? 'completed' : ''}`}
            >
              {/* Número da série */}
              <span className={`text-sm font-bold text-center ${serie.completed ? 'text-success' : 'text-text-subtle'}`}>
                {sIdx + 1}
              </span>

              {/* Peso */}
              <input
                type="number"
                step="any"
                lang="en"
                className="set-input"
                value={serie.weight === 0 ? '' : serie.weight}
                placeholder="0"
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
                  updateSet(currentExerciseIndex, sIdx, { weight: val })
                  if (currentExercise.sets.length > 1) setApplyAll({ field: 'weight', sIdx, value: val })
                }}
                onBlur={(e) => {
                  if (!plan) return
                  const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
                  const exIdx = plan.exercises.findIndex((ex) => ex.exerciseId === currentExercise.exerciseId)
                  if (exIdx === -1) return
                  const exercises = plan.exercises.map((ex, i) => {
                    if (i !== exIdx) return ex
                    const base = ex.setsDetail ?? Array.from({ length: ex.series }, () => ({ weight: ex.targetWeight ?? 0, reps: ex.targetReps }))
                    const setsDetail = base.map((s, j) => (j === sIdx ? { ...s, weight: val } : s))
                    return { ...ex, setsDetail }
                  })
                  updatePlanById({ ...plan, exercises })
                }}
                onFocus={(e) => e.target.select()}
              />

              {/* Reps / Tempo */}
              {tipo === 'tempo' ? (
                <button
                  onClick={() => {
                    const durationSeconds = Math.round((serie.reps || 1) * 60)
                    if (isSetTimerActive) {
                      stopSetTimer()
                    } else {
                      startSetTimer(sIdx, durationSeconds)
                    }
                  }}
                  className={`set-input flex items-center justify-center gap-1 text-xs font-bold ${
                    isSetTimerActive ? 'text-accent' : 'text-text-muted'
                  }`}
                >
                  <Timer size={12} />
                  {isSetTimerActive
                    ? formatDuration(setTimer!.remaining)
                    : formatDuration(Math.round((serie.reps || 1) * 60))}
                </button>
              ) : (
                <input
                  type="number"
                  className="set-input"
                  value={serie.reps === 0 ? '' : serie.reps}
                  placeholder={tipo === 'falha' ? 'Falha' : '0'}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : parseInt(e.target.value)
                    updateSet(currentExerciseIndex, sIdx, { reps: val })
                    if (currentExercise.sets.length > 1) setApplyAll({ field: 'reps', sIdx, value: val })
                  }}
                  onFocus={(e) => e.target.select()}
                />
              )}

              {/* Check */}
              <button
                onClick={() => {
                  if (tipo === 'tempo' && isSetTimerActive) stopSetTimer()
                  handleCompleteSet(sIdx)
                }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  serie.completed
                    ? 'bg-success text-white'
                    : 'bg-surface-2 text-text-subtle hover:bg-[rgba(34,197,94,0.15)] hover:text-success'
                }`}
              >
                <CheckCircle size={17} />
              </button>
            </div>

            {/* Repetir valor — aparece logo abaixo da série editada */}
            {applyAll && applyAll.sIdx === sIdx && (
              <div className="bg-accent/10 border border-accent /20 rounded-xl px-3 py-3 ml-[44px] mr-[52px] mb-2 mt-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-text-muted">
                    Repetir{' '}
                    <strong className="text-text">
                      {applyAll.field === 'weight' ? `${applyAll.value} kg` : `${applyAll.value} reps`}
                    </strong>{' '}em:
                  </p>
                  <button
                    onClick={() => setApplyAll(null)}
                    className="w-5 h-5 flex items-center justify-center rounded-full text-text-subtle hover:text-text hover:bg-surface-2 transition-colors text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex gap-1.5">
                  {applyAll.sIdx < currentExercise.sets.length - 1 && (
                    <button
                      onClick={() => {
                        currentExercise.sets.forEach((_, i) => {
                          if (i > applyAll.sIdx)
                            updateSet(currentExerciseIndex, i, { [applyAll.field]: applyAll.value })
                        })
                        setApplyAll(null)
                      }}
                      className="flex-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-accent bg-accent/10 border border-accent /20"
                    >
                      ↓ Seguintes
                    </button>
                  )}
                  <button
                    onClick={() => {
                      currentExercise.sets.forEach((_, i) => {
                        updateSet(currentExerciseIndex, i, { [applyAll.field]: applyAll.value })
                      })
                      setApplyAll(null)
                    }}
                    className="flex-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-accent"
                  >
                    Todas
                  </button>
                </div>
              </div>
            )}

            </div>
            )
          })}
        </div>

        {/* Progresso séries */}
        <div className="mt-4 text-center">
          <p className="text-xs text-text-muted">
            {completedSets}/{currentExercise.sets.length} séries completadas
          </p>
          <div className="progress-bar mt-2">
            <div className="progress-fill"
              style={{ width: `${currentExercise.sets.length ? (completedSets / currentExercise.sets.length) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Próximo exercício */}
        {currentExerciseIndex < totalExercises - 1 && (
          <button
            onClick={nextExercise}
            className="mt-4 w-full btn-secondary flex items-center justify-center gap-2 mb-[100px]"
          >
            <SkipForward size={16} />
            Próximo: {session.exercises[currentExerciseIndex + 1]?.exerciseName}
          </button>
        )}

        {/* Cancelar treino */}
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="mt-6 mb-24 text-xs text-text-muted/50 underline underline-offset-2 mx-auto block"
        >
          Cancelar treino
        </button>
      </div>

      {showCancelConfirm && (
        <ConfirmCancelModal
          onConfirm={() => {
            cancelRestNotification()
            clearLocal()
            navigate({ to: '/workouts' })
          }}
          onCancel={() => setShowCancelConfirm(false)}
        />
      )}

      {showInfo && (
        <ExerciseInfoModal
          exercise={currentExercise}
          planExercise={planExercise}
          onClose={() => setShowInfo(false)}
        />
      )}

      {showNotes && (
        <WorkoutNotesModal
          notes={notesDraft}
          onNotesChange={setNotesDraft}
          onSave={() => {
            updateNotes(notesDraft)
            setShowNotes(false)
            toast.success('Notas salvas!')
          }}
          onCancel={() => setShowNotes(false)}
        />
      )}

      {showFinishConfirm && (
        <ConfirmFinishModal
          onConfirm={handleFinish}
          onCancel={() => setShowFinishConfirm(false)}
          isFinishing={finishing}
        />
      )}

    </div>
  )
}
