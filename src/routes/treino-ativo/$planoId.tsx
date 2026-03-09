import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { usePlanos } from '../../hooks/usePlanos'
import { useHistorico } from '../../hooks/useHistorico'
import { useAuthStore, useTreinoAtivoStore } from '../../stores'
import {
  enviarNotificacaoTreino,
  limparNotificacoesTreino,
  solicitarPermissaoNotificacao,
  formatarTempo,
} from '../../lib/notifications'
import type { SessaoDeTreino, SerieRegistrada, ExercicioNaSessao } from '../../types'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
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
  Trophy,
} from 'lucide-react'

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

  const store = useTreinoAtivoStore()
  const {
    sessao, exercicioAtualIndex, cronometroGeralSegundos,
    cronometroDescansoSegundos, cronometroDescansoAtivo,
    pausado, iniciado,
    iniciarTreino, finalizarTreino, pausarTreino, retomar,
    proximoExercicio, exercicioAnterior, atualizarSerie,
    iniciarDescanso, pararDescanso, tickGeral, tickDescanso,
  } = store

  const timerRef = useRef<number | null>(null)
  const descansoRef = useRef<number | null>(null)

  useEffect(() => { setApplyAll(null) }, [exercicioAtualIndex])
  const [finalizando, setFinalizando] = useState(false)
  const [showConfirmFinalizar, setShowConfirmFinalizar] = useState(false)
  const [relatorio, setRelatorio] = useState<SessaoDeTreino | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [gerandoImagem, setGerandoImagem] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [applyAll, setApplyAll] = useState<{ field: 'peso' | 'repeticoes'; sIdx: number; value: number } | null>(null)

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
    const exerciciosNaSessao: ExercicioNaSessao[] = plano.exercicios.map((ex) => ({
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
      series: Array.from({ length: ex.series }, (_, i) => ({
        id: uuidv4(),
        ordem: i,
        repeticoes: ex.seriesDetalhadas?.[i]?.repeticoes ?? ex.repeticoesMeta,
        weight: ex.seriesDetalhadas?.[i]?.peso ?? (ex.pesoMeta ?? 0),
        peso: ex.seriesDetalhadas?.[i]?.peso ?? (ex.pesoMeta ?? 0),
        completada: false,
      } as SerieRegistrada)),
    }))
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

  // ─── Notificação ao iniciar descanso ──────────────────────────────────────
  useEffect(() => {
    if (cronometroDescansoAtivo && sessao) {
      const ex = sessao.exercicios[exercicioAtualIndex]
      enviarNotificacaoTreino(
        `⏱ Descanso – ${cronometroDescansoSegundos}s`,
        `Próximo: ${ex?.exercicioNome ?? ''}`,
      )
    }
    if (!cronometroDescansoAtivo) limparNotificacoesTreino()
  }, [cronometroDescansoAtivo])

  const exercicioAtual = sessao?.exercicios[exercicioAtualIndex]
  const planoExercicio = plano?.exercicios.find(ex => ex.exercicioId === exercicioAtual?.exercicioId)
  const totalExercicios = sessao?.exercicios.length ?? 0
  const progresso = totalExercicios ? (exercicioAtualIndex / totalExercicios) * 100 : 0

  const handleCompletarSerie = (serieIdx: number) => {
    if (!exercicioAtual) return
    const serie = exercicioAtual.series[serieIdx]
    const novaCompletada = !serie.completada
    atualizarSerie(exercicioAtualIndex, serieIdx, { completada: novaCompletada })
    if (novaCompletada) {
      iniciarDescanso(exercicioAtual.descansoSegundos)
      // Verifica se todas as séries foram concluídas após este update
      const todasCompletas = exercicioAtual.series.every((s, i) =>
        i === serieIdx ? true : s.completada
      )
      if (todasCompletas && exercicioAtualIndex < (sessao?.exercicios.length ?? 0) - 1) {
        setTimeout(() => proximoExercicio(), 800)
      }
    } else {
      pararDescanso()
    }
  }

  const handleFinalizar = async () => {
    setFinalizando(true)
    const sessaoFinalizada = finalizarTreino()
    limparNotificacoesTreino()
    if (sessaoFinalizada) {
      await salvarSessaoCompleta(sessaoFinalizada)
      setShowConfirmFinalizar(false)
      setRelatorio(sessaoFinalizada)
    } else {
      navigate({ to: '/historico' })
    }
    setFinalizando(false)
  }

  const gerarImagemRelatorio = async (s: SessaoDeTreino): Promise<Blob | null> => {
    const W = 1080
    const PAD = 64
    const C = {
      bg: '#0d0f14', surface: '#161820', surface2: '#1e2028',
      accent: '#6366f1', success: '#22c55e',
      text: '#f0f0f5', muted: '#8b8fa8', subtle: '#565870',
      border: 'rgba(255,255,255,0.08)',
    }

    const exerciciosVisiveis = s.exercicios.filter(ex => ex.series.some(sr => sr.completada))
    const totalSeries = s.exercicios.reduce((a, ex) => a + ex.series.filter(sr => sr.completada).length, 0)
    const duracao = s.duracaoSegundos ? formatarTempo(s.duracaoSegundos) : '–'
    const volume = s.volumeTotal ? `${Math.round(s.volumeTotal)} kg` : '–'
    const data = new Date(s.iniciadoEm).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

    // Estimate height
    const headerH = 320
    const statsH = 160
    const exH = exerciciosVisiveis.reduce((acc, ex) => {
      const sets = ex.series.filter(sr => sr.completada)
      const rows = Math.ceil(sets.length / 4)
      return acc + 80 + rows * 52 + 32
    }, 0)
    const footerH = 100
    const H = headerH + statsH + exH + footerH + PAD * 2

    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!

    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, r)
      ctx.fill()
    }

    // Background
    ctx.fillStyle = C.bg
    ctx.fillRect(0, 0, W, H)

    // Top accent bar
    const grad = ctx.createLinearGradient(0, 0, W, 0)
    grad.addColorStop(0, '#6366f1')
    grad.addColorStop(1, '#a78bfa')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, 8)

    // Subtle top glow
    const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, W * 0.7)
    glow.addColorStop(0, 'rgba(99,102,241,0.18)')
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, 300)

    let y = 48

    // App label
    ctx.fillStyle = C.muted
    ctx.font = `500 ${36}px -apple-system, Inter, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('Training App', W / 2, (y += 48))

    // Trophy
    ctx.font = `${96}px serif`
    ctx.fillText('🏆', W / 2, (y += 114))

    // Title
    ctx.fillStyle = C.text
    ctx.font = `800 ${72}px -apple-system, Inter, sans-serif`
    ctx.fillText('Treino Concluído!', W / 2, (y += 88))

    // Plan name
    ctx.fillStyle = C.accent
    ctx.font = `600 ${44}px -apple-system, Inter, sans-serif`
    ctx.fillText(s.planoNome, W / 2, (y += 58))

    // Date
    ctx.fillStyle = C.muted
    ctx.font = `400 ${34}px -apple-system, Inter, sans-serif`
    ctx.fillText(data, W / 2, (y += 50))

    // Divider
    y += 36
    ctx.strokeStyle = C.border
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(PAD, y)
    ctx.lineTo(W - PAD, y)
    ctx.stroke()
    y += 40

    // Stats cards
    const stats = [
      { label: 'DURAÇÃO', value: duracao },
      { label: 'VOLUME', value: volume },
      { label: 'SÉRIES', value: String(totalSeries) },
    ]
    const cardW = (W - PAD * 2 - 24) / 3
    const cardH = 130
    stats.forEach((st, i) => {
      const cx = PAD + i * (cardW + 12)
      ctx.fillStyle = C.surface
      roundRect(cx, y, cardW, cardH, 20)
      // border
      ctx.strokeStyle = C.border
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.roundRect(cx, y, cardW, cardH, 20)
      ctx.stroke()
      // value
      ctx.fillStyle = C.text
      ctx.font = `700 ${48}px -apple-system, Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(st.value, cx + cardW / 2, y + 72)
      // label
      ctx.fillStyle = C.subtle
      ctx.font = `500 ${26}px -apple-system, Inter, sans-serif`
      ctx.fillText(st.label, cx + cardW / 2, y + 108)
    })
    y += cardH + 48

    // Exercises
    ctx.textAlign = 'left'
    exerciciosVisiveis.forEach((ex) => {
      const sets = ex.series.filter(sr => sr.completada)
      if (!sets.length) return

      // Exercise name row
      ctx.fillStyle = C.text
      ctx.font = `600 ${38}px -apple-system, Inter, sans-serif`
      ctx.fillText(ex.exercicioNome, PAD, y)
      ctx.fillStyle = C.muted
      ctx.font = `400 ${30}px -apple-system, Inter, sans-serif`
      ctx.fillText(`${sets.length} séries`, W - PAD - 140, y)
      y += 44

      // Set chips
      let chipX = PAD
      const chipH = 44
      const chipPadX = 24
      sets.forEach((sr) => {
        const label = `${sr.peso ?? 0}kg × ${sr.repeticoes ?? 0}`
        ctx.font = `500 ${26}px -apple-system, Inter, sans-serif`
        const tw = ctx.measureText(label).width
        const cw = tw + chipPadX * 2

        if (chipX + cw > W - PAD) {
          chipX = PAD
          y += chipH + 10
        }

        ctx.fillStyle = C.surface2
        ctx.beginPath()
        ctx.roundRect(chipX, y, cw, chipH, 12)
        ctx.fill()
        ctx.strokeStyle = C.border
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(chipX, y, cw, chipH, 12)
        ctx.stroke()

        ctx.fillStyle = C.muted
        ctx.textAlign = 'center'
        ctx.fillText(label, chipX + cw / 2, y + chipH - 12)
        ctx.textAlign = 'left'
        chipX += cw + 10
      })
      y += chipH + 32
    })

    // Footer divider
    y += 8
    ctx.strokeStyle = C.border
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(PAD, y)
    ctx.lineTo(W - PAD, y)
    ctx.stroke()
    y += 32

    // Footer text
    ctx.fillStyle = C.subtle
    ctx.font = `400 ${30}px -apple-system, Inter, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('💪 Gerado pelo Training App', W / 2, y + 36)

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
      <div className="fixed inset-0 z-[200] flex flex-col bg-[var(--color-bg)] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col items-center pt-10 pb-6 px-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-[rgba(34,197,94,0.15)] flex items-center justify-center mb-4">
            <Trophy size={36} className="text-[var(--color-success)]" />
          </div>
          <h1 className="text-2xl font-bold text-text">Treino Concluído!</h1>
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
        <p className="text-[var(--color-text-muted)]">Carregando treino...</p>
      </div>
    )
  }

  const seriesCompletadas = exercicioAtual.series.filter((s) => s.completada).length

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg)] max-w-[480px] mx-auto w-full border-x border-border/50 shadow-2xl">
      {/* ─── Header fixo ───────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2 flex flex-col gap-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate({ to: '/treinos' })} className="w-9 h-9 rounded-xl bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-text-muted)]">
            <XCircle size={18} />
          </button>
          {/* Timer geral */}
          <div className="flex items-center gap-2">
            <Timer size={14} className="text-[var(--color-text-subtle)]" />
            <span className="timer-sm text-[var(--color-text-muted)]">
              {formatarTempo(cronometroGeralSegundos)}
            </span>
            <button
              onClick={pausado ? retomar : pausarTreino}
              className="w-9 h-9 rounded-xl bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-text-muted)]"
            >
              {pausado ? <Play size={16} /> : <Pause size={16} />}
            </button>
          </div>
          <button onClick={() => setShowConfirmFinalizar(true)} disabled={finalizando}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(34,197,94,0.12)] text-[var(--color-success)] text-sm font-semibold">
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
            <p className="text-[10px] text-[var(--color-text-subtle)] font-medium">
              {exercicioAtualIndex + 1} / {totalExercicios}
            </p>
            <p className="text-[var(--color-text)] font-bold text-sm">
              {exercicioAtual.exercicioNome}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)]">
              {exercicioAtual.grupoMuscular}
            </p>
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
          <div className="aspect-[16/9] max-h-48  rounded-2xl overflow-hidden bg-[var(--color-surface)]">
            <img
              src={exercicioAtual.gifUrl}
              alt={exercicioAtual.exercicioNome}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-24 rounded-2xl bg-[var(--color-surface)] flex items-center justify-center">
            <span className="text-5xl">💪</span>
          </div>
        )}
      </div>

      {/* ─── Cronômetro de descanso ────────────────────────────────── */}
      {cronometroDescansoAtivo && (
        <div className="mx-4 mb-4 card p-4 border-[var(--color-accent)] bg-[var(--color-accent-subtle)] animate-scale-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">DESCANSO</p>
              <p className="timer-display text-[var(--color-accent)]">
                {formatarTempo(cronometroDescansoSegundos)}
              </p>
            </div>
            <button onClick={pararDescanso}
              className="btn-ghost flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
              <SkipForward size={16} />
              Pular
            </button>
          </div>
        </div>
      )}

      {/* ─── Tabela de séries ──────────────────────────────────────── */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {/* Header */}
        {(() => {
          const tipo = exercicioAtual.tipoSerie ?? 'reps'
          const labels: Record<string, string> = { reps: 'Reps', tempo: 'Min', falha: 'Falha ⚡' }
          return (
            <div className="grid grid-cols-[32px_1fr_1fr_40px] gap-2 px-3 mb-1">
              {['#', 'Peso (kg)', labels[tipo] ?? 'Reps', ''].map((h, i) => (
                <span key={i} className="text-[10px] text-[var(--color-text-subtle)] font-semibold text-center">{h}</span>
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
            <div
              key={serie.id}
              className={`set-row ${serie.completada ? 'completed' : ''}`}
            >
              {/* Número da série */}
              <span className={`text-sm font-bold text-center ${serie.completada ? 'text-[var(--color-success)]' : 'text-[var(--color-text-subtle)]'}`}>
                {sIdx + 1}
              </span>

              {/* Peso */}
              <input
                type="number"
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
                    ? 'bg-[var(--color-success)] text-white'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-text-subtle)] hover:bg-[rgba(34,197,94,0.15)] hover:text-[var(--color-success)]'
                }`}
              >
                <CheckCircle size={17} />
              </button>
            </div>
            )
          })}
        </div>

        {/* Repetir valor em outras séries */}
        {applyAll && (
          <div className="mt-3 bg-accent/10 border border-accent/20 rounded-xl px-3 py-2.5">
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

        {/* Progresso séries */}
        <div className="mt-4 text-center">
          <p className="text-xs text-[var(--color-text-muted)]">
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
            className="mt-4 w-full btn-secondary flex items-center justify-center gap-2"
          >
            <SkipForward size={16} />
            Próximo: {sessao.exercicios[exercicioAtualIndex + 1]?.exercicioNome}
          </button>
        )}
      </div>

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
      {/* ─── Modal de Confirmação Finalizar ────────────────────────── */}
      {showConfirmFinalizar && (
        <div className="modal-overlay" onClick={() => setShowConfirmFinalizar(false)}>
          <div className="modal-content text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-3xl bg-[rgba(34,197,94,0.12)] flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-[var(--color-success)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Finalizar Treino?</h2>
            <p className="text-[var(--color-text-muted)] text-sm mb-6">
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
