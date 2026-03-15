import { useMemo } from 'react'
import { calcularStreaks } from '../lib/streaks'
import { GROUP_COLORS } from '../types'
import type { WorkoutSession } from '../types'
import type { WorkoutPlan } from '../types'

interface UseHomeStatsParams {
  sessions: WorkoutSession[]
  activePlans: WorkoutPlan[]
  metaSemanal: number
  diasOpcionais: number[]
  loading: boolean
  loadingSessions: boolean
}

export function useHomeStats({
  sessions,
  activePlans,
  metaSemanal,
  diasOpcionais,
  loading,
  loadingSessions,
}: UseHomeStatsParams) {
  const today = useMemo(() => new Date(), [])
  const weekStart = useMemo(() => {
    const d = new Date(today)
    d.setDate(today.getDate() - today.getDay())
    d.setHours(0, 0, 0, 0)
    return d
  }, [today])

  const workoutsThisWeek = useMemo(
    () => sessions.filter((s) => s.startedAt >= weekStart.getTime()).length,
    [sessions, weekStart]
  )
  const totalVolume = useMemo(
    () => sessions.reduce((acc, s) => acc + (s.totalVolume ?? 0), 0),
    [sessions]
  )
  const lastSessions = useMemo(() => sessions.slice(0, 3), [sessions])
  const isLoading = loading || loadingSessions

  const streaks = useMemo(
    () => calcularStreaks(sessions, metaSemanal, diasOpcionais),
    [sessions, metaSemanal, diasOpcionais]
  )

  const lastSession = sessions[0]
  const nextPlan = useMemo(() => {
    if (!activePlans.length) return null
    if (!lastSession) return activePlans[0]
    const idx = activePlans.findIndex((p) => p.id === lastSession.planId)
    if (idx === -1) return activePlans[0]
    return activePlans[(idx + 1) % activePlans.length]
  }, [activePlans, lastSession])

  const groupAlerts = useMemo(() => {
    const now = Date.now()
    const groupMap: Record<string, number> = {}
    sessions.forEach((s) => {
      if (!s.finishedAt) return
      s.exercises.forEach((ex) => {
        const g = ex.muscleGroup
        if (
          !g ||
          g === 'Outro' ||
          g === 'Corpo Inteiro' ||
          g === 'Cardio'
        )
          return
        const last = groupMap[g]
        if (!last || s.finishedAt! > last) groupMap[g] = s.finishedAt!
      })
    })
    return Object.entries(groupMap)
      .map(([group, last]) => ({
        grupo: group,
        dias: Math.floor((now - last) / 86400000),
        cor: GROUP_COLORS[group] ?? '#6366f1',
      }))
      .filter((a) => a.dias >= 7)
      .sort((a, b) => b.dias - a.dias)
      .slice(0, 4)
  }, [sessions])

  return {
    workoutsThisWeek,
    totalVolume,
    lastSessions,
    lastSession,
    isLoading,
    streaks,
    nextPlan,
    groupAlerts,
    today,
    weekStart,
  }
}
