import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useHistoryStore } from '../../stores'
import { useState, useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { ProgressHeader } from './components/-ProgressHeader'
import { ProgressTabs, type ProgressTabId } from './components/-ProgressTabs'
import { ProgressExerciseCard } from './components/-ProgressExerciseCard'
import { VolumeChart } from './components/-VolumeChart'

export const Route = createFileRoute('/profile/progress')({
  component: ProgressPage,
})

function ProgressPage() {
  const sessions = useHistoryStore(s => s.sessions)
  const navigate = useNavigate()
  const [tab, setTab] = useState<ProgressTabId>('exercicios')

  const exercises = useMemo(() => {
    const map = new Map<string, string>()
    sessions.forEach(s => {
      s.exercises.forEach((ex: { exerciseId: string; exerciseName: string; sets: { completed: boolean; weight: number }[] }) => {
        if (ex.sets.some((sr: { completed: boolean; weight: number }) => sr.completed && sr.weight > 0))
          map.set(ex.exerciseId, ex.exerciseName)
      })
    })
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [sessions])

  const timelineByExercise = useMemo(() => {
    const result = new Map<string, { data: string; peso: number; iniciadoEm: number }[]>()
    exercises.forEach(({ id }) => {
      const points = sessions
        .filter((s: { exercises: { exerciseId: string }[] }) => s.exercises.some((ex: { exerciseId: string }) => ex.exerciseId === id))
        .sort((a: { startedAt: number }, b: { startedAt: number }) => a.startedAt - b.startedAt)
        .flatMap((s: { startedAt: number; exercises: { exerciseId: string; sets: { completed: boolean; weight: number }[] }[] }) => {
          const ex = s.exercises.find((e: { exerciseId: string }) => e.exerciseId === id)!
          const weights = ex.sets
            .filter((sr: { completed: boolean; weight: number }) => sr.completed && sr.weight > 0)
            .map((sr: { weight: number }) => sr.weight)
          if (!weights.length) return []
          return [
            {
              data: new Date(s.startedAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
              }),
              peso: Math.max(...weights),
              iniciadoEm: s.startedAt,
            },
          ]
        })
      if (points.length) result.set(id, points)
    })
    return result
  }, [sessions, exercises])

  const volumeData = useMemo(
    () =>
      sessions
        .slice()
        .sort((a: { startedAt: number }, b: { startedAt: number }) => a.startedAt - b.startedAt)
        .slice(-20)
        .map((s: { startedAt: number; totalVolume?: number; planName: string }) => ({
          data: new Date(s.startedAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
          }),
          volume: Math.round(s.totalVolume ?? 0),
          plan: s.planName,
        })),
    [sessions]
  )

  if (sessions.length === 0) {
    return (
      <div className="page-container pt-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-3xl bg-surface-2 flex items-center justify-center mb-4">
          <TrendingUp size={28} className="text-text-subtle" />
        </div>
        <p className="text-text-muted text-sm text-center">
          Complete alguns treinos para ver
          <br />
          sua evolução aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="page-container pt-4">
      <ProgressHeader onVoltar={() => navigate({ to: '/profile' })} />

      <ProgressTabs tab={tab} onTabChange={setTab} />

      {tab === 'exercicios' && (
        <div className="flex flex-col gap-3 animate-fade-up">
          {exercises.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-10">
              Nenhum exercício com peso registrado encontrado.
            </p>
          ) : (
            exercises.map(ex => (
              <ProgressExerciseCard
                key={ex.id}
                nome={ex.name}
                pontos={timelineByExercise.get(ex.id) ?? []}
              />
            ))
          )}
        </div>
      )}

      {tab === 'grafico' && <VolumeChart dados={volumeData} />}
    </div>
  )
}
