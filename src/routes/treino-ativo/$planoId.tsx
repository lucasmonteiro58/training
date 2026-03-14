import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState, useMemo } from 'react'
import { usePlans } from '../../hooks/usePlanos'
import { useHistory } from '../../hooks/useHistorico'
import { useAuthStore, useActiveWorkoutStore, useHistoryStore } from '../../stores'
import {
  limparNotificacoesTreino,
  cancelarNotificacaoDescanso,
  formatarTempo,
} from '../../lib/notifications'
import { useSetTimer } from '../../hooks/useTimerSerie'
import { useRestNotifications } from '../../hooks/useNotificacoesDescanso'
import { useSaveWeightsToPlan } from '../../hooks/useSalvarPesosNoPlano'
import { useStartWorkoutSession } from '../../hooks/useIniciarSessaoTreino'
import { useCompleteWorkoutSet } from '../../hooks/useCompletarSerieTreino'
import type { WorkoutSession } from '../../types'
import { toast } from 'sonner'
import { calcular1RM } from '../../lib/calculadora1rm'
import { calcularRecordes } from '../../lib/records'
import { CheckCircle, SkipForward, Timer, Zap } from 'lucide-react'
import { Confetti } from '../../components/ui/Confetti'
import { gerarImagemRelatorio } from '../../lib/relatorioImage'
import { TreinoRelatorioScreen } from './components/-TreinoRelatorioScreen'
import { TreinoAtivoHeader } from './components/-TreinoAtivoHeader'
import { DescansoCard } from './components/-DescansoCard'
import { ConfirmCancelarModal } from './components/-ConfirmCancelarModal'
import { ConfirmFinalizarModal } from './components/-ConfirmFinalizarModal'
import { ExercicioInfoModal } from './components/-ExercicioInfoModal'
import { NotasTreinoModal } from './components/-NotasTreinoModal'
import { PRCelebrationOverlay } from './components/-PRCelebrationOverlay'

export const Route = createFileRoute('/treino-ativo/$planoId')({
  component: TreinoAtivoPage,
})

function TreinoAtivoPage() {
  const { planoId } = Route.useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { planos, atualizarPlano } = usePlans()
  const { salvarSessaoCompleta } = useHistory()
  const plano = planos.find((p) => p.id === planoId)
  const sessoes = useHistoryStore((s) => s.sessoes)
  const recordes = useMemo(() => calcularRecordes(sessoes), [sessoes])

  const store = useActiveWorkoutStore()
  const {
    sessao, exercicioAtualIndex, cronometroGeralSegundos,
    cronometroDescansoSegundos, cronometroDescansoAtivo,
    pausado, iniciado,
    iniciarTreino, finalizarTreino, pausarTreino, retomar,
    proximoExercicio, exercicioAnterior, atualizarSerie,
    marcarSerieCompletada,
    iniciarDescanso, pararDescanso, tickGeral, tickDescanso,
    atualizarNotas, limparLocal, heartbeat,
  } = store

  const timerRef = useRef<number | null>(null)
  const descansoRef = useRef<number | null>(null)

  const [applyAll, setApplyAll] = useState<{ field: 'peso' | 'repeticoes'; sIdx: number; value: number } | null>(null)
  const { salvarPesosNoPlano } = useSaveWeightsToPlan(
    plano ?? undefined,
    sessao,
    exercicioAtualIndex,
    atualizarPlano,
    () => setApplyAll(null)
  )

  const { timerSerie, iniciarTimerSerie, pararTimerSerie } = useSetTimer(exercicioAtualIndex)
  const { descansoAcabouNaturalRef } = useRestNotifications({
    cronometroDescansoAtivo,
    cronometroDescansoSegundos,
    sessao,
    exercicioAtualIndex,
  })

  // Heartbeat: atualiza Firestore a cada 1 min para não encerrar por inatividade (20 min)
  useEffect(() => {
    if (!iniciado || !sessao) return
    const id = setInterval(heartbeat, 60 * 1000)
    return () => clearInterval(id)
  }, [iniciado, sessao, heartbeat])

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
    planoId,
    plano: plano ?? undefined,
    user,
    sessoes,
    iniciado,
    sessao,
    iniciarTreino,
  })

  const { handleCompletarSerie } = useCompleteWorkoutSet({
    sessao,
    exercicioAtualIndex,
    recordes,
    salvarPesosNoPlano,
    marcarSerieCompletada,
    atualizarSerie,
    iniciarDescanso,
    proximoExercicio,
    exercicioAnterior,
    pararDescanso,
    cancelarNotificacaoDescanso,
    descansoAcabouNaturalRef,
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
    timerRef.current = window.setInterval(() => { tickGeral() }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [tickGeral])

  // ─── Cronômetro de descanso ────────────────────────────────────────────────
  useEffect(() => {
    if (!cronometroDescansoAtivo) {
      if (descansoRef.current) clearInterval(descansoRef.current)
      return
    }
    descansoRef.current = window.setInterval(() => { tickDescanso() }, 1000)
    return () => { if (descansoRef.current) clearInterval(descansoRef.current) }
  }, [cronometroDescansoAtivo, tickDescanso])

  const exercicioAtual = sessao?.exercicios[exercicioAtualIndex]
  const planoExercicio = plano?.exercicios.find(ex => ex.exercicioId === exercicioAtual?.exercicioId)
  const totalExercicios = sessao?.exercicios.length ?? 0
  const progresso = totalExercicios ? (exercicioAtualIndex / totalExercicios) * 100 : 0

  const handleFinalizar = async () => {
    // Salvar pesos do exercício atual antes de finalizar
    salvarPesosNoPlano()
    setFinalizando(true)
    const sessaoFinalizada = finalizarTreino()
    cancelarNotificacaoDescanso()
    limparNotificacoesTreino()
    if (sessaoFinalizada) {
      await salvarSessaoCompleta(sessaoFinalizada)
      setShowConfirmFinalizar(false)
      setShowConfetti(true)
      setRelatorio(sessaoFinalizada)
      navigator.vibrate?.([100, 50, 100, 50, 200])
    } else {
      navigate({ to: '/historico' })
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
        await navigator.share({ files: [file], title: `Treino: ${s.planoNome}` })
      } else {
        // Fallback: download the image
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `treino-${s.planoNome.replace(/\s+/g, '-')}.png`
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
        <TreinoRelatorioScreen
          relatorio={relatorio}
          gerandoImagem={gerandoImagem}
          copiado={copiado}
          onCompartilhar={handleCompartilhar}
        />
      </>
    )
  }

  if (!plano || !sessao || !exercicioAtual) {
    return (
      <div className="page-container pt-6 text-center">
        <p className="text-text-muted">Carregando treino...</p>
      </div>
    )
  }

  const seriesCompletadas = exercicioAtual.series.filter((s) => s.completada).length

  return (
    <div className="flex flex-col min-h-dvh bg-bg max-w-[480px] mx-auto w-full border-x border-border/50 shadow-2xl">
      <Confetti active={showConfetti} />
      {showPrCelebration && <PRCelebrationOverlay />}
      <TreinoAtivoHeader
        cronometroGeralSegundos={cronometroGeralSegundos}
        pausado={pausado}
        onPause={pausarTreino}
        onResume={retomar}
        exercicioAtual={exercicioAtual}
        exercicioAtualIndex={exercicioAtualIndex}
        totalExercicios={totalExercicios}
        onPrev={exercicioAnterior}
        onNext={proximoExercicio}
        onNotas={() => { setNotasTemp(sessao?.notas ?? ''); setShowNotas(true) }}
        onFinalizar={() => setShowConfirmFinalizar(true)}
        onClose={() => navigate({ to: '/treinos' })}
        onInfo={() => setShowInfo(true)}
        hasNotas={!!sessao?.notas}
        finalizando={finalizando}
        progresso={progresso}
      />

      {/* ─── GIF do exercício ──────────────────────────────────────── */}
      <div className="px-4 mb-4 flex items-center justify-center">
        {exercicioAtual.gifUrl ? (
          <div className="aspect-video max-h-48  rounded-2xl overflow-hidden bg-surface">
            <img
              src={exercicioAtual.gifUrl}
              alt={exercicioAtual.exercicioNome}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-24 rounded-2xl bg-surface flex items-center justify-center">
            <span className="text-5xl">💪</span>
          </div>
        )}
      </div>

      {cronometroDescansoAtivo && (
        <DescansoCard
          segundosRestantes={cronometroDescansoSegundos}
          onPular={() => {
            descansoAcabouNaturalRef.current = false
            cancelarNotificacaoDescanso()
            pararDescanso()
          }}
        />
      )}

      {/* ─── Tabela de séries ──────────────────────────────────────── */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {/* 1RM estimate */}
        {(() => {
          const seriesCompletas = exercicioAtual.series.filter(s => s.completada && s.peso > 0 && s.repeticoes > 0)
          if (seriesCompletas.length === 0) return null
          const melhor = seriesCompletas.reduce((best, s) => {
            const rm = calcular1RM(s.peso, s.repeticoes)
            return rm > best.rm ? { rm, peso: s.peso, reps: s.repeticoes } : best
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
          const tipo = exercicioAtual.tipoSerie ?? 'reps'
          const labels: Record<string, string> = { reps: 'Reps', tempo: 'Min', falha: 'Falha ⚡' }
          return (
            <div className="grid grid-cols-[32px_1fr_1fr_40px] gap-2 px-3 mb-1">
              {['#', 'Peso (kg)', labels[tipo] ?? 'Reps', ''].map((h, i) => (
                <span key={i} className="text-[10px] text-text-subtle font-semibold text-center">{h}</span>
              ))}
            </div>
          )
        })()}

        {exercicioAtual.tipoSerie === 'falha' && (
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Zap size={12} className="text-yellow-400" />
            <span className="text-[10px] font-semibold text-yellow-400">Executar até a falha muscular</span>
          </div>
        )}

        <div className="flex flex-col">
          {exercicioAtual.series.map((serie, sIdx) => {
            const tipo = exercicioAtual.tipoSerie ?? 'reps'
            const isTimerAtivo = timerSerie?.sIdx === sIdx
            return (
            <div key={serie.id} className="contents">
            <div
              className={`set-row ${serie.completada ? 'completed' : ''}`}
            >
              {/* Número da série */}
              <span className={`text-sm font-bold text-center ${serie.completada ? 'text-success' : 'text-text-subtle'}`}>
                {sIdx + 1}
              </span>

              {/* Peso */}
              <input
                type="number"
                step="any"
                lang="en"
                className="set-input"
                value={serie.peso === 0 ? '' : serie.peso}
                placeholder="0"
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
                  atualizarSerie(exercicioAtualIndex, sIdx, { peso: val })
                  if (exercicioAtual.series.length > 1) setApplyAll({ field: 'peso', sIdx, value: val })
                }}
                onBlur={(e) => {
                  if (!plano) return
                  const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
                  const exIdx = plano.exercicios.findIndex((ex) => ex.exercicioId === exercicioAtual.exercicioId)
                  if (exIdx === -1) return
                  const exercicios = plano.exercicios.map((ex, i) => {
                    if (i !== exIdx) return ex
                    const base = ex.seriesDetalhadas ?? Array.from({ length: ex.series }, () => ({ peso: ex.pesoMeta ?? 0, repeticoes: ex.repeticoesMeta }))
                    const seriesDetalhadas = base.map((s, j) => (j === sIdx ? { ...s, peso: val } : s))
                    return { ...ex, seriesDetalhadas }
                  })
                  atualizarPlano({ ...plano, exercicios })
                }}
                onFocus={(e) => e.target.select()}
              />

              {/* Reps / Tempo */}
              {tipo === 'tempo' ? (
                <button
                  onClick={() => {
                    const duracaoSeg = Math.round((serie.repeticoes || 1) * 60)
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
                    : formatarTempo(Math.round((serie.repeticoes || 1) * 60))}
                </button>
              ) : (
                <input
                  type="number"
                  className="set-input"
                  value={serie.repeticoes === 0 ? '' : serie.repeticoes}
                  placeholder={tipo === 'falha' ? 'Falha' : '0'}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : parseInt(e.target.value)
                    atualizarSerie(exercicioAtualIndex, sIdx, { repeticoes: val })
                    if (exercicioAtual.series.length > 1) setApplyAll({ field: 'repeticoes', sIdx, value: val })
                  }}
                  onFocus={(e) => e.target.select()}
                />
              )}

              {/* Check */}
              <button
                onClick={() => {
                  if (tipo === 'tempo' && isTimerAtivo) pararTimerSerie()
                  handleCompletarSerie(sIdx)
                }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  serie.completada
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
                      {applyAll.field === 'peso' ? `${applyAll.value} kg` : `${applyAll.value} reps`}
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
                  {applyAll.sIdx < exercicioAtual.series.length - 1 && (
                    <button
                      onClick={() => {
                        exercicioAtual.series.forEach((_, i) => {
                          if (i > applyAll.sIdx)
                            atualizarSerie(exercicioAtualIndex, i, { [applyAll.field]: applyAll.value })
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
                      exercicioAtual.series.forEach((_, i) => {
                        atualizarSerie(exercicioAtualIndex, i, { [applyAll.field]: applyAll.value })
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
            {seriesCompletadas}/{exercicioAtual.series.length} séries completadas
          </p>
          <div className="progress-bar mt-2">
            <div className="progress-fill"
              style={{ width: `${exercicioAtual.series.length ? (seriesCompletadas / exercicioAtual.series.length) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Próximo exercício */}
        {exercicioAtualIndex < totalExercicios - 1 && (
          <button
            onClick={proximoExercicio}
            className="mt-4 w-full btn-secondary flex items-center justify-center gap-2 mb-[100px]"
          >
            <SkipForward size={16} />
            Próximo: {sessao.exercicios[exercicioAtualIndex + 1]?.exercicioNome}
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
        <ConfirmCancelarModal
          onConfirm={() => {
            cancelarNotificacaoDescanso()
            limparLocal()
            navigate({ to: '/treinos' })
          }}
          onCancel={() => setShowConfirmCancelar(false)}
        />
      )}

      {showInfo && (
        <ExercicioInfoModal
          exercicio={exercicioAtual}
          exercicioPlano={planoExercicio}
          onClose={() => setShowInfo(false)}
        />
      )}

      {showNotas && (
        <NotasTreinoModal
          notas={notasTemp}
          onNotasChange={setNotasTemp}
          onSalvar={() => {
            atualizarNotas(notasTemp)
            setShowNotas(false)
            toast.success('Notas salvas!')
          }}
          onCancel={() => setShowNotas(false)}
        />
      )}

      {showConfirmFinalizar && (
        <ConfirmFinalizarModal
          onConfirm={handleFinalizar}
          onCancel={() => setShowConfirmFinalizar(false)}
          finalizando={finalizando}
        />
      )}

    </div>
  )
}
