import { useMemo } from 'react'
import { calcularStreaks } from '../lib/streaks'
import { GROUP_COLORS } from '../types'
import type { WorkoutSession } from '../types'
import type { WorkoutPlan } from '../types'

interface UseHomeStatsParams {
  sessoes: WorkoutSession[]
  planosAtivos: WorkoutPlan[]
  metaSemanal: number
  diasOpcionais: number[]
  loading: boolean
  loadingSessoes: boolean
}

export function useHomeStats({
  sessoes,
  planosAtivos,
  metaSemanal,
  diasOpcionais,
  loading,
  loadingSessoes,
}: UseHomeStatsParams) {
  const hoje = useMemo(() => new Date(), [])
  const inicioSemana = useMemo(() => {
    const d = new Date(hoje)
    d.setDate(hoje.getDate() - hoje.getDay())
    d.setHours(0, 0, 0, 0)
    return d
  }, [hoje])

  const treinosSemana = useMemo(
    () => sessoes.filter((s) => s.iniciadoEm >= inicioSemana.getTime()).length,
    [sessoes, inicioSemana]
  )
  const volumeTotal = useMemo(
    () => sessoes.reduce((acc, s) => acc + (s.volumeTotal ?? 0), 0),
    [sessoes]
  )
  const ultimasSessoes = useMemo(() => sessoes.slice(0, 3), [sessoes])
  const carregando = loading || loadingSessoes

  const streaks = useMemo(
    () => calcularStreaks(sessoes, metaSemanal, diasOpcionais),
    [sessoes, metaSemanal, diasOpcionais]
  )

  const ultimaSessao = sessoes[0]
  const proximoPlano = useMemo(() => {
    if (!planosAtivos.length) return null
    if (!ultimaSessao) return planosAtivos[0]
    const idx = planosAtivos.findIndex((p) => p.id === ultimaSessao.planoId)
    if (idx === -1) return planosAtivos[0]
    return planosAtivos[(idx + 1) % planosAtivos.length]
  }, [planosAtivos, ultimaSessao])

  const alertasGrupos = useMemo(() => {
    const agora = Date.now()
    const grupoMap: Record<string, number> = {}
    sessoes.forEach((s) => {
      if (!s.finalizadoEm) return
      s.exercicios.forEach((ex) => {
        const g = ex.grupoMuscular
        if (
          !g ||
          g === 'Outro' ||
          g === 'Corpo Inteiro' ||
          g === 'Cardio'
        )
          return
        const last = grupoMap[g]
        if (!last || s.finalizadoEm! > last) grupoMap[g] = s.finalizadoEm!
      })
    })
    return Object.entries(grupoMap)
      .map(([grupo, ultimo]) => ({
        grupo,
        dias: Math.floor((agora - ultimo) / 86400000),
        cor: GROUP_COLORS[grupo] ?? '#6366f1',
      }))
      .filter((a) => a.dias >= 7)
      .sort((a, b) => b.dias - a.dias)
      .slice(0, 4)
  }, [sessoes])

  return {
    treinosSemana,
    volumeTotal,
    ultimasSessoes,
    ultimaSessao,
    carregando,
    streaks,
    proximoPlano,
    alertasGrupos,
    hoje,
    inicioSemana,
  }
}
