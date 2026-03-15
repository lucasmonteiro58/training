import type { WorkoutSession, RecordedSet } from '../types'

export interface ExerciseRecord {
  exerciseId: string
  exerciseName: string
  maxWeight: number
  maxSetVolume: number
  maxWeightDate: number
  maxSetVolumeDate: number
  max1RM: number
  max1RMDate: number
}

export function calculateRecords(sessions: WorkoutSession[]): Map<string, ExerciseRecord> {
  const map = new Map<string, ExerciseRecord>()

  for (const session of sessions) {
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        if (!set.completed || set.weight <= 0) continue

        const setVolume = set.weight * (set.reps ?? 0)
        const est1RM = set.reps > 0
          ? set.weight * (1 + (set.reps ?? 0) / 30)
          : set.weight

        let record = map.get(ex.exerciseId)
        if (!record) {
          record = {
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            maxWeight: 0,
            maxSetVolume: 0,
            maxWeightDate: 0,
            maxSetVolumeDate: 0,
            max1RM: 0,
            max1RMDate: 0,
          }
          map.set(ex.exerciseId, record)
        }

        if (set.weight > record.maxWeight) {
          record.maxWeight = set.weight
          record.maxWeightDate = session.startedAt
        }
        if (setVolume > record.maxSetVolume) {
          record.maxSetVolume = setVolume
          record.maxSetVolumeDate = session.startedAt
        }
        if (est1RM > record.max1RM) {
          record.max1RM = est1RM
          record.max1RMDate = session.startedAt
        }
      }
    }
  }

  return map
}

export function detectNewPR(
  set: RecordedSet,
  exerciseId: string,
  records: Map<string, ExerciseRecord>,
): { type: 'peso' | 'volume' | '1rm'; value: number } | null {
  if (!set.completed || set.weight <= 0) return null

  const record = records.get(exerciseId)
  const setVolume = set.weight * (set.reps ?? 0)
  const est1RM = set.reps > 0
    ? set.weight * (1 + (set.reps ?? 0) / 30)
    : set.weight

  if (record && record.maxWeight > 0 && set.weight > record.maxWeight) return { type: 'peso', value: set.weight }
  if (!record) return null

  if (setVolume > record.maxSetVolume) return { type: 'volume', value: setVolume }
  if (est1RM > record.max1RM) return { type: '1rm', value: Math.round(est1RM) }

  return null
}
