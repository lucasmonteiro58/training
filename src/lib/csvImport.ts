import Papa from 'papaparse'
import type { LinhaCsvTreino, ExercicioNoPlano, Exercicio } from '../types'
import { GRUPOS_EN_PT } from '../types'
import { v4 as uuidv4 } from 'uuid'

export interface PlanoImportado {
  id: string
  nome: string
  exercicios: ExercicioNoPlano[]
}

export interface ResultadoCsv {
  planos: PlanoImportado[]
  erros: string[]
}

export const CSV_TEMPLATE = `id,plano,nome_exercicio,grupo_muscular,series,repeticoes,peso_kg,descanso_segundos,instrucoes,notas
,Treino A,Supino Reto,Peito,4,10;10;8;8,80;80;70;70,90,Deite no banco|Desça a barra devagar,Focar na contração
Barbell_Curl,Treino A,Rosca Direta,Bíceps,3,12,20,60,,Sem roubar
,Treino B,Agachamento Livre,Quadríceps,4,8,100,120,Pés na largura dos ombros|Desça até 90 graus,Manter o core firme`

export function parsearCsv(conteudo: string, exerciciosDb: Exercicio[] = []): ResultadoCsv {
  const resultado: ResultadoCsv = { planos: [], erros: [] }

  // Criar mapas para busca rápida por id e por nome (normalizado)
  const dbPorId = new Map<string, Exercicio>()
  const dbPorNome = new Map<string, Exercicio>()
  for (const ex of exerciciosDb) {
    dbPorId.set(ex.id.toLowerCase(), ex)
    dbPorNome.set(ex.nome.toLowerCase().trim(), ex)
  }

  const { data, errors } = Papa.parse<LinhaCsvTreino>(conteudo, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/ /g, '_'),
  })

  if (errors.length > 0) {
    resultado.erros.push('Erro ao ler CSV: verifique o formato do arquivo')
    return resultado
  }

  const planosMap = new Map<string, ExercicioNoPlano[]>()
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

    const seriesDetalhadas = Array.from({ length: numSeries }).map((_, i) => ({
      repeticoes: repsArr[i] ?? repsArr[repsArr.length - 1],
      peso: pesosArr[i] ?? pesosArr[pesosArr.length - 1] ?? 0,
    }))

    const grupoEn = linha.grupo_muscular?.trim() ?? ''
    const grupoPt = GRUPOS_EN_PT[grupoEn.toLowerCase()] ?? (grupoEn || 'Outro')

    // Tentar encontrar exercício existente no banco de dados por ID ou nome exato
    const csvId = linha.id?.trim()
    let exercicioDb: Exercicio | undefined

    if (csvId) {
      exercicioDb = dbPorId.get(csvId.toLowerCase())
    }
    if (!exercicioDb) {
      exercicioDb = dbPorNome.get(linha.nome_exercicio.trim().toLowerCase())
    }

    const exercicio: Exercicio = exercicioDb
      ? { ...exercicioDb } // usar exercício do banco com todas as informações (imagens, instruções, etc.)
      : {
          id: `csv-${uuidv4()}`,
          nome: linha.nome_exercicio.trim(),
          grupoMuscular: grupoPt,
          instrucoes: instrucoesArr,
          personalizado: true,
        }

    const planoNome = (linha as any).plano?.trim() || 'Meu Treino'
    if (!planosMap.has(planoNome)) {
      planosMap.set(planoNome, [])
      planoNamesOrder.push(planoNome)
    }

    const exerciciosDoPlano = planosMap.get(planoNome)!
    exerciciosDoPlano.push({
      id: uuidv4(),
      exercicioId: exercicio.id,
      exercicio,
      series: numSeries,
      repeticoesMeta: repsArr[0],
      pesoMeta: pesosArr[0] ?? 0,
      seriesDetalhadas,
      descansoSegundos: isNaN(descanso) ? 60 : descanso,
      ordem: exerciciosDoPlano.length,
      notas: linha.notas?.trim() || undefined,
    })
  })

  resultado.planos = planoNamesOrder.map((nome) => ({
    id: uuidv4(),
    nome,
    exercicios: planosMap.get(nome)!,
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
