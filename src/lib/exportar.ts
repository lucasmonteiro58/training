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

export function exportSessionsCSV(sessions: WorkoutSession[]) {
  const rows = ['Data,Plano,Exercício,Grupo Muscular,Série,Peso (kg),Repetições,Completada,Duração (s),Volume Total (kg)']
  for (const s of sessions) {
    const date = new Date(s.startedAt).toISOString().slice(0, 10)
    for (const ex of s.exercises) {
      for (const set of ex.sets) {
        rows.push([
          date,
          `"${s.planName.replace(/"/g, '""')}"`,
          `"${ex.exerciseName.replace(/"/g, '""')}"`,
          ex.muscleGroup,
          set.order + 1,
          set.weight ?? 0,
          set.reps ?? 0,
          set.completed ? 'Sim' : 'Não',
          s.durationSeconds ?? '',
          s.totalVolume ? Math.round(s.totalVolume) : '',
        ].join(','))
      }
    }
  }
  const csv = '\uFEFF' + rows.join('\n') // BOM for Excel
  downloadFile(csv, `training-historico-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8')
}

export function exportSessionsJSON(sessions: WorkoutSession[]) {
  const json = JSON.stringify(sessions, null, 2)
  downloadFile(json, `training-historico-${new Date().toISOString().slice(0, 10)}.json`, 'application/json')
}

export function exportPlansJSON(plans: WorkoutPlan[]) {
  const json = JSON.stringify(plans, null, 2)
  downloadFile(json, `training-planos-${new Date().toISOString().slice(0, 10)}.json`, 'application/json')
}
