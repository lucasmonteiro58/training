import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { usePlanos } from '../../hooks/usePlanos'
import { useHistorico } from '../../hooks/useHistorico'
import { useAuthStore, useTreinoAtivoStore, useHistoricoStore } from '../../stores'
import {
  enviarNotificacaoTreino,
  limparNotificacoesTreino,
  solicitarPermissaoNotificacao,
  agendarNotificacaoDescanso,
  cancelarNotificacaoDescanso,
  tocarAlertaDescanso,
  vibrarDescansoFim,
  prepararAudio,
  onSwMessage,
  formatarTempo,
} from '../../lib/notifications'
import type { SessaoDeTreino, SerieRegistrada, ExercicioNaSessao } from '../../types'
import { toast } from 'sonner'
import { calcular1RM } from '../../lib/calculadora1rm'
import { calcularRecordes, detectarNovoPR } from '../../lib/records'
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
  const { planos, atualizarPlano } = usePlanos()
  const { salvarSessaoCompleta } = useHistorico()
  const plano = planos.find((p) => p.id === planoId)
  const sessoes = useHistoricoStore((s) => s.sessoes)
  const recordes = useMemo(() => calcularRecordes(sessoes), [sessoes])

  const store = useTreinoAtivoStore()
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

  // ─── Salvar pesos no plano quando muda de exercício ───────────────────────
  const salvarPesosNoPlano = (exIdx?: number) => {
    if (!plano || !sessao) return
    const idx = exIdx ?? exercicioAtualIndex
    const exSessao = sessao.exercicios[idx]
    if (!exSessao) return
    const planoExIdx = plano.exercicios.findIndex(e => e.exercicioId === exSessao.exercicioId)
    if (planoExIdx === -1) return
    const exPlano = plano.exercicios[planoExIdx]
    const seriesDetalhadas = exSessao.series.map((s, i) => ({
      ...(exPlano.seriesDetalhadas?.[i] ?? {}),
      peso: s.peso,
      repeticoes: s.repeticoes,
    }))
    // Só salvar se houve mudança
    const changed = seriesDetalhadas.some((sd, i) => {
      const old = exPlano.seriesDetalhadas?.[i]
      return !old || old.peso !== sd.peso || old.repeticoes !== sd.repeticoes
    })
    if (!changed) return
    const exercicios = plano.exercicios.map((ex, i) =>
      i === planoExIdx ? { ...ex, seriesDetalhadas } : ex
    )
    atualizarPlano({ ...plano, exercicios })
  }

  const prevExIdxRef = useRef(exercicioAtualIndex)
  useEffect(() => {
    // Salva pesos do exercício anterior quando troca
    if (prevExIdxRef.current !== exercicioAtualIndex) {
      salvarPesosNoPlano(prevExIdxRef.current)
      prevExIdxRef.current = exercicioAtualIndex
    }
    setApplyAll(null)
  }, [exercicioAtualIndex])

  // Heartbeat: atualiza Firestore a cada 1 min para não encerrar por inatividade (20 min)
  useEffect(() => {
    if (!iniciado || !sessao) return
    const id = setInterval(heartbeat, 60 * 1000)
    return () => clearInterval(id)
  }, [iniciado, sessao, heartbeat])

  const [finalizando, setFinalizando] = useState(false)
  const [showConfirmFinalizar, setShowConfirmFinalizar] = useState(false)
  const [showConfirmCancelar, setShowConfirmCancelar] = useState(false)
  const [relatorio, setRelatorio] = useState<SessaoDeTreino | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [gerandoImagem, setGerandoImagem] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showNotas, setShowNotas] = useState(false)
  const [notasTemp, setNotasTemp] = useState('')
  const [applyAll, setApplyAll] = useState<{ field: 'peso' | 'repeticoes'; sIdx: number; value: number } | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showPrCelebration, setShowPrCelebration] = useState(false)
  /** Maior peso por exercício para o qual já mostramos PR nesta sessão — mostra de novo só se bater esse valor */
  const prExibidoRef = useRef<Map<string, number>>(new Map())

  // ─── Cronômetro de série (para exercícios por tempo) ──────────────────────
  const [timerSerie, setTimerSerie] = useState<{ sIdx: number; restando: number } | null>(null)
  const timerSerieRef = useRef<number | null>(null)

  const iniciarTimerSerie = (sIdx: number, duracaoSegundos: number) => {
    if (timerSerieRef.current) clearInterval(timerSerieRef.current)
    setTimerSerie({ sIdx, restando: duracaoSegundos })
    timerSerieRef.current = window.setInterval(() => {
      setTimerSerie((prev) => {
        if (!prev || prev.restando <= 1) {
          clearInterval(timerSerieRef.current!)
          return null
        }
        return { ...prev, restando: prev.restando - 1 }
      })
    }, 1000)
  }

  const pararTimerSerie = () => {
    if (timerSerieRef.current) clearInterval(timerSerieRef.current)
    setTimerSerie(null)
  }

  useEffect(() => {
    pararTimerSerie()
  }, [exercicioAtualIndex])

  // ─── Iniciar treino se não estiver ativo ───────────────────────────────────
  useEffect(() => {
    if (!plano || !user) return
    // Se já há sessão ativa desse plano, continua
    if (iniciado && sessao?.planoId === planoId) return
    // Se há sessão de outro plano ativa, finaliza e começa nova
    // Buscar última sessão desse plano para pré-preencher pesos
    const ultimaSessao = sessoes
      .filter(s => s.planoId === planoId && s.finalizadoEm)
      .sort((a, b) => (b.finalizadoEm ?? 0) - (a.finalizadoEm ?? 0))[0]

    const exerciciosNaSessao: ExercicioNaSessao[] = plano.exercicios.map((ex) => {
      // Buscar pesos da última sessão para este exercício
      const exUltimaSessao = ultimaSessao?.exercicios.find(e => e.exercicioId === ex.exercicioId)
      return {
        exercicioId: ex.exercicioId,
        exercicioNome: ex.exercicio.nome,
        gifUrl: ex.exercicio.gifUrl,
        grupoMuscular: ex.exercicio.grupoMuscular,
        descansoSegundos: ex.descansoSegundos,
        ordem: ex.ordem,
        notas: ex.notas,
        instrucoes: ex.exercicio.instrucoes,
        tipoSerie: ex.tipoSerie,
        duracaoMetaSegundos: ex.duracaoMetaSegundos,
        agrupamentoId: ex.agrupamentoId,
        tipoAgrupamento: ex.tipoAgrupamento,
        series: Array.from({ length: ex.series }, (_, i) => {
          // Prioridade: seriesDetalhadas do plano > última sessão > pesoMeta > 0
          // Usa || ao invés de ?? pois 0 significa "não definido"
          const pesoPlano = ex.seriesDetalhadas?.[i]?.peso
          const repsPlano = ex.seriesDetalhadas?.[i]?.repeticoes
          const pesoSessao = exUltimaSessao?.series[i]?.peso
          const repsSessao = exUltimaSessao?.series[i]?.repeticoes
          return {
            id: uuidv4(),
            ordem: i,
            repeticoes: repsPlano || repsSessao || ex.repeticoesMeta,
            peso: pesoPlano || pesoSessao || (ex.pesoMeta ?? 0),
            completada: false,
          } as SerieRegistrada
        }),
      }
    })
    const novaSessao: SessaoDeTreino = {
      id: uuidv4(),
      userId: user.uid,
      planoId: plano.id,
      planoNome: plano.nome,
      iniciadoEm: Date.now(),
      exercicios: exerciciosNaSessao,
    }
    iniciarTreino(novaSessao)
    solicitarPermissaoNotificacao()
  }, [plano, user, planoId])

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

  // ─── Ref para rastrear se descanso acabou naturalmente ──────────────────
  const descansoAcabouNatural = useRef(false)

  // ─── Notificação ao iniciar/finalizar descanso ─────────────────────────────
  useEffect(() => {
    if (cronometroDescansoAtivo && sessao) {
      const ex = sessao.exercicios[exercicioAtualIndex]
      descansoAcabouNatural.current = true

      // Notificação de descanso em andamento
      enviarNotificacaoTreino(
        `⏱ Descanso – ${cronometroDescansoSegundos}s`,
        `Próximo: ${ex?.exercicioNome ?? ''}`,
      )

      // Agenda notificação no SW para quando o descanso terminar
      // (funciona mesmo com aba em background)
      agendarNotificacaoDescanso(
        cronometroDescansoSegundos,
        ex?.exercicioNome,
      )
    }

    if (!cronometroDescansoAtivo) {
      // Se o descanso terminou naturalmente (não foi pulado)
      if (descansoAcabouNatural.current) {
        tocarAlertaDescanso()
        vibrarDescansoFim()
        descansoAcabouNatural.current = false
      }
      limparNotificacoesTreino()
    }
  }, [cronometroDescansoAtivo])

  // ─── Listener SW: REST_ENDED (aba em background) ──────────────────────────
  useEffect(() => {
    return onSwMessage((msg) => {
      if (msg?.type === 'REST_ENDED') {
        tocarAlertaDescanso()
        vibrarDescansoFim()
      }
    })
  }, [])

  // ─── Haptic feedback nos últimos 5s do descanso ────────────────────────────
  useEffect(() => {
    if (cronometroDescansoAtivo && cronometroDescansoSegundos > 0 && cronometroDescansoSegundos <= 5) {
      navigator.vibrate?.(cronometroDescansoSegundos === 1 ? [150, 50, 150] : [80])
    }
  }, [cronometroDescansoSegundos, cronometroDescansoAtivo])

  const exercicioAtual = sessao?.exercicios[exercicioAtualIndex]
  const planoExercicio = plano?.exercicios.find(ex => ex.exercicioId === exercicioAtual?.exercicioId)
  const totalExercicios = sessao?.exercicios.length ?? 0
  const progresso = totalExercicios ? (exercicioAtualIndex / totalExercicios) * 100 : 0

  const handleCompletarSerie = (serieIdx: number) => {
    if (!exercicioAtual || !sessao) return
    const serie = exercicioAtual.series[serieIdx]
    const novaCompletada = !serie.completada

    if (novaCompletada) {
      marcarSerieCompletada(exercicioAtualIndex, serieIdx)

      // Salvar pesos no plano ao completar série
      setTimeout(() => salvarPesosNoPlano(), 0)

      // PR de peso: mostra se recorde anterior > 0, peso atual > recorde, e peso atual > maior peso já celebrado neste exercício na sessão
      const serieAtual = exercicioAtual.series[serieIdx]
      const exId = exercicioAtual.exercicioId
      const pesoCelebrado = prExibidoRef.current.get(exId) ?? 0
      if (serieAtual.peso > pesoCelebrado) {
        const prCheck = detectarNovoPR(
          { ...serieAtual, completada: true },
          exId,
          recordes,
        )
        if (prCheck && prCheck.tipo === 'peso') {
          prExibidoRef.current.set(exId, serieAtual.peso)
          setShowPrCelebration(true)
          setShowConfetti(true)
          navigator.vibrate?.([100, 50, 100, 50, 200])
          setTimeout(() => { setShowPrCelebration(false); setShowConfetti(false) }, 3000)
        }
      }

      // Prepara audio context em evento de interação (necessário p/ iOS)
      prepararAudio()

      // Superset/group logic: skip rest if next exercise is in same group
      const isInGroup = !!exercicioAtual.agrupamentoId
      const groupExercises = isInGroup
        ? sessao.exercicios
            .map((ex, idx) => ({ ex, idx }))
            .filter(({ ex }) => ex.agrupamentoId === exercicioAtual.agrupamentoId)
        : []
      const currentGroupPos = groupExercises.findIndex(g => g.idx === exercicioAtualIndex)
      const nextInGroup = currentGroupPos >= 0 && currentGroupPos < groupExercises.length - 1
        ? groupExercises[currentGroupPos + 1]
        : null

      // Verifica se todas as séries do exercício atual foram concluídas
      const todasExercicioCompletas = exercicioAtual.series.every((s, i) =>
        i === serieIdx ? true : s.completada
      )

      if (todasExercicioCompletas && isInGroup && nextInGroup) {
        // Move to next exercise in group without rest
        setTimeout(() => {
          // Navigate to next exercise in group
          const target = nextInGroup.idx
          // Set directly via store to avoid step-by-step navigation
          const diff = target - exercicioAtualIndex
          for (let i = 0; i < diff; i++) proximoExercicio()
        }, 600)
      } else if (todasExercicioCompletas && isInGroup && !nextInGroup) {
        // Last in group: rest then loop back to first in group or move on
        prepararAudio()
        iniciarDescanso(exercicioAtual.descansoSegundos)
        // Check if all series in entire group are done
        const allGroupDone = groupExercises.every(({ idx }) =>
          sessao.exercicios[idx].series.every((s, i) =>
            idx === exercicioAtualIndex ? (i === serieIdx ? true : s.completada) : s.completada
          )
        )
        if (allGroupDone) {
          // Move past the group
          const lastGroupIdx = groupExercises[groupExercises.length - 1].idx
          const isLastExercicio = lastGroupIdx === sessao.exercicios.length - 1
          if (!isLastExercicio) {
            setTimeout(() => {
              const target = lastGroupIdx + 1
              const diff = target - exercicioAtualIndex
              for (let i = 0; i < diff; i++) proximoExercicio()
            }, 800)
          } else {
            // Check if entire workout is done
            const todosTreinoCompleto = sessao.exercicios.every((ex, eIdx) =>
              ex.series.every((s, i) =>
                eIdx === exercicioAtualIndex && i === serieIdx ? true : s.completada
              )
            )
            if (todosTreinoCompleto) {
              setTimeout(() => setShowConfirmFinalizar(true), 800)
            }
          }
        } else {
          // Go back to first exercise in group for next round
          setTimeout(() => {
            const target = groupExercises[0].idx
            const diff = exercicioAtualIndex - target
            for (let i = 0; i < diff; i++) exercicioAnterior()
          }, 800)
        }
      } else {
        // Normal (non-group) behavior
        prepararAudio()
        iniciarDescanso(exercicioAtual.descansoSegundos)

        const isLastExercicio = exercicioAtualIndex === sessao.exercicios.length - 1
        if (todasExercicioCompletas) {
          if (!isLastExercicio) {
            setTimeout(() => proximoExercicio(), 800)
          } else {
            const todosTreinoCompleto = sessao.exercicios.every((ex, eIdx) => {
              if (eIdx === exercicioAtualIndex) {
                return ex.series.every((s, i) => i === serieIdx ? true : s.completada)
              }
              return ex.series.every(s => s.completada)
            })
            if (todosTreinoCompleto) {
              setTimeout(() => setShowConfirmFinalizar(true), 800)
            }
          }
        }
      }
    } else {
      atualizarSerie(exercicioAtualIndex, serieIdx, { completada: false })
      descansoAcabouNatural.current = false
      cancelarNotificacaoDescanso()
      pararDescanso()
    }
  }

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

  const handleCompartilhar = async (s: SessaoDeTreino) => {
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
            descansoAcabouNatural.current = false
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
