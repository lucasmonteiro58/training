import Dexie, { type Table } from 'dexie'
import type { WorkoutPlan, WorkoutSession, Exercise, BodyMeasurement } from '../../types'

class TrainingDB extends Dexie {
  plans!: Table<WorkoutPlan>
  sessions!: Table<WorkoutSession>
  customExercises!: Table<Exercise>
  exerciseCache!: Table<Exercise>
  measurements!: Table<BodyMeasurement>

  constructor() {
    super('training-db')
    this.version(1).stores({
      plans: 'id, userId, updatedAt, syncedAt',
      sessions: 'id, userId, planId, startedAt, finishedAt, syncedAt',
      customExercises: 'id, userId, muscleGroup',
      exerciseCache: 'id, muscleGroup, name',
      measurements: 'id, userId, data',
      syncQueue: '++id, createdAt',
    })
  }
}

export const localDB = new TrainingDB()

// ============
// Plans
// ============
export async function getPlans(userId: string): Promise<WorkoutPlan[]> {
  return localDB.plans
    .where('userId')
    .equals(userId)
    .reverse()
    .sortBy('updatedAt')
}

export async function getPlan(id: string): Promise<WorkoutPlan | undefined> {
  return localDB.plans.get(id)
}

export async function savePlan(plan: WorkoutPlan): Promise<void> {
  await localDB.plans.put(plan)
}

export async function deletePlan(id: string): Promise<void> {
  await localDB.plans.delete(id)
}

// ============
// Sessions
// ============
export async function getSessions(userId: string, limit = 50): Promise<WorkoutSession[]> {
  const all = await localDB.sessions
    .where('userId')
    .equals(userId)
    .reverse()
    .sortBy('startedAt')
  return all.slice(0, limit)
}

export async function getSession(id: string): Promise<WorkoutSession | undefined> {
  return localDB.sessions.get(id)
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  await localDB.sessions.put(session)
}

export async function deleteSession(id: string): Promise<void> {
  await localDB.sessions.delete(id)
}

// ============
// Custom exercises (personalized)
// ============
export async function getPersonalizedExercises(userId: string): Promise<Exercise[]> {
  return localDB.customExercises
    .where('userId')
    .equals(userId)
    .toArray()
}

export async function savePersonalizedExercise(ex: Exercise): Promise<void> {
  await localDB.customExercises.put(ex)
}

// ============
// Exercise cache (free-exercise-db)
// ============
export async function getCachedExercises(): Promise<Exercise[]> {
  return localDB.exerciseCache.toArray()
}

export async function setCachedExercises(exercises: Exercise[]): Promise<void> {
  await localDB.exerciseCache.bulkPut(exercises)
}

// ============
// Favorites
// ============
export async function toggleExerciseFavorite(exerciseId: string, favorited: boolean): Promise<void> {
  const cached = await localDB.exerciseCache.get(exerciseId)
  if (cached) {
    await localDB.exerciseCache.put({ ...cached, favorited })
    return
  }
  const custom = await localDB.customExercises.get(exerciseId)
  if (custom) {
    await localDB.customExercises.put({ ...custom, favorited })
  }
}

export async function getFavoriteIds(): Promise<Set<string>> {
  const cached = await localDB.exerciseCache.filter((ex) => ex.favorited === true).toArray()
  const custom = await localDB.customExercises.filter((ex) => ex.favorited === true).toArray()
  return new Set([...cached, ...custom].map((ex) => ex.id))
}

// ============
// Body measurements
// ============
export async function getMeasurements(userId: string): Promise<BodyMeasurement[]> {
  return localDB.measurements
    .where('userId')
    .equals(userId)
    .reverse()
    .sortBy('data')
}

export async function saveMeasurement(measurement: BodyMeasurement): Promise<void> {
  await localDB.measurements.put(measurement)
}

export async function deleteMeasurement(id: string): Promise<void> {
  await localDB.measurements.delete(id)
}
