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
import { AGRUPAMENTO_CONFIG } from '../../types'
import { toast } from 'sonner'
import { calcular1RM } from '../../lib/calculadora1rm'
import { calcularRecordes, detectarNovoPR } from '../../lib/records'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X,
  XCircle,
  SkipForward,
  Timer,
  Pause,
  Play,
  Flag,
  Info,
  Search,
  ExternalLink,
  Zap,
  Share2,
  FileText,
  Trophy,
} from 'lucide-react'
import { Confetti } from '../../components/ui/Confetti'

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
    marcarSerieCompletada, desfazerUltimaSerie,
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

  const gerarImagemRelatorio = async (s: SessaoDeTreino): Promise<Blob | null> => {
    const W = 1080
    const PAD = 72
    const PALETTE = ['#6366f1', '#a78bfa', '#38bdf8', '#f59e0b', '#f472b6', '#22c55e']
    const C = {
      bg: '#0d0f14', surface: '#161820', surface2: '#1e2028',
      accent: '#6366f1', accentLight: 'rgba(99,102,241,0.15)',
      text: '#f0f0f5', muted: '#8b8fa8', subtle: '#565870',
      border: 'rgba(255,255,255,0.08)',
    }

    // ── Compute stats ──────────────────────────────────────────────────
    const totalSeries = s.exercicios.reduce((a, ex) => a + ex.series.filter(sr => sr.completada).length, 0)
    const totalReps   = s.exercicios.reduce((a, ex) => a + ex.series.filter(sr => sr.completada).reduce((b, sr) => b + (sr.repeticoes ?? 0), 0), 0)
    const volumeKg    = s.volumeTotal ? Math.round(s.volumeTotal) : 0
    const exercFeitos = s.exercicios.filter(ex => ex.series.some(sr => sr.completada)).length
    const mediaSerie  = totalSeries > 0 && volumeKg > 0 ? `${Math.round(volumeKg / totalSeries)}kg` : '–'
    const duracao     = s.duracaoSegundos ? formatarTempo(s.duracaoSegundos) : '–'
    const data        = new Date(s.iniciadoEm).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

    // ── Volume per exercise (for bar chart) ────────────────────────────
    const barData = s.exercicios
      .map(ex => ({
        nome: ex.exercicioNome,
        vol: ex.series.filter(sr => sr.completada).reduce((a, sr) => a + (sr.peso ?? 0) * (sr.repeticoes ?? 0), 0),
        sets: ex.series.filter(sr => sr.completada).length,
      }))
      .filter(ex => ex.sets > 0)
      .sort((a, b) => b.vol - a.vol)
      .slice(0, 6)

    // ── Muscle groups ──────────────────────────────────────────────────
    const muscleMap = new Map<string, number>()
    s.exercicios.forEach(ex => {
      if (ex.series.some(sr => sr.completada) && ex.grupoMuscular)
        muscleMap.set(ex.grupoMuscular, (muscleMap.get(ex.grupoMuscular) ?? 0) + 1)
    })
    const muscles = [...muscleMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)

    // ── Height estimate ────────────────────────────────────────────────
    const H =
      520 +                                          // header
      (2 * 132 + 16 + 44) +                          // stats grid
      (barData.length > 0 ? 36 + barData.length * 68 + 24 : 0) +
      (muscles.length > 0 ? 36 + Math.ceil(muscles.length / 4) * 62 + 40 : 0) +
      140                                            // footer + bottom pad

    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!

    // ── Background ─────────────────────────────────────────────────────
    ctx.fillStyle = C.bg
    ctx.fillRect(0, 0, W, H)

    // Top gradient bar
    const topGrad = ctx.createLinearGradient(0, 0, W, 0)
    topGrad.addColorStop(0, '#6366f1')
    topGrad.addColorStop(1, '#a78bfa')
    ctx.fillStyle = topGrad
    ctx.fillRect(0, 0, W, 10)

    // Radial glow
    const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 60, W * 0.75)
    glow.addColorStop(0, 'rgba(99,102,241,0.2)')
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, 400)

    let y = 60
    ctx.textAlign = 'center'

    // ── App label ──────────────────────────────────────────────────────
    ctx.fillStyle = C.muted
    ctx.font = `500 30px -apple-system, Inter, sans-serif`
    y += 44; ctx.fillText('Training App', W / 2, y)

    // Trophy
    ctx.font = `84px serif`
    y += 102; ctx.fillText('🏆', W / 2, y)

    // Title
    ctx.fillStyle = C.text
    ctx.font = `800 64px -apple-system, Inter, sans-serif`
    y += 80; ctx.fillText('Treino Concluído!', W / 2, y)

    // Plan name pill
    ctx.font = `600 36px -apple-system, Inter, sans-serif`
    const pillW = ctx.measureText(s.planoNome).width + 56
    y += 24
    const pillY = y
    ctx.fillStyle = C.accentLight
    ctx.beginPath(); ctx.roundRect(W / 2 - pillW / 2, pillY, pillW, 54, 27); ctx.fill()
    ctx.fillStyle = C.accent
    ctx.fillText(s.planoNome, W / 2, pillY + 36)
    y = pillY + 54 + 16

    // Date
    ctx.fillStyle = C.muted
    ctx.font = `400 30px -apple-system, Inter, sans-serif`
    y += 32; ctx.fillText(data, W / 2, y)
    y += 36

    // Divider
    ctx.strokeStyle = C.border; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke()
    y += 40

    // ── Stats Grid 2×3 ─────────────────────────────────────────────────
    const statsData = [
      { icon: '⏱', label: 'DURAÇÃO',      value: duracao },
      { icon: '📦', label: 'VOLUME TOTAL', value: volumeKg > 0 ? `${volumeKg}kg` : '–' },
      { icon: '✅', label: 'SÉRIES',       value: String(totalSeries) },
      { icon: '🔁', label: 'REPETIÇÕES',   value: String(totalReps) },
      { icon: '💪', label: 'EXERCÍCIOS',   value: String(exercFeitos) },
      { icon: '⚖️', label: 'MÉDIA/SÉRIE',  value: mediaSerie },
    ]
    const COLS = 3, ROWS = 2, GAP = 16
    const cellW = (W - PAD * 2 - GAP * (COLS - 1)) / COLS
    const cellH = 132

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const st = statsData[r * COLS + c]
        const cx = PAD + c * (cellW + GAP)
        const cy = y + r * (cellH + GAP)
        ctx.fillStyle = C.surface
        ctx.beginPath(); ctx.roundRect(cx, cy, cellW, cellH, 20); ctx.fill()
        ctx.strokeStyle = C.border; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.roundRect(cx, cy, cellW, cellH, 20); ctx.stroke()
        ctx.font = `28px serif`; ctx.textAlign = 'center'
        ctx.fillText(st.icon, cx + cellW / 2, cy + 36)
        ctx.fillStyle = C.text
        ctx.font = `700 40px -apple-system, Inter, sans-serif`
        ctx.fillText(st.value, cx + cellW / 2, cy + 78)
        ctx.fillStyle = C.subtle
        ctx.font = `500 20px -apple-system, Inter, sans-serif`
        ctx.fillText(st.label, cx + cellW / 2, cy + 110)
      }
    }
    y += ROWS * cellH + (ROWS - 1) * GAP + 44

    // ── Bar Chart: volume por exercício ────────────────────────────────
    if (barData.length > 0) {
      const maxVol = Math.max(...barData.map(e => e.vol), 1)
      const LABEL_W = 196
      const barAreaW = W - PAD * 2 - LABEL_W - 16
      const BAR_H = 36

      ctx.fillStyle = C.muted
      ctx.font = `600 24px -apple-system, Inter, sans-serif`
      ctx.textAlign = 'left'
      ctx.fillText('VOLUME POR EXERCÍCIO', PAD, y)
      y += 36

      barData.forEach((ex, i) => {
        const color = PALETTE[i % PALETTE.length]
        const barFill = (ex.vol / maxVol) * barAreaW
        const barX = PAD + LABEL_W + 16
        const barY = y

        // Label
        const shortName = ex.nome.length > 15 ? ex.nome.slice(0, 13) + '…' : ex.nome
        ctx.fillStyle = C.muted
        ctx.font = `400 23px -apple-system, Inter, sans-serif`
        ctx.textAlign = 'left'
        ctx.fillText(shortName, PAD, barY + 25)

        // Track
        ctx.fillStyle = C.surface2
        ctx.beginPath(); ctx.roundRect(barX, barY, barAreaW, BAR_H, 8); ctx.fill()

        // Fill
        if (barFill > 8) {
          const bg = ctx.createLinearGradient(barX, 0, barX + barAreaW, 0)
          bg.addColorStop(0, color)
          bg.addColorStop(1, color + '55')
          ctx.fillStyle = bg
          ctx.beginPath(); ctx.roundRect(barX, barY, barFill, BAR_H, 8); ctx.fill()
        }

        // Value after bar
        if (ex.vol > 0) {
          ctx.fillStyle = C.subtle
          ctx.font = `500 21px -apple-system, Inter, sans-serif`
          ctx.textAlign = 'left'
          ctx.fillText(`${Math.round(ex.vol)}kg`, barX + barFill + 10, barY + 25)
        }

        y += BAR_H + 32
      })
      y += 12
    }

    // ── Muscle Group Pills ─────────────────────────────────────────────
    if (muscles.length > 0) {
      ctx.fillStyle = C.muted
      ctx.font = `600 24px -apple-system, Inter, sans-serif`
      ctx.textAlign = 'left'
      ctx.fillText('GRUPOS MUSCULARES', PAD, y)
      y += 36

      let chipX = PAD
      const CHIP_H = 48

      muscles.forEach(([muscle], i) => {
        const color = PALETTE[i % PALETTE.length]
        const label = muscle.charAt(0).toUpperCase() + muscle.slice(1)
        ctx.font = `500 23px -apple-system, Inter, sans-serif`
        const chipW = ctx.measureText(label).width + 40

        if (chipX + chipW > W - PAD) { chipX = PAD; y += CHIP_H + 12 }

        ctx.fillStyle = color + '22'
        ctx.beginPath(); ctx.roundRect(chipX, y, chipW, CHIP_H, CHIP_H / 2); ctx.fill()
        ctx.strokeStyle = color + '60'; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.roundRect(chipX, y, chipW, CHIP_H, CHIP_H / 2); ctx.stroke()
        ctx.fillStyle = color; ctx.textAlign = 'center'
        ctx.fillText(label, chipX + chipW / 2, y + 31)

        chipX += chipW + 12
      })
      y += CHIP_H + 36
    }

    // ── Footer ─────────────────────────────────────────────────────────
    y += 12
    ctx.strokeStyle = C.border; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke()
    y += 36
    ctx.fillStyle = C.subtle
    ctx.font = `400 26px -apple-system, Inter, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('💪 Gerado pelo Training App', W / 2, y + 32)

    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
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
      <div className="fixed inset-0 z-200 flex flex-col bg-bg overflow-y-auto">
        <Confetti active={showConfetti} />
        {/* Top bar com botão fechar */}
        <div className="flex justify-end px-4 pt-4 pb-2">
          <button
            onClick={() => navigate({ to: '/treinos' })}
            className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-muted"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>
        {/* Header */}
        <div className="flex flex-col items-center pt-2 pb-6 px-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-[rgba(34,197,94,0.15)] flex items-center justify-center mb-4 animate-trophy-bounce">
            <Trophy size={36} className="text-success" />
          </div>
          <h1 className="text-2xl font-bold text-text animate-celebration-pulse">Treino Concluído!</h1>
          <p className="text-text-muted text-sm mt-1">{relatorio.planoNome}</p>
          <p className="text-text-subtle text-xs mt-0.5 capitalize">
            {new Date(relatorio.iniciadoEm).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 px-4 mb-6">
          {[
            { label: 'Duração', value: relatorio.duracaoSegundos ? formatarTempo(relatorio.duracaoSegundos) : '–' },
            { label: 'Volume (kg)', value: relatorio.volumeTotal ? Math.round(relatorio.volumeTotal) : '–' },
            { label: 'Séries ✓', value: relatorio.exercicios.reduce((a, ex) => a + ex.series.filter(s => s.completada).length, 0) },
          ].map((stat, i) => (
            <div key={i} className="card p-3 text-center">
              <p className="text-xl font-bold text-text">{stat.value}</p>
              <p className="text-[10px] text-text-muted mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Exercícios */}
        <div className="flex flex-col gap-2 px-4 mb-6">
          {relatorio.exercicios.map((ex) => {
            const seriesOk = ex.series.filter(s => s.completada)
            return (
              <div key={ex.exercicioId} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm text-text">{ex.exercicioNome}</p>
                  <span className="text-xs text-text-muted">{seriesOk.length}/{ex.series.length} séries</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {seriesOk.map((sr, i) => (
                    <span key={i} className="text-xs bg-surface-2 text-text-muted px-2 py-0.5 rounded-lg">
                      {sr.peso ?? 0}kg × {sr.repeticoes ?? 0}
                    </span>
                  ))}
                  {seriesOk.length === 0 && (
                    <span className="text-xs text-text-subtle italic">Nenhuma série completada</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-3 px-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2.5rem)' }}>
          <button
            className="btn-primary w-full py-4 flex items-center justify-center gap-2"
            onClick={() => handleCompartilhar(relatorio)}
            disabled={gerandoImagem}
          >
            {gerandoImagem
              ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Gerando imagem...</>
              : copiado ? <><Share2 size={18} /> Imagem salva!</>
              : <><Share2 size={18} /> Compartilhar como Imagem</>
            }
          </button>
          <button
            className="btn-ghost w-full py-3"
            onClick={() => navigate({ to: '/historico' })}
          >
            Ver Histórico
          </button>
        </div>
      </div>
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
      {/* PR Celebration Overlay */}
      {showPrCelebration && (
        <div className="fixed inset-0 z-300 flex items-center justify-center pointer-events-none">
          <div className="animate-celebration-pulse text-center">
            <span className="text-7xl block mb-2">🏆</span>
            <span className="text-xl font-black text-accent">NOVO PR!</span>
          </div>
        </div>
      )}
      {/* ─── Header fixo ───────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2 flex flex-col gap-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate({ to: '/treinos' })} className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-text-muted">
            <XCircle size={18} />
          </button>
          {/* Timer geral */}
          <div className="flex items-center gap-2">
            <Timer size={14} className="text-text-subtle" />
            <span className="timer-sm text-text-muted">
              {formatarTempo(cronometroGeralSegundos)}
            </span>
            <button
              onClick={pausado ? retomar : pausarTreino}
              className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-text-muted"
            >
              {pausado ? <Play size={16} /> : <Pause size={16} />}
            </button>
          </div>
          <button onClick={() => { setNotasTemp(sessao?.notas ?? ''); setShowNotas(true) }}
            className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-text-muted relative">
            <FileText size={16} />
            {sessao?.notas && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent" />}
          </button>
          <button onClick={() => setShowConfirmFinalizar(true)} disabled={finalizando}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(34,197,94,0.12)] text-success text-sm font-semibold">
            <Flag size={14} />
            {finalizando ? '...' : 'Finalizar'}
          </button>
        </div>

        {/* Progress bar */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progresso}%` }} />
        </div>

        {/* Exercise nav */}
        <div className="flex items-center justify-between py-1">
          <button onClick={exercicioAnterior} disabled={exercicioAtualIndex === 0}
            className="btn-ghost p-1.5 disabled:opacity-30">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="text-[10px] text-text-subtle font-medium">
              {exercicioAtualIndex + 1} / {totalExercicios}
            </p>
            <p className="text-text font-bold text-sm">
              {exercicioAtual.exercicioNome}
            </p>
            <p className="text-[10px] text-text-muted">
              {exercicioAtual.grupoMuscular}
            </p>
            {exercicioAtual.agrupamentoId && (
              <span
                className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  color: AGRUPAMENTO_CONFIG[exercicioAtual.tipoAgrupamento ?? 'superset']?.cor,
                  background: AGRUPAMENTO_CONFIG[exercicioAtual.tipoAgrupamento ?? 'superset']?.corBg,
                }}
              >
                {AGRUPAMENTO_CONFIG[exercicioAtual.tipoAgrupamento ?? 'superset']?.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowInfo(true)} className="btn-ghost p-1.5">
              <Info size={18} className="text-accent" />
            </button>
            <button onClick={proximoExercicio} disabled={exercicioAtualIndex === totalExercicios - 1}
              className="btn-ghost p-1.5 disabled:opacity-30">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

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

      {/* ─── Cronômetro de descanso (inline) ──────────────────── */}
      {cronometroDescansoAtivo && (
        <div className="mx-4 mb-4 p-4 rounded-2xl bg-surface border border-border flex items-center justify-between animate-scale-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
              <Timer size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-medium">Descanso</p>
              <p className={`text-2xl font-black tabular-nums ${
                cronometroDescansoSegundos <= 10 && cronometroDescansoSegundos > 0
                  ? 'text-warning'
                  : 'text-text'
              }`}>
                {formatarTempo(cronometroDescansoSegundos)}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              descansoAcabouNatural.current = false
              cancelarNotificacaoDescanso()
              pararDescanso()
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-2 text-text-muted text-sm font-semibold hover:bg-surface-3 transition-colors"
          >
            <SkipForward size={14} />
            Pular
          </button>
        </div>
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
              <div className="bg-accent/10 border border-accent/20 rounded-xl px-3 py-3 ml-[44px] mr-[52px] mb-2 mt-1">
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
                      className="flex-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-accent bg-accent/10 border border-accent/20"
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

      {/* ─── Modal de Confirmação Cancelar ─────────────────────────── */}
      {showConfirmCancelar && (
        <div className="modal-overlay" onClick={() => setShowConfirmCancelar(false)}>
          <div className="modal-content text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-3xl bg-[rgba(239,68,68,0.12)] flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-text mb-2">Cancelar Treino?</h2>
            <p className="text-text-muted text-sm mb-6">
              Todo o progresso desta sessão será perdido e não será salvo no histórico.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  cancelarNotificacaoDescanso()
                  limparLocal()
                  navigate({ to: '/treinos' })
                }}
                className="btn-danger w-full py-4 text-base"
              >
                Sim, Cancelar Treino
              </button>
              <button
                onClick={() => setShowConfirmCancelar(false)}
                className="btn-ghost w-full py-3"
              >
                Continuar Treinando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal de Informações ───────────────────────────────────── */}
      {showInfo && (
        <div className="modal-overlay" onClick={() => setShowInfo(false)}>
          <div className="modal-content max-h-[80dvh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text truncate pr-4">{exercicioAtual.exercicioNome}</h2>
              <button onClick={() => setShowInfo(false)} className="btn-ghost p-2 text-text-subtle">
                <XCircle size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pb-2">
              {/* Media fallback if GIF is available */}
              {(exercicioAtual.gifUrl || planoExercicio?.exercicio.gifUrl) && (
                <img
                  src={exercicioAtual.gifUrl || planoExercicio?.exercicio.gifUrl}
                  className="w-full max-h-56 object-contain rounded-xl bg-surface-2"
                  alt="demonstração"
                />
              )}

              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-1">Músculo</p>
                  <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium capitalize">
                    {exercicioAtual.grupoMuscular}
                  </span>
                </div>
                {(planoExercicio?.exercicio.equipamento) && (
                  <div>
                    <p className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-1">Equipamento</p>
                    <p className="text-sm text-text capitalize">{planoExercicio?.exercicio.equipamento}</p>
                  </div>
                )}
              </div>

              {/* Observação do plano */}
              {exercicioAtual.notas && (
                <div className="p-3 rounded-xl bg-accent/5 border border-accent/10">
                  <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">Observação do Treino</p>
                  <p className="text-sm text-text italic">"{exercicioAtual.notas}"</p>
                </div>
              )}

              {/* Instruções */}
              {(exercicioAtual.instrucoes || planoExercicio?.exercicio.instrucoes) && (
                <div>
                  <p className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-2">Instruções</p>
                  <ol className="list-decimal list-inside space-y-2">
                    {(exercicioAtual.instrucoes || planoExercicio?.exercicio.instrucoes || []).map((inst, i) => (
                      <li key={i} className="text-xs text-text-muted leading-relaxed">{inst}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Busca Google */}
              <button
                onClick={() => {
                  const query = encodeURIComponent(`${exercicioAtual.exercicioNome} ${exercicioAtual.grupoMuscular} como fazer`)
                  window.open(`https://www.google.com/search?q=${query}`, '_blank')
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-3 text-text text-xs font-semibold hover:bg-surface-2 transition-colors"
              >
                <Search size={14} />
                Buscar no Google
                <ExternalLink size={12} className="opacity-50" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal de Notas ──────────────────────────────────────── */}
      {showNotas && (
        <div className="modal-overlay" onClick={() => setShowNotas(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-text mb-3">📝 Notas do Treino</h2>
            <textarea
              value={notasTemp}
              onChange={e => setNotasTemp(e.target.value)}
              placeholder="Como está se sentindo? Algo diferente hoje?..."
              className="input-field w-full text-sm resize-none"
              rows={4}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowNotas(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                onClick={() => { atualizarNotas(notasTemp); setShowNotas(false); toast.success('Notas salvas!') }}
                className="btn-primary flex-1"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal de Confirmação Cancelar ─────────────────────────── */}
      {showConfirmCancelar && (
        <div className="modal-overlay" onClick={() => setShowConfirmCancelar(false)}>
          <div className="modal-content text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-3xl bg-[rgba(239,68,68,0.12)] flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-text mb-2">Cancelar Treino?</h2>
            <p className="text-text-muted text-sm mb-6">
              Todo o progresso desta sessão será perdido e não será salvo no histórico.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  cancelarNotificacaoDescanso()
                  limparLocal()
                  navigate({ to: '/treinos' })
                }}
                className="btn-danger w-full py-4 text-base"
              >
                Sim, Cancelar Treino
              </button>
              <button
                onClick={() => setShowConfirmCancelar(false)}
                className="btn-ghost w-full py-3"
              >
                Continuar Treinando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal de Confirmação Finalizar ────────────────────────── */}
      {showConfirmFinalizar && (
        <div className="modal-overlay" onClick={() => setShowConfirmFinalizar(false)}>
          <div className="modal-content text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-3xl bg-[rgba(34,197,94,0.12)] flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-success" />
            </div>
            <h2 className="text-xl font-bold text-text mb-2">Finalizar Treino?</h2>
            <p className="text-text-muted text-sm mb-6">
              Parabéns pelo esforço! Todas as séries concluídas serão registradas no seu histórico.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleFinalizar}
                disabled={finalizando}
                className="btn-success w-full py-4 text-base"
              >
                {finalizando ? 'Salvando...' : 'Sim, Finalizar Agora'}
              </button>
              <button
                onClick={() => setShowConfirmFinalizar(false)}
                className="btn-ghost w-full py-3"
              >
                Continuar Treinando
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
