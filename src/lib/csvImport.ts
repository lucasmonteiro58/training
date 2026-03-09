import Papa from 'papaparse'
import type { LinhaCsvTreino, ExercicioNoPlano, Exercicio } from '../types'
import { GRUPOS_EN_PT } from '../types'
import { v4 as uuidv4 } from 'uuid'

export interface ResultadoCsv {
  exercicios: ExercicioNoPlano[]
  erros: string[]
}

// Template CSV para download pelo usuário
export const CSV_TEMPLATE = `nome_exercicio,grupo_muscular,series,repeticoes,peso_kg,descanso_segundos,instrucoes,notas
Supino Reto,Peito,4,10;10;8;8,80;80;70;70,90,Deite no banco|Desça a barra devagar,Focar na contração
Rosca Direta,Bíceps,3,12,20,60,Mantenha a postura,Sem roubar
Agachamento Livre,Quadríceps,4,8,100,120,Pés na largura dos ombros|Desça até 90 graus,Manter o core firme`

export function parsearCsv(conteudo: string): ResultadoCsv {
  const resultado: ResultadoCsv = { exercicios: [], erros: [] }

  const { data, errors } = Papa.parse<LinhaCsvTreino>(conteudo, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/ /g, '_'),
  })

  if (errors.length > 0) {
    resultado.erros.push('Erro ao ler CSV: verifique o formato do arquivo')
    return resultado
  }

  data.forEach((linha, idx) => {
    const rowNum = idx + 2 // +2 por cabeçalho + 1-indexed

    if (!linha.nome_exercicio?.trim()) {
      resultado.erros.push(`Linha ${rowNum}: nome_exercicio é obrigatório`)
      return
    }

    const numSeries = parseInt(linha.series, 10)
    if (isNaN(numSeries) || numSeries < 1) {
      resultado.erros.push(`Linha ${rowNum}: séries inválidas (deve ser um número >= 1)`)
      return
    }

    // Suporte a múltiplos valores separados por ponto e vírgula
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
    const grupoPt =
      GRUPOS_EN_PT[grupoEn.toLowerCase()] ?? (grupoEn || 'Outro')

    const exercicio: Exercicio = {
      id: `csv-${uuidv4()}`,
      nome: linha.nome_exercicio.trim(),
      grupoMuscular: grupoPt,
      instrucoes: instrucoesArr,
      personalizado: true, // Marcar como personalizado para permitir salvamento no db
    }

    const exercicioNoPlano: ExercicioNoPlano = {
      id: uuidv4(),
      exercicioId: exercicio.id,
      exercicio,
      series: numSeries,
      repeticoesMeta: repsArr[0],
      pesoMeta: pesosArr[0] ?? 0,
      seriesDetalhadas,
      descansoSegundos: isNaN(descanso) ? 60 : descanso,
      ordem: idx,
      notas: linha.notas?.trim() || undefined,
    }

    resultado.exercicios.push(exercicioNoPlano)
  })

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
