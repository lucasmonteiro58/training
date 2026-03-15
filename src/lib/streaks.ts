import type { WorkoutSession } from '../types'

export interface StreakInfo {
  currentStreak: number
  bestStreak: number
  workoutsThisWeek: number
  weeklyGoal: number
  totalWorkouts: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  date?: number
}

const defaultOptionalDays: number[] = []

function isOptionalDay(date: Date, optionalDays: number[]): boolean {
  return optionalDays.length > 0 && optionalDays.includes(date.getDay())
}

function isGapOnlyOptionalDays(prev: Date, curr: Date, optionalDays: number[]): boolean {
  const p = new Date(prev)
  p.setDate(p.getDate() + 1)
  while (p.getTime() < curr.getTime()) {
    if (!isOptionalDay(p, optionalDays)) return false
    p.setDate(p.getDate() + 1)
  }
  return true
}

export function calculateStreaks(
  sessions: WorkoutSession[],
  weeklyGoal = 4,
  optionalDays: number[] = defaultOptionalDays
): StreakInfo {
  if (sessions.length === 0) {
    return { currentStreak: 0, bestStreak: 0, workoutsThisWeek: 0, weeklyGoal, totalWorkouts: 0 }
  }

  const workoutDays = new Set<string>()
  sessions.forEach(s => {
    workoutDays.add(new Date(s.startedAt).toISOString().slice(0, 10))
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().slice(0, 10)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  let currentStreak = 0
  let checking = workoutDays.has(todayStr) ? new Date(today) : workoutDays.has(yesterdayStr) ? new Date(yesterday) : null

  if (checking) {
    while (true) {
      const str = checking.toISOString().slice(0, 10)
      if (workoutDays.has(str)) {
        currentStreak++
        checking.setDate(checking.getDate() - 1)
      } else {
        if (isOptionalDay(checking, optionalDays)) {
          checking.setDate(checking.getDate() - 1)
        } else {
          break
        }
      }
    }
  }

  let bestStreak = 0
  let tempStreak = 0
  const daysAsc = Array.from(workoutDays).sort()
  for (let i = 0; i < daysAsc.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const prev = new Date(daysAsc[i - 1])
      const curr = new Date(daysAsc[i])
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      if (diff === 1) {
        tempStreak += 1
      } else if (diff > 1 && isGapOnlyOptionalDays(prev, curr, optionalDays)) {
        tempStreak += 1
      } else {
        tempStreak = 1
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak)
  }

  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const workoutsThisWeek = sessions.filter(s => s.startedAt >= weekStart.getTime()).length

  return {
    currentStreak,
    bestStreak,
    workoutsThisWeek,
    weeklyGoal,
    totalWorkouts: sessions.length,
  }
}

export function calculateAchievements(sessions: WorkoutSession[], streaks: StreakInfo): Achievement[] {
  const totalVolume = sessions.reduce((sum, s) => sum + (s.totalVolume ?? 0), 0)

  let maxWorkoutsInWeek = 0
  let amazingWeekTimestamp: number | undefined
  const byWeek = new Map<number, WorkoutSession[]>()
  for (const s of sessions) {
    const d = new Date(s.startedAt)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - d.getDay())
    const key = d.getTime()
    const list = byWeek.get(key) ?? []
    list.push(s)
    byWeek.set(key, list)
    if (list.length > maxWorkoutsInWeek) {
      maxWorkoutsInWeek = list.length
      amazingWeekTimestamp = list.length >= 5 ? list[4].startedAt : undefined
    }
  }

  const achievements: Achievement[] = [
    {
      id: 'primeiro-treino',
      name: 'Primeiro Passo',
      description: 'Complete seu primeiro treino',
      icon: '🎯',
      unlocked: sessions.length >= 1,
      date: sessions.length >= 1 ? sessions[sessions.length - 1]?.startedAt : undefined,
    },
    {
      id: '10-treinos',
      name: 'Consistente',
      description: 'Complete 10 treinos',
      icon: '💪',
      unlocked: sessions.length >= 10,
    },
    {
      id: '50-treinos',
      name: 'Veterano',
      description: 'Complete 50 treinos',
      icon: '🏋️',
      unlocked: sessions.length >= 50,
    },
    {
      id: '100-treinos',
      name: 'Centurião',
      description: 'Complete 100 treinos',
      icon: '🏆',
      unlocked: sessions.length >= 100,
    },
    {
      id: 'streak-3',
      name: 'Fogo Brando',
      description: 'Mantenha um streak de 3 dias',
      icon: '🔥',
      unlocked: streaks.bestStreak >= 3,
    },
    {
      id: 'streak-7',
      name: 'Semana Perfeita',
      description: 'Streak de 7 dias consecutivos',
      icon: '⭐',
      unlocked: streaks.bestStreak >= 7,
    },
    {
      id: 'streak-30',
      name: 'Máquina',
      description: 'Streak de 30 dias consecutivos',
      icon: '🤖',
      unlocked: streaks.bestStreak >= 30,
    },
    {
      id: 'volume-1000',
      name: 'Tonelada',
      description: 'Acumule 1.000 kg de volume total',
      icon: '📦',
      unlocked: totalVolume >= 1000,
    },
    {
      id: 'volume-10000',
      name: 'Força Bruta',
      description: 'Acumule 10.000 kg de volume total',
      icon: '🦾',
      unlocked: totalVolume >= 10000,
    },
    {
      id: 'volume-100000',
      name: 'Titã',
      description: 'Acumule 100.000 kg de volume total',
      icon: '⚡',
      unlocked: totalVolume >= 100000,
    },
    {
      id: 'meta-semanal',
      name: 'Meta Batida',
      description: 'Bata a meta semanal de treinos',
      icon: '🎖️',
      unlocked: streaks.workoutsThisWeek >= streaks.weeklyGoal,
    },
    {
      id: 'semana-5',
      name: 'Semana Incrível',
      description: 'Faça 5 treinos em uma única semana',
      icon: '🌟',
      unlocked: maxWorkoutsInWeek >= 5,
      date: amazingWeekTimestamp,
    },
  ]

  return achievements
}
