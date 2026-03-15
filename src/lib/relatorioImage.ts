import type { WorkoutSession } from '../types'
import { formatarTempo } from './notifications'

export async function gerarImagemRelatorio(s: WorkoutSession): Promise<Blob | null> {
  const W = 1080
  const PAD = 72
  const PALETTE = ['#6366f1', '#a78bfa', '#38bdf8', '#f59e0b', '#f472b6', '#22c55e']
  const C = {
    bg: '#0d0f14',
    surface: '#161820',
    surface2: '#1e2028',
    accent: '#6366f1',
    accentLight: 'rgba(99,102,241,0.15)',
    text: '#f0f0f5',
    muted: '#8b8fa8',
    subtle: '#565870',
    border: 'rgba(255,255,255,0.08)',
  }

  const totalSeries = s.exercises.reduce((a: number, ex) => a + ex.sets.filter(sr => sr.completed).length, 0)
  const totalReps = s.exercises.reduce(
    (a: number, ex) => a + ex.sets.filter(sr => sr.completed).reduce((b: number, sr) => b + (sr.reps ?? 0), 0),
    0
  )
  const volumeKg = s.totalVolume ? Math.round(s.totalVolume) : 0
  const exercFeitos = s.exercises.filter(ex => ex.sets.some(sr => sr.completed)).length
  const mediaSerie = totalSeries > 0 && volumeKg > 0 ? `${Math.round(volumeKg / totalSeries)}kg` : '–'
  const duracao = s.durationSeconds ? formatarTempo(s.durationSeconds) : '–'
  const data = new Date(s.startedAt).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const barData = s.exercises
    .map((ex: { exerciseName: string; sets: { completed: boolean; weight?: number; reps?: number }[] }) => ({
      nome: ex.exerciseName,
      vol: ex.sets
        .filter(sr => sr.completed)
        .reduce((a: number, sr) => a + (sr.weight ?? 0) * (sr.reps ?? 0), 0),
      sets: ex.sets.filter(sr => sr.completed).length,
    }))
    .filter((ex: { sets: number }) => ex.sets > 0)
    .sort((a: { vol: number }, b: { vol: number }) => b.vol - a.vol)
    .slice(0, 6)

  const muscleMap = new Map<string, number>()
  s.exercises.forEach((ex: { sets: { completed: boolean }[]; muscleGroup: string }) => {
    if (ex.sets.some(sr => sr.completed) && ex.muscleGroup)
      muscleMap.set(ex.muscleGroup, (muscleMap.get(ex.muscleGroup) ?? 0) + 1)
  })
  const muscles = [...muscleMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)

  const H =
    520 +
    (2 * 132 + 16 + 44) +
    (barData.length > 0 ? 36 + barData.length * 68 + 24 : 0) +
    (muscles.length > 0 ? 36 + Math.ceil(muscles.length / 4) * 62 + 40 : 0) +
    140

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  if (!ctx) return null

  const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
    if (typeof (ctx as unknown as { roundRect?: (a: number, b: number, c: number, d: number, e: number) => void }).roundRect === 'function') {
      ;(ctx as unknown as { roundRect: (a: number, b: number, c: number, d: number, e: number) => void }).roundRect(x, y, w, h, r)
    } else {
      ctx.rect(x, y, w, h)
    }
  }

  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, W, H)

  const topGrad = ctx.createLinearGradient(0, 0, W, 0)
  topGrad.addColorStop(0, '#6366f1')
  topGrad.addColorStop(1, '#a78bfa')
  ctx.fillStyle = topGrad
  ctx.fillRect(0, 0, W, 10)

  const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 60, W * 0.75)
  glow.addColorStop(0, 'rgba(99,102,241,0.2)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, 400)

  let y = 60
  ctx.textAlign = 'center'

  ctx.fillStyle = C.muted
  ctx.font = '500 30px -apple-system, Inter, sans-serif'
  y += 44
  ctx.fillText('Training App', W / 2, y)

  ctx.font = '84px serif'
  y += 102
  ctx.fillText('🏆', W / 2, y)

  ctx.fillStyle = C.text
  ctx.font = '800 64px -apple-system, Inter, sans-serif'
  y += 80
  ctx.fillText('Treino Concluído!', W / 2, y)

  ctx.font = '600 36px -apple-system, Inter, sans-serif'
  const pillW = ctx.measureText(s.planName).width + 56
  y += 24
  const pillY = y
  ctx.fillStyle = C.accentLight
  ctx.beginPath()
  roundRect(W / 2 - pillW / 2, pillY, pillW, 54, 27)
  ctx.fill()
  ctx.fillStyle = C.accent
  ctx.fillText(s.planName, W / 2, pillY + 36)
  y = pillY + 54 + 16

  ctx.fillStyle = C.muted
  ctx.font = '400 30px -apple-system, Inter, sans-serif'
  y += 32
  ctx.fillText(data, W / 2, y)
  y += 36

  ctx.strokeStyle = C.border
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(PAD, y)
  ctx.lineTo(W - PAD, y)
  ctx.stroke()
  y += 40

  const statsData = [
    { icon: '⏱', label: 'DURAÇÃO', value: duracao },
    { icon: '📦', label: 'VOLUME TOTAL', value: volumeKg > 0 ? `${volumeKg}kg` : '–' },
    { icon: '✅', label: 'SÉRIES', value: String(totalSeries) },
    { icon: '🔁', label: 'REPETIÇÕES', value: String(totalReps) },
    { icon: '💪', label: 'EXERCÍCIOS', value: String(exercFeitos) },
    { icon: '⚖️', label: 'MÉDIA/SÉRIE', value: mediaSerie },
  ]
  const COLS = 3,
    ROWS = 2,
    GAP = 16
  const cellW = (W - PAD * 2 - GAP * (COLS - 1)) / COLS
  const cellH = 132

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const st = statsData[r * COLS + c]
      const cx = PAD + c * (cellW + GAP)
      const cy = y + r * (cellH + GAP)
      ctx.fillStyle = C.surface
      ctx.beginPath()
      roundRect(cx, cy, cellW, cellH, 20)
      ctx.fill()
      ctx.strokeStyle = C.border
      ctx.lineWidth = 1.5
      ctx.beginPath()
      roundRect(cx, cy, cellW, cellH, 20)
      ctx.stroke()
      ctx.font = '28px serif'
      ctx.textAlign = 'center'
      ctx.fillText(st.icon, cx + cellW / 2, cy + 36)
      ctx.fillStyle = C.text
      ctx.font = '700 40px -apple-system, Inter, sans-serif'
      ctx.fillText(st.value, cx + cellW / 2, cy + 78)
      ctx.fillStyle = C.subtle
      ctx.font = '500 20px -apple-system, Inter, sans-serif'
      ctx.fillText(st.label, cx + cellW / 2, cy + 110)
    }
  }
  y += ROWS * cellH + (ROWS - 1) * GAP + 44

  if (barData.length > 0) {
    const maxVol = Math.max(...barData.map(e => e.vol), 1)
    const LABEL_W = 196
    const barAreaW = W - PAD * 2 - LABEL_W - 16
    const BAR_H = 36

    ctx.fillStyle = C.muted
    ctx.font = '600 24px -apple-system, Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('VOLUME POR EXERCÍCIO', PAD, y)
    y += 36

    barData.forEach((ex, i) => {
      const color = PALETTE[i % PALETTE.length]
      const barFill = (ex.vol / maxVol) * barAreaW
      const barX = PAD + LABEL_W + 16
      const barY = y
      const shortName = ex.nome.length > 15 ? ex.nome.slice(0, 13) + '…' : ex.nome
      ctx.fillStyle = C.muted
      ctx.font = '400 23px -apple-system, Inter, sans-serif'
      ctx.fillText(shortName, PAD, barY + 25)
      ctx.fillStyle = C.surface2
      ctx.beginPath()
      roundRect(barX, barY, barAreaW, BAR_H, 8)
      ctx.fill()
      if (barFill > 8) {
        const bg = ctx.createLinearGradient(barX, 0, barX + barAreaW, 0)
        bg.addColorStop(0, color)
        bg.addColorStop(1, color + '55')
        ctx.fillStyle = bg
        ctx.beginPath()
        roundRect(barX, barY, barFill, BAR_H, 8)
        ctx.fill()
      }
      if (ex.vol > 0) {
        ctx.fillStyle = C.subtle
        ctx.font = '500 21px -apple-system, Inter, sans-serif'
        ctx.fillText(`${Math.round(ex.vol)}kg`, barX + barFill + 10, barY + 25)
      }
      y += BAR_H + 32
    })
    y += 12
  }

  if (muscles.length > 0) {
    ctx.fillStyle = C.muted
    ctx.font = '600 24px -apple-system, Inter, sans-serif'
    ctx.fillText('GRUPOS MUSCULARES', PAD, y)
    y += 36

    let chipX = PAD
    const CHIP_H = 48

    muscles.forEach(([muscle], i) => {
      const color = PALETTE[i % PALETTE.length]
      const label = muscle.charAt(0).toUpperCase() + muscle.slice(1)
      ctx.font = '500 23px -apple-system, Inter, sans-serif'
      const chipW = ctx.measureText(label).width + 40
      if (chipX + chipW > W - PAD) {
        chipX = PAD
        y += CHIP_H + 12
      }
      ctx.fillStyle = color + '22'
      ctx.beginPath()
      roundRect(chipX, y, chipW, CHIP_H, CHIP_H / 2)
      ctx.fill()
      ctx.strokeStyle = color + '60'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      roundRect(chipX, y, chipW, CHIP_H, CHIP_H / 2)
      ctx.stroke()
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      ctx.fillText(label, chipX + chipW / 2, y + 31)
      chipX += chipW + 12
    })
    y += CHIP_H + 36
  }

  y += 12
  ctx.strokeStyle = C.border
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(PAD, y)
  ctx.lineTo(W - PAD, y)
  ctx.stroke()
  y += 36
  ctx.fillStyle = C.subtle
  ctx.font = '400 26px -apple-system, Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('💪 Gerado pelo Training App', W / 2, y + 32)

  return new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
}
