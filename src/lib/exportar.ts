import type { WorkoutSession, WorkoutPlan } from '../types'

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportarSessoesCSV(sessoes: WorkoutSession[]) {
  const linhas = ['Data,Plano,Exercício,Grupo Muscular,Série,Peso (kg),Repetições,Completada,Duração (s),Volume Total (kg)']
  for (const s of sessoes) {
    const data = new Date(s.startedAt).toISOString().slice(0, 10)
    for (const ex of s.exercises) {
      for (const serie of ex.sets) {
        linhas.push([
          data,
          `"${s.planName.replace(/"/g, '""')}"`,
          `"${ex.exerciseName.replace(/"/g, '""')}"`,
          ex.muscleGroup,
          serie.order + 1,
          serie.weight ?? 0,
          serie.reps ?? 0,
          serie.completed ? 'Sim' : 'Não',
          s.durationSeconds ?? '',
          s.totalVolume ? Math.round(s.totalVolume) : '',
        ].join(','))
      }
    }
  }
  const csv = '\uFEFF' + linhas.join('\n') // BOM for Excel
  downloadFile(csv, `training-historico-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8')
}

export function exportarSessoesJSON(sessoes: WorkoutSession[]) {
  const json = JSON.stringify(sessoes, null, 2)
  downloadFile(json, `training-historico-${new Date().toISOString().slice(0, 10)}.json`, 'application/json')
}

export function exportarPlanosJSON(planos: WorkoutPlan[]) {
  const json = JSON.stringify(planos, null, 2)
  downloadFile(json, `training-planos-${new Date().toISOString().slice(0, 10)}.json`, 'application/json')
}
