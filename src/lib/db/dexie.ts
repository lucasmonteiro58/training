import Dexie, { type Table } from 'dexie'
import type { WorkoutPlan, WorkoutSession, Exercise, BodyMeasurement } from '../../types'

class TrainingDB extends Dexie {
  planos!: Table<WorkoutPlan>
  sessoes!: Table<WorkoutSession>
  exerciciosPersonalizados!: Table<Exercise>
  exerciciosCache!: Table<Exercise>
  medidas!: Table<BodyMeasurement>

  constructor() {
    super('training-db')
    this.version(1).stores({
      planos: 'id, userId, updatedAt, syncedAt',
      sessoes: 'id, userId, planoId, iniciadoEm, finalizadoEm, syncedAt',
      exerciciosPersonalizados: 'id, userId, grupoMuscular',
      exerciciosCache: 'id, grupoMuscular, nome',
    })
    this.version(2).stores({
      planos: 'id, userId, updatedAt, syncedAt',
      sessoes: 'id, userId, planoId, iniciadoEm, finalizadoEm, syncedAt',
      exerciciosPersonalizados: 'id, userId, grupoMuscular',
      exerciciosCache: 'id, grupoMuscular, nome',
      medidas: 'id, userId, data',
    })
    this.version(3).stores({
      planos: 'id, userId, updatedAt, syncedAt',
      sessoes: 'id, userId, planoId, iniciadoEm, finalizadoEm, syncedAt',
      exerciciosPersonalizados: 'id, userId, grupoMuscular',
      exerciciosCache: 'id, grupoMuscular, nome',
      medidas: 'id, userId, data',
      syncQueue: '++id, createdAt',
    })
  }
}

export const localDB = new TrainingDB()

// ============
// Planos
// ============
export async function getPlans(userId: string): Promise<WorkoutPlan[]> {
  return localDB.planos
    .where('userId')
    .equals(userId)
    .reverse()
    .sortBy('updatedAt')
}

export async function getPlan(id: string): Promise<WorkoutPlan | undefined> {
  return localDB.planos.get(id)
}

export async function savePlan(plano: WorkoutPlan): Promise<void> {
  await localDB.planos.put(plano)
}

export async function deletePlan(id: string): Promise<void> {
  await localDB.planos.delete(id)
}

// ============
// Sessões
// ============
export async function getSessions(userId: string, limit = 50): Promise<WorkoutSession[]> {
  const all = await localDB.sessoes
    .where('userId')
    .equals(userId)
    .reverse()
    .sortBy('iniciadoEm')
  return all.slice(0, limit)
}

export async function getSession(id: string): Promise<WorkoutSession | undefined> {
  return localDB.sessoes.get(id)
}

export async function saveSession(sessao: WorkoutSession): Promise<void> {
  await localDB.sessoes.put(sessao)
}

export async function deleteSession(id: string): Promise<void> {
  await localDB.sessoes.delete(id)
}

// ============
// Exercícios personalizados
// ============
export async function getPersonalizedExercises(userId: string): Promise<Exercise[]> {
  return localDB.exerciciosPersonalizados
    .where('userId')
    .equals(userId)
    .toArray()
}

export async function savePersonalizedExercise(ex: Exercise): Promise<void> {
  await localDB.exerciciosPersonalizados.put(ex)
}

// ============
// Cache exercícios (free-exercise-db)
// ============
export async function getCachedExercises(): Promise<Exercise[]> {
  return localDB.exerciciosCache.toArray()
}

export async function setCachedExercises(exercicios: Exercise[]): Promise<void> {
  await localDB.exerciciosCache.bulkPut(exercicios)
}

// ============
// Favoritos
// ============
export async function toggleExerciseFavorite(exercicioId: string, favoritado: boolean): Promise<void> {
  // Tenta atualizar no cache
  const cached = await localDB.exerciciosCache.get(exercicioId)
  if (cached) {
    await localDB.exerciciosCache.put({ ...cached, favoritado })
    return
  }
  // Se for personalizado
  const custom = await localDB.exerciciosPersonalizados.get(exercicioId)
  if (custom) {
    await localDB.exerciciosPersonalizados.put({ ...custom, favoritado })
  }
}

export async function getFavoritoIds(): Promise<Set<string>> {
  const cached = await localDB.exerciciosCache.filter(ex => ex.favoritado === true).toArray()
  const custom = await localDB.exerciciosPersonalizados.filter(ex => ex.favoritado === true).toArray()
  return new Set([...cached, ...custom].map(ex => ex.id))
}

// ============
// Medidas Corporais
// ============
export async function getMeasurements(userId: string): Promise<BodyMeasurement[]> {
  return localDB.medidas
    .where('userId')
    .equals(userId)
    .reverse()
    .sortBy('data')
}

export async function saveMeasurement(medida: BodyMeasurement): Promise<void> {
  await localDB.medidas.put(medida)
}

export async function deleteMeasurement(id: string): Promise<void> {
  await localDB.medidas.delete(id)
}
