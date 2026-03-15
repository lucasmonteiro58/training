export function epley(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

export function brzycki(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  if (reps >= 37) return 0
  return weight * (36 / (37 - reps))
}

export function calculate1RM(weight: number, reps: number): number {
  const e = epley(weight, reps)
  const b = brzycki(weight, reps)
  if (e === 0 && b === 0) return 0
  if (b === 0) return e
  return (e + b) / 2
}

export const PERCENTAGES_1RM = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50] as const

export function getWeightsTable(oneRM: number): { percentage: number; weight: number; estimatedReps: string }[] {
  return PERCENTAGES_1RM.map(p => {
    const weight = Math.round((oneRM * p) / 100 * 10) / 10
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
    return { percentage: p, weight, estimatedReps: repsMap[p] ?? '-' }
  })
}
