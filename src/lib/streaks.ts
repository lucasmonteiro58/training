import type { SessaoDeTreino } from '../types'

export interface StreakInfo {
  streakAtual: number      // dias consecutivos com treino
  melhorStreak: number     // recorde de streak
  treinosEstaSemana: number
  metaSemanal: number      // padrão: 4
  totalTreinos: number
}

export interface Conquista {
  id: string
  nome: string
  descricao: string
  icone: string
  desbloqueada: boolean
  data?: number // timestamp do desbloqueio
}

/**
 * Calcula streaks e estatísticas semanais.
 */
export function calcularStreaks(sessoes: SessaoDeTreino[], metaSemanal = 4): StreakInfo {
  if (sessoes.length === 0) {
    return { streakAtual: 0, melhorStreak: 0, treinosEstaSemana: 0, metaSemanal, totalTreinos: 0 }
  }

  // Unique training days (YYYY-MM-DD)
  const diasTreino = new Set<string>()
  sessoes.forEach(s => {
    diasTreino.add(new Date(s.iniciadoEm).toISOString().slice(0, 10))
  })

  const diasOrdenados = Array.from(diasTreino).sort().reverse()

  // Streak atual: contar dias consecutivos a partir de hoje/ontem
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const hojeStr = hoje.toISOString().slice(0, 10)
  const ontem = new Date(hoje)
  ontem.setDate(ontem.getDate() - 1)
  const ontemStr = ontem.toISOString().slice(0, 10)

  let streakAtual = 0
  let checando = diasTreino.has(hojeStr) ? new Date(hoje) : diasTreino.has(ontemStr) ? new Date(ontem) : null

  if (checando) {
    while (true) {
      const str = checando.toISOString().slice(0, 10)
      if (diasTreino.has(str)) {
        streakAtual++
        checando.setDate(checando.getDate() - 1)
      } else {
        break
      }
    }
  }

  // Melhor streak de todos os tempos
  let melhorStreak = 0
  let streakTemp = 0
  const diasAsc = Array.from(diasTreino).sort()
  for (let i = 0; i < diasAsc.length; i++) {
    if (i === 0) {
      streakTemp = 1
    } else {
      const prev = new Date(diasAsc[i - 1])
      const curr = new Date(diasAsc[i])
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      streakTemp = diff === 1 ? streakTemp + 1 : 1
    }
    melhorStreak = Math.max(melhorStreak, streakTemp)
  }

  // Treinos esta semana (dom-sáb)
  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() - hoje.getDay())
  const treinosEstaSemana = sessoes.filter(s => s.iniciadoEm >= inicioSemana.getTime()).length

  return {
    streakAtual,
    melhorStreak,
    treinosEstaSemana,
    metaSemanal,
    totalTreinos: sessoes.length,
  }
}

/**
 * Calcula conquistas desbloqueadas.
 */
export function calcularConquistas(sessoes: SessaoDeTreino[], streaks: StreakInfo): Conquista[] {
  const totalVolume = sessoes.reduce((sum, s) => sum + (s.volumeTotal ?? 0), 0)
  const conquistas: Conquista[] = [
    {
      id: 'primeiro-treino',
      nome: 'Primeiro Passo',
      descricao: 'Complete seu primeiro treino',
      icone: '🎯',
      desbloqueada: sessoes.length >= 1,
      data: sessoes.length >= 1 ? sessoes[sessoes.length - 1]?.iniciadoEm : undefined,
    },
    {
      id: '10-treinos',
      nome: 'Consistente',
      descricao: 'Complete 10 treinos',
      icone: '💪',
      desbloqueada: sessoes.length >= 10,
    },
    {
      id: '50-treinos',
      nome: 'Veterano',
      descricao: 'Complete 50 treinos',
      icone: '🏋️',
      desbloqueada: sessoes.length >= 50,
    },
    {
      id: '100-treinos',
      nome: 'Centurião',
      descricao: 'Complete 100 treinos',
      icone: '🏆',
      desbloqueada: sessoes.length >= 100,
    },
    {
      id: 'streak-3',
      nome: 'Fogo Brando',
      descricao: 'Mantenha um streak de 3 dias',
      icone: '🔥',
      desbloqueada: streaks.melhorStreak >= 3,
    },
    {
      id: 'streak-7',
      nome: 'Semana Perfeita',
      descricao: 'Streak de 7 dias consecutivos',
      icone: '⭐',
      desbloqueada: streaks.melhorStreak >= 7,
    },
    {
      id: 'streak-30',
      nome: 'Máquina',
      descricao: 'Streak de 30 dias consecutivos',
      icone: '🤖',
      desbloqueada: streaks.melhorStreak >= 30,
    },
    {
      id: 'volume-1000',
      nome: 'Tonelada',
      descricao: 'Acumule 1.000 kg de volume total',
      icone: '📦',
      desbloqueada: totalVolume >= 1000,
    },
    {
      id: 'volume-10000',
      nome: 'Força Bruta',
      descricao: 'Acumule 10.000 kg de volume total',
      icone: '🦾',
      desbloqueada: totalVolume >= 10000,
    },
    {
      id: 'volume-100000',
      nome: 'Titã',
      descricao: 'Acumule 100.000 kg de volume total',
      icone: '⚡',
      desbloqueada: totalVolume >= 100000,
    },
    {
      id: 'meta-semanal',
      nome: 'Meta Batida',
      descricao: 'Bata a meta semanal de treinos',
      icone: '🎖️',
      desbloqueada: streaks.treinosEstaSemana >= streaks.metaSemanal,
    },
  ]

  return conquistas
}
