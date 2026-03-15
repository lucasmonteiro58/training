import Papa from 'papaparse'
import type { WorkoutCsvRow, ExerciseInPlan, Exercise } from '../types'
import { GROUPS_EN_TO_PT } from '../types'
import { v4 as uuidv4 } from 'uuid'

export interface ImportedPlan {
  id: string
  name: string
  exercises: ExerciseInPlan[]
}

export interface CsvResult {
  plans: ImportedPlan[]
  errors: string[]
}

export const CSV_TEMPLATE = `id,plano,nome_exercicio,grupo_muscular,series,repeticoes,peso_kg,descanso_segundos,instrucoes,notas
,Treino A,Supino Reto,Peito,4,10;10;8;8,80;80;70;70,90,Deite no banco|Desça a barra devagar,Focar na contração
Barbell_Curl,Treino A,Rosca Direta,Bíceps,3,12,20,60,,Sem roubar
,Treino B,Agachamento Livre,Quadríceps,4,8,100,120,Pés na largura dos ombros|Desça até 90 graus,Manter o core firme`

export function parseCsv(content: string, exercisesDb: Exercise[] = []): CsvResult {
  const result: CsvResult = { plans: [], errors: [] }

  const dbById = new Map<string, Exercise>()
  const dbByName = new Map<string, Exercise>()
  for (const ex of exercisesDb) {
    dbById.set(ex.id.toLowerCase(), ex)
    dbByName.set(ex.name.toLowerCase().trim(), ex)
  }

  const { data, errors } = Papa.parse<WorkoutCsvRow>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/ /g, '_'),
  })

  if (errors.length > 0) {
    result.errors.push('Erro ao ler CSV: verifique o formato do arquivo')
    return result
  }

  const plansMap = new Map<string, ExerciseInPlan[]>()
  const planNamesOrder: string[] = []

  data.forEach((row, idx) => {
    const rowNum = idx + 2

    if (!row.nome_exercicio?.trim()) {
      result.errors.push(`Linha ${rowNum}: nome_exercicio é obrigatório`)
      return
    }

    const numSets = parseInt(row.series, 10)
    if (isNaN(numSets) || numSets < 1) {
      result.errors.push(`Linha ${rowNum}: séries inválidas (deve ser um número >= 1)`)
      return
    }

    const repsArr = (row.repeticoes || '').split(';').map(v => parseInt(v.trim(), 10)).filter(v => !isNaN(v))
    const weightsArr = (row.peso_kg || '').split(';').map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
    const restSeconds = parseInt(row.descanso_segundos || '60', 10)
    const instructionsArr = row.instrucoes ? row.instrucoes.split('|').map(s => s.trim()).filter(Boolean) : undefined

    if (repsArr.length === 0) {
      result.errors.push(`Linha ${rowNum}: repetições inválidas`)
      return
    }

    const setsDetail = Array.from({ length: numSets }).map((_, i) => ({
      reps: repsArr[i] ?? repsArr[repsArr.length - 1],
      weight: weightsArr[i] ?? weightsArr[weightsArr.length - 1] ?? 0,
    }))

    const groupEn = row.grupo_muscular?.trim() ?? ''
    const groupPt = GROUPS_EN_TO_PT[groupEn.toLowerCase()] ?? (groupEn || 'Outro')

    const csvId = row.id?.trim()
    let exerciseDb: Exercise | undefined

    if (csvId) {
      exerciseDb = dbById.get(csvId.toLowerCase())
    }
    if (!exerciseDb) {
      exerciseDb = dbByName.get(row.nome_exercicio.trim().toLowerCase())
    }

    const exercise: Exercise = exerciseDb
      ? { ...exerciseDb }
      : {
          id: `csv-${uuidv4()}`,
          name: row.nome_exercicio.trim(),
          muscleGroup: groupPt,
          instructions: instructionsArr,
          custom: true,
        }

    const planName = (row as any).plano?.trim() || 'Meu Treino'
    if (!plansMap.has(planName)) {
      plansMap.set(planName, [])
      planNamesOrder.push(planName)
    }

    const planExercises = plansMap.get(planName)!
    planExercises.push({
      id: uuidv4(),
      exerciseId: exercise.id,
      exercise,
      series: numSets,
      targetReps: repsArr[0],
      targetWeight: weightsArr[0] ?? 0,
      setsDetail,
      restSeconds: isNaN(restSeconds) ? 60 : restSeconds,
      order: planExercises.length,
      notes: row.notas?.trim() || undefined,
    })
  })

  result.plans = planNamesOrder.map((name) => ({
    id: uuidv4(),
    name,
    exercises: plansMap.get(name)!,
  }))

  return result
}

export function downloadCsvTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'template-treino.csv'
  a.click()
  URL.revokeObjectURL(url)
}
