import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useHistoryStore } from '../../stores'
import { useState, useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { ProgressHeader } from './components/-ProgressHeader'
import { ProgressTabs, type ProgressTabId } from './components/-ProgressTabs'
import { ProgressExerciseCard } from './components/-ProgressExerciseCard'
import { VolumeChart } from './components/-VolumeChart'

export const Route = createFileRoute('/profile/progress')({
  component: EvolucaoPage,
})

function EvolucaoPage() {
  const sessions = useHistoryStore(s => s.sessions)
  const navigate = useNavigate()
  const [tab, setTab] = useState<ProgressTabId>('exercicios')

  const exercicios = useMemo(() => {
    const map = new Map<string, string>()
    sessions.forEach(s => {
      s.exercicios.forEach(ex => {
        if (ex.series.some(sr => sr.completada && sr.peso > 0))
          map.set(ex.exercicioId, ex.exercicioNome)
      })
    })
    return Array.from(map.entries())
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [sessions])

  const timelineByExercicio = useMemo(() => {
    const result = new Map<string, { data: string; peso: number; iniciadoEm: number }[]>()
    exercicios.forEach(({ id }) => {
      const pontos = sessions
        .filter(s => s.exercicios.some(ex => ex.exercicioId === id))
        .sort((a, b) => a.iniciadoEm - b.iniciadoEm)
        .flatMap(s => {
          const ex = s.exercicios.find(e => e.exercicioId === id)!
          const pesos = ex.series
            .filter(sr => sr.completada && sr.peso > 0)
            .map(sr => sr.peso)
          if (!pesos.length) return []
          return [
            {
              data: new Date(s.iniciadoEm).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
              }),
              peso: Math.max(...pesos),
              iniciadoEm: s.iniciadoEm,
            },
          ]
        })
      if (pontos.length) result.set(id, pontos)
    })
    return result
  }, [sessions, exercicios])

  const dadosVolume = useMemo(
    () =>
      sessions
        .slice()
        .sort((a, b) => a.iniciadoEm - b.iniciadoEm)
        .slice(-20)
        .map(s => ({
          data: new Date(s.iniciadoEm).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
          }),
          volume: Math.round(s.volumeTotal ?? 0),
          plano: s.planoNome,
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
          {exercicios.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-10">
              Nenhum exercício com peso registrado encontrado.
            </p>
          ) : (
            exercicios.map(ex => (
              <ProgressExerciseCard
                key={ex.id}
                nome={ex.nome}
                pontos={timelineByExercicio.get(ex.id) ?? []}
              />
            ))
          )}
        </div>
      )}

      {tab === 'grafico' && <VolumeChart dados={dadosVolume} />}
    </div>
  )
}
