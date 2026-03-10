// Fórmulas de estimativa de 1RM (uma repetição máxima)

/** Fórmula de Epley: peso × (1 + reps / 30)  */
export function epley(peso: number, reps: number): number {
  if (reps <= 0 || peso <= 0) return 0
  if (reps === 1) return peso
  return peso * (1 + reps / 30)
}

/** Fórmula de Brzycki: peso × (36 / (37 - reps))  */
export function brzycki(peso: number, reps: number): number {
  if (reps <= 0 || peso <= 0) return 0
  if (reps === 1) return peso
  if (reps >= 37) return 0
  return peso * (36 / (37 - reps))
}

/** Média das fórmulas de Epley e Brzycki */
export function calcular1RM(peso: number, reps: number): number {
  const e = epley(peso, reps)
  const b = brzycki(peso, reps)
  if (e === 0 && b === 0) return 0
  if (b === 0) return e
  return (e + b) / 2
}

/** Percentuais comuns para tabelar cargas a partir da 1RM */
export const PERCENTUAIS_1RM = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50] as const

/** Gera tabela de cargas com base na 1RM estimada */
export function tabelaCargas(rm1: number): { percentual: number; peso: number; repsEstimadas: string }[] {
  return PERCENTUAIS_1RM.map(p => {
    const peso = Math.round((rm1 * p) / 100 * 10) / 10
    const repsMap: Record<number, string> = {
      100: '1',
      95: '2-3',
      90: '3-4',
      85: '5-6',
      80: '7-8',
      75: '9-10',
      70: '10-12',
      65: '12-15',
      60: '15-18',
      55: '18-20',
      50: '20+',
    }
    return { percentual: p, peso, repsEstimadas: repsMap[p] ?? '-' }
  })
}
