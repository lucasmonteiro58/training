import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState, useMemo } from 'react'
import { usePlans } from '../../hooks/usePlans'
import { useHistory } from '../../hooks/useHistory'
import { useAuthStore, useActiveWorkoutStore, useHistoryStore } from '../../stores'
import {
  limparNotificacoesTreino,
  cancelarNotificacaoDescanso,
  formatarTempo,
} from '../../lib/notifications'
import { useSetTimer } from '../../hooks/useSetTimer'
import { useRestNotifications } from '../../hooks/useRestNotifications'
import { useSaveWeightsToPlan } from '../../hooks/useSaveWeightsToPlan'
import { useStartWorkoutSession } from '../../hooks/useStartWorkoutSession'
import { useCompleteWorkoutSet } from '../../hooks/useCompleteWorkoutSet'
import type { WorkoutSession } from '../../types'
import { toast } from 'sonner'
import { calcular1RM } from '../../lib/calculadora1rm'
import { calcularRecordes } from '../../lib/records'
import { CheckCircle, SkipForward, Timer, Zap } from 'lucide-react'
import { Confetti } from '../../components/ui/Confetti'
import { gerarImagemRelatorio } from '../../lib/relatorioImage'
import { WorkoutReportScreen } from './components/-WorkoutReportScreen'
import { ActiveWorkoutHeader } from './components/-ActiveWorkoutHeader'
import { RestCard } from './components/-RestCard'
import { ConfirmCancelModal } from './components/-ConfirmCancelModal'
import { ConfirmFinishModal } from './components/-ConfirmFinishModal'
import { ExerciseInfoModal } from './components/-ExerciseInfoModal'
import { WorkoutNotesModal } from './components/-WorkoutNotesModal'
import { PRCelebrationOverlay } from './components/-PRCelebrationOverlay'

export const Route = createFileRoute('/active-workout/$planId')({
  component: TreinoAtivoPage,
})

function TreinoAtivoPage() {
  const { planId } = Route.useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { plans, updatePlanById } = usePlans()
  const { saveSessionComplete } = useHistory()
  const plan = plans.find((p) => p.id === planId)
  const sessions = useHistoryStore((s) => s.sessions)
  const recordes = useMemo(() => calcularRecordes(sessions), [sessions])

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
  const descansoRef = useRef<number | null>(null)

  const [applyAll, setApplyAll] = useState<{ field: 'weight' | 'reps'; sIdx: number; value: number } | null>(null)
  const { saveWeightsToPlan } = useSaveWeightsToPlan(
    plan ?? undefined,
    session,
    currentExerciseIndex,
    updatePlanById,
    () => setApplyAll(null)
  )

  const { timerSerie, iniciarTimerSerie, pararTimerSerie } = useSetTimer(currentExerciseIndex)
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

  const [finalizando, setFinalizando] = useState(false)
  const [showConfirmFinalizar, setShowConfirmFinalizar] = useState(false)
  const [showConfirmCancelar, setShowConfirmCancelar] = useState(false)
  const [relatorio, setRelatorio] = useState<WorkoutSession | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [gerandoImagem, setGerandoImagem] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showNotas, setShowNotas] = useState(false)
  const [notasTemp, setNotasTemp] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [showPrCelebration, setShowPrCelebration] = useState(false)

  useStartWorkoutSession({
    planId,
    plano: plan ?? undefined,
    user,
    sessions,
    iniciado: started,
    sessao: session,
    iniciarTreino: startWorkout,
  })

  const { handleCompleteSet } = useCompleteWorkoutSet({
    session,
    currentExerciseIndex,
    recordes,
    saveWeightsToPlan,
    markSetCompleted,
    updateSet,
    startRest,
    nextExercise,
    previousExercise,
    stopRest,
    cancelRestNotification: cancelarNotificacaoDescanso,
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
    onWorkoutComplete: () => setShowConfirmFinalizar(true),
  })

  // ─── Cronômetro geral ──────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = window.setInterval(() => { tickTotal() }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [tickTotal])

  // ─── Cronômetro de descanso ────────────────────────────────────────────────
  useEffect(() => {
    if (!restTimerActive) {
      if (descansoRef.current) clearInterval(descansoRef.current)
      return
    }
    descansoRef.current = window.setInterval(() => { tickRest() }, 1000)
    return () => { if (descansoRef.current) clearInterval(descansoRef.current) }
  }, [restTimerActive, tickRest])

  const exercicioAtual = session?.exercises[currentExerciseIndex]
  const planExercise = plan?.exercises.find((ex) => ex.exerciseId === exercicioAtual?.exerciseId)
  const totalExercicios = session?.exercises.length ?? 0
  const progresso = totalExercicios ? (currentExerciseIndex / totalExercicios) * 100 : 0

  const handleFinalizar = async () => {
    // Salvar pesos do exercício atual antes de finalizar
    saveWeightsToPlan()
    setFinalizando(true)
    const sessaoFinalizada = finishWorkout()
    cancelarNotificacaoDescanso()
    limparNotificacoesTreino()
    if (sessaoFinalizada) {
      await saveSessionComplete(sessaoFinalizada)
      setShowConfirmFinalizar(false)
      setShowConfetti(true)
      setRelatorio(sessaoFinalizada)
      navigator.vibrate?.([100, 50, 100, 50, 200])
    } else {
      navigate({ to: '/history' })
    }
    setFinalizando(false)
  }

  const handleCompartilhar = async (s: WorkoutSession) => {
    setGerandoImagem(true)
    try {
      const blob = await gerarImagemRelatorio(s)
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
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2500)
      }
    } catch {
      // user cancelled or error — ignore
    } finally {
      setGerandoImagem(false)
    }
  }

  if (relatorio) {
    return (
      <>
        <Confetti active={showConfetti} />
        <WorkoutReportScreen
          relatorio={relatorio}
          gerandoImagem={gerandoImagem}
          copiado={copiado}
          onCompartilhar={handleCompartilhar}
        />
      </>
    )
  }

  if (!plan || !session || !exercicioAtual) {
    return (
      <div className="page-container pt-6 text-center">
        <p className="text-text-muted">Carregando treino...</p>
      </div>
    )
  }

  const seriesCompletadas = exercicioAtual.sets.filter((s) => s.completed).length

  return (
    <div className="flex flex-col min-h-dvh bg-bg max-w-[480px] mx-auto w-full border-x border-border/50 shadow-2xl">
      <Confetti active={showConfetti} />
      {showPrCelebration && <PRCelebrationOverlay />}
      <ActiveWorkoutHeader
        cronometroGeralSegundos={totalTimerSeconds}
        pausado={paused}
        onPause={pauseWorkout}
        onResume={resume}
        exercicioAtual={exercicioAtual}
        exercicioAtualIndex={currentExerciseIndex}
        totalExercicios={totalExercicios}
        onPrev={previousExercise}
        onNext={nextExercise}
        onNotas={() => { setNotasTemp(session?.notes ?? ''); setShowNotas(true) }}
        onFinalizar={() => setShowConfirmFinalizar(true)}
        onClose={() => navigate({ to: '/workouts' })}
        onInfo={() => setShowInfo(true)}
        hasNotas={!!session?.notes}
        finalizando={finalizando}
        progresso={progresso}
      />

      {/* ─── GIF do exercício ──────────────────────────────────────── */}
      <div className="px-4 mb-4 flex items-center justify-center">
        {exercicioAtual.gifUrl ? (
          <div className="aspect-video max-h-48  rounded-2xl overflow-hidden bg-surface">
            <img
              src={exercicioAtual.gifUrl}
              alt={exercicioAtual.exerciseName}
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
          segundosRestantes={restTimerSeconds}
          onPular={() => {
            restEndedNaturalRef.current = false
            cancelarNotificacaoDescanso()
            stopRest()
          }}
        />
      )}

      {/* ─── Tabela de séries ──────────────────────────────────────── */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {/* 1RM estimate */}
        {(() => {
          const seriesCompletas = exercicioAtual.sets.filter((s) => s.completed && s.weight > 0 && s.reps > 0)
          if (seriesCompletas.length === 0) return null
          const melhor = seriesCompletas.reduce((best, s) => {
            const rm = calcular1RM(s.weight, s.reps)
            return rm > best.rm ? { rm, peso: s.weight, reps: s.reps } : best
          }, { rm: 0, peso: 0, reps: 0 })
          if (melhor.rm <= 0) return null
          return (
            <div className="flex items-center justify-center gap-2 mb-2 px-3 py-1.5 rounded-xl bg-accent-subtle animate-scale-in">
              <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                1RM estimado: {Math.round(melhor.rm)} kg
              </span>
            </div>
          )
        })()}

        {/* Header */}
        {(() => {
          const tipo = exercicioAtual.setType ?? 'reps'
          const labels: Record<string, string> = { reps: 'Reps', tempo: 'Min', falha: 'Falha ⚡' }
          return (
            <div className="grid grid-cols-[32px_1fr_1fr_40px] gap-2 px-3 mb-1">
              {['#', 'Peso (kg)', labels[tipo] ?? 'Reps', ''].map((h, i) => (
                <span key={i} className="text-[10px] text-text-subtle font-semibold text-center">{h}</span>
              ))}
            </div>
          )
        })()}

        {exercicioAtual.setType === 'falha' && (
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Zap size={12} className="text-yellow-400" />
            <span className="text-[10px] font-semibold text-yellow-400">Executar até a falha muscular</span>
          </div>
        )}

        <div className="flex flex-col">
          {exercicioAtual.sets.map((serie, sIdx) => {
            const tipo = exercicioAtual.setType ?? 'reps'
            const isTimerAtivo = timerSerie?.sIdx === sIdx
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
                  if (exercicioAtual.sets.length > 1) setApplyAll({ field: 'weight', sIdx, value: val })
                }}
                onBlur={(e) => {
                  if (!plan) return
                  const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
                  const exIdx = plan.exercises.findIndex((ex) => ex.exerciseId === exercicioAtual.exerciseId)
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
                    const duracaoSeg = Math.round((serie.reps || 1) * 60)
                    if (isTimerAtivo) {
                      pararTimerSerie()
                    } else {
                      iniciarTimerSerie(sIdx, duracaoSeg)
                    }
                  }}
                  className={`set-input flex items-center justify-center gap-1 text-xs font-bold ${
                    isTimerAtivo ? 'text-accent' : 'text-text-muted'
                  }`}
                >
                  <Timer size={12} />
                  {isTimerAtivo
                    ? formatarTempo(timerSerie!.restando)
                    : formatarTempo(Math.round((serie.reps || 1) * 60))}
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
                    if (exercicioAtual.sets.length > 1) setApplyAll({ field: 'reps', sIdx, value: val })
                  }}
                  onFocus={(e) => e.target.select()}
                />
              )}

              {/* Check */}
              <button
                onClick={() => {
                  if (tipo === 'tempo' && isTimerAtivo) pararTimerSerie()
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
                  {applyAll.sIdx < exercicioAtual.sets.length - 1 && (
                    <button
                      onClick={() => {
                        exercicioAtual.sets.forEach((_, i) => {
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
                      exercicioAtual.sets.forEach((_, i) => {
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
            {seriesCompletadas}/{exercicioAtual.sets.length} séries completadas
          </p>
          <div className="progress-bar mt-2">
            <div className="progress-fill"
              style={{ width: `${exercicioAtual.sets.length ? (seriesCompletadas / exercicioAtual.sets.length) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Próximo exercício */}
        {currentExerciseIndex < totalExercicios - 1 && (
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
          onClick={() => setShowConfirmCancelar(true)}
          className="mt-6 mb-24 text-xs text-text-muted/50 underline underline-offset-2 mx-auto block"
        >
          Cancelar treino
        </button>
      </div>

      {showConfirmCancelar && (
        <ConfirmCancelModal
          onConfirm={() => {
            cancelarNotificacaoDescanso()
            clearLocal()
            navigate({ to: '/workouts' })
          }}
          onCancel={() => setShowConfirmCancelar(false)}
        />
      )}

      {showInfo && (
        <ExerciseInfoModal
          exercicio={exercicioAtual}
          exercicioPlano={planExercise}
          onClose={() => setShowInfo(false)}
        />
      )}

      {showNotas && (
        <WorkoutNotesModal
          notas={notasTemp}
          onNotasChange={setNotasTemp}
          onSalvar={() => {
            updateNotes(notasTemp)
            setShowNotas(false)
            toast.success('Notas salvas!')
          }}
          onCancel={() => setShowNotas(false)}
        />
      )}

      {showConfirmFinalizar && (
        <ConfirmFinishModal
          onConfirm={handleFinalizar}
          onCancel={() => setShowConfirmFinalizar(false)}
          finalizando={finalizando}
        />
      )}

    </div>
  )
}
