import Papa from 'papaparse'
import type { WorkoutCsvRow, ExerciseInPlan, Exercise } from '../types'
import { GROUPS_EN_TO_PT } from '../types'
import { v4 as uuidv4 } from 'uuid'

export interface PlanoImportado {
  id: string
  name: string
  exercises: ExerciseInPlan[]
}

export interface ResultadoCsv {
  planos: PlanoImportado[]
  erros: string[]
}

export const CSV_TEMPLATE = `id,plano,nome_exercicio,grupo_muscular,series,repeticoes,peso_kg,descanso_segundos,instrucoes,notas
,Treino A,Supino Reto,Peito,4,10;10;8;8,80;80;70;70,90,Deite no banco|Desça a barra devagar,Focar na contração
Barbell_Curl,Treino A,Rosca Direta,Bíceps,3,12,20,60,,Sem roubar
,Treino B,Agachamento Livre,Quadríceps,4,8,100,120,Pés na largura dos ombros|Desça até 90 graus,Manter o core firme`

export function parsearCsv(conteudo: string, exerciciosDb: Exercise[] = []): ResultadoCsv {
  const resultado: ResultadoCsv = { planos: [], erros: [] }

  // Criar mapas para busca rápida por id e por nome (normalizado)
  const dbPorId = new Map<string, Exercise>()
  const dbPorNome = new Map<string, Exercise>()
  for (const ex of exerciciosDb) {
    dbPorId.set(ex.id.toLowerCase(), ex)
    dbPorNome.set(ex.name.toLowerCase().trim(), ex)
  }

  const { data, errors } = Papa.parse<WorkoutCsvRow>(conteudo, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/ /g, '_'),
  })

  if (errors.length > 0) {
    resultado.erros.push('Erro ao ler CSV: verifique o formato do arquivo')
    return resultado
  }

  const planosMap = new Map<string, ExerciseInPlan[]>()
  const planoNamesOrder: string[] = []

  data.forEach((linha, idx) => {
    const rowNum = idx + 2

    if (!linha.nome_exercicio?.trim()) {
      resultado.erros.push(`Linha ${rowNum}: nome_exercicio é obrigatório`)
      return
    }

    const numSeries = parseInt(linha.series, 10)
    if (isNaN(numSeries) || numSeries < 1) {
      resultado.erros.push(`Linha ${rowNum}: séries inválidas (deve ser um número >= 1)`)
      return
    }

    const repsArr = (linha.repeticoes || '').split(';').map(v => parseInt(v.trim(), 10)).filter(v => !isNaN(v))
    const pesosArr = (linha.peso_kg || '').split(';').map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
    const descanso = parseInt(linha.descanso_segundos || '60', 10)
    const instrucoesArr = linha.instrucoes ? linha.instrucoes.split('|').map(s => s.trim()).filter(Boolean) : undefined

    if (repsArr.length === 0) {
      resultado.erros.push(`Linha ${rowNum}: repetições inválidas`)
      return
    }

    const setsDetail = Array.from({ length: numSeries }).map((_, i) => ({
      reps: repsArr[i] ?? repsArr[repsArr.length - 1],
      weight: pesosArr[i] ?? pesosArr[pesosArr.length - 1] ?? 0,
    }))

    const grupoEn = linha.grupo_muscular?.trim() ?? ''
    const grupoPt = GROUPS_EN_TO_PT[grupoEn.toLowerCase()] ?? (grupoEn || 'Outro')

    // Tentar encontrar exercício existente no banco de dados por ID ou nome exato
    const csvId = linha.id?.trim()
    let exercicioDb: Exercise | undefined

    if (csvId) {
      exercicioDb = dbPorId.get(csvId.toLowerCase())
    }
    if (!exercicioDb) {
      exercicioDb = dbPorNome.get(linha.nome_exercicio.trim().toLowerCase())
    }

    const exercise: Exercise = exercicioDb
      ? { ...exercicioDb }
      : {
          id: `csv-${uuidv4()}`,
          name: linha.nome_exercicio.trim(),
          muscleGroup: grupoPt,
          instructions: instrucoesArr,
          custom: true,
        }

    const planoNome = (linha as any).plano?.trim() || 'Meu Treino'
    if (!planosMap.has(planoNome)) {
      planosMap.set(planoNome, [])
      planoNamesOrder.push(planoNome)
    }

    const exercisesDoPlano = planosMap.get(planoNome)!
    exercisesDoPlano.push({
      id: uuidv4(),
      exerciseId: exercise.id,
      exercise,
      series: numSeries,
      targetReps: repsArr[0],
      targetWeight: pesosArr[0] ?? 0,
      setsDetail,
      restSeconds: isNaN(descanso) ? 60 : descanso,
      order: exercisesDoPlano.length,
      notes: linha.notas?.trim() || undefined,
    })
  })

  resultado.planos = planoNamesOrder.map((name) => ({
    id: uuidv4(),
    name,
    exercises: planosMap.get(name)!,
  }))

  return resultado
}

export function downloadTemplateCsv() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'template-treino.csv'
  a.click()
  URL.revokeObjectURL(url)
}
