import type { SessaoDeTreino, SerieRegistrada } from '../types'

export interface RecordeExercicio {
  exercicioId: string
  exercicioNome: string
  maiorPeso: number          // maior peso levantado em qualquer série
  maiorVolumeSerie: number   // maior (peso × reps) em uma série
  maiorPesoData: number      // timestamp
  maiorVolumeSerieData: number
  maior1RM: number           // 1RM estimado (Epley)
  maior1RMData: number
}

/**
 * Calcula os recordes de todos os exercícios a partir do histórico de sessões.
 */
export function calcularRecordes(sessoes: SessaoDeTreino[]): Map<string, RecordeExercicio> {
  const map = new Map<string, RecordeExercicio>()

  for (const sessao of sessoes) {
    for (const ex of sessao.exercicios) {
      for (const serie of ex.series) {
        if (!serie.completada || serie.peso <= 0) continue

        const volumeSerie = serie.peso * (serie.repeticoes ?? 0)
        const est1RM = serie.repeticoes > 0
          ? serie.peso * (1 + (serie.repeticoes ?? 0) / 30) // Epley
          : serie.peso

        let rec = map.get(ex.exercicioId)
        if (!rec) {
          rec = {
            exercicioId: ex.exercicioId,
            exercicioNome: ex.exercicioNome,
            maiorPeso: 0,
            maiorVolumeSerie: 0,
            maiorPesoData: 0,
            maiorVolumeSerieData: 0,
            maior1RM: 0,
            maior1RMData: 0,
          }
          map.set(ex.exercicioId, rec)
        }

        if (serie.peso > rec.maiorPeso) {
          rec.maiorPeso = serie.peso
          rec.maiorPesoData = sessao.iniciadoEm
        }
        if (volumeSerie > rec.maiorVolumeSerie) {
          rec.maiorVolumeSerie = volumeSerie
          rec.maiorVolumeSerieData = sessao.iniciadoEm
        }
        if (est1RM > rec.maior1RM) {
          rec.maior1RM = est1RM
          rec.maior1RMData = sessao.iniciadoEm
        }
      }
    }
  }

  return map
}

/**
 * Detecta se uma série recém-completada é um novo PR (personal record).
 * Retorna o tipo de PR ou null.
 * PR de peso só é retornado se já existir recorde anterior (maiorPeso > 0) — não mostra para "primeira vez".
 */
export function detectarNovoPR(
  serie: SerieRegistrada,
  exercicioId: string,
  recordes: Map<string, RecordeExercicio>,
): { tipo: 'peso' | 'volume' | '1rm'; valor: number } | null {
  if (!serie.completada || serie.peso <= 0) return null

  const rec = recordes.get(exercicioId)
  const volumeSerie = serie.peso * (serie.repeticoes ?? 0)
  const est1RM = serie.repeticoes > 0
    ? serie.peso * (1 + (serie.repeticoes ?? 0) / 30)
    : serie.peso

  // Só considera PR de peso se o recorde anterior for > 0 (não mostra quando era 0 / primeira vez)
  if (rec && rec.maiorPeso > 0 && serie.peso > rec.maiorPeso) return { tipo: 'peso', valor: serie.peso }
  if (!rec) return null // primeiro contato com o exercício → não mostra tela de PR

  if (volumeSerie > rec.maiorVolumeSerie) return { tipo: 'volume', valor: volumeSerie }
  if (est1RM > rec.maior1RM) return { tipo: '1rm', valor: Math.round(est1RM) }

  return null
}
