import Dexie, { type Table, type Transaction } from 'dexie'
import type { WorkoutPlan, WorkoutSession, Exercise, BodyMeasurement } from '../../types'

// Map PT → EN for local DB migration (same keys as Firestore migration)
const KEY_MAP: Record<string, string> = {
  nome: 'name',
  grupoMuscular: 'muscleGroup',
  grupoMuscularSecundario: 'secondaryMuscleGroup',
  equipamento: 'equipment',
  instrucoes: 'instructions',
  personalizado: 'custom',
  favoritado: 'favorited',
  descricao: 'description',
  exercicios: 'exercises',
  cor: 'color',
  arquivado: 'archived',
  ordem: 'order',
  exercicioId: 'exerciseId',
  exercicio: 'exercise',
  repeticoesMeta: 'targetReps',
  pesoMeta: 'targetWeight',
  seriesDetalhadas: 'setsDetail',
  descansoSegundos: 'restSeconds',
  notas: 'notes',
  tipoSerie: 'setType',
  duracaoMetaSegundos: 'targetDurationSeconds',
  agrupamentoId: 'groupingId',
  tipoAgrupamento: 'groupingType',
  planoId: 'planId',
  planoNome: 'planName',
  iniciadoEm: 'startedAt',
  finalizadoEm: 'finishedAt',
  duracaoSegundos: 'durationSeconds',
  volumeTotal: 'totalVolume',
  autoEncerrado: 'autoClosed',
  tempoOciosoDescontadoSegundos: 'idleSecondsDeducted',
  exercicioNome: 'exerciseName',
  series: 'sets',
  repeticoes: 'reps',
  peso: 'weight',
  completada: 'completed',
}

function mapKeysRecursive(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) return value.map(mapKeysRecursive)
  if (typeof value !== 'object') return value
  const out: Record<string, unknown> = {}
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    const enKey = KEY_MAP[key] ?? key
    const mapped = mapKeysRecursive(v)
    if (mapped !== undefined) out[enKey] = mapped
  }
  return out
}

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
    this.version(4).stores({
      planos: 'id, userId, updatedAt, syncedAt',
      sessoes: 'id, userId, planId, startedAt, finishedAt, syncedAt',
      exerciciosPersonalizados: 'id, userId, muscleGroup',
      exerciciosCache: 'id, muscleGroup, name',
      medidas: 'id, userId, data',
      syncQueue: '++id, createdAt',
    }).upgrade((tx) => {
      return Promise.all([
        migrateTable(tx, 'planos', mapKeysRecursive),
        migrateTable(tx, 'sessoes', mapKeysRecursive),
        migrateTable(tx, 'exerciciosPersonalizados', mapKeysRecursive),
        migrateTable(tx, 'exerciciosCache', mapKeysRecursive),
      ])
    })
  }
}

async function migrateTable(
  tx: Transaction,
  tableName: string,
  mapFn: (v: unknown) => unknown
): Promise<void> {
  const table = tx.table(tableName)
  const rows = await table.toArray()
  await table.clear()
  for (const row of rows) {
    const mapped = mapFn(row) as Record<string, unknown>
    if (mapped && typeof mapped === 'object') await table.add(mapped)
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

export async function savePlan(plan: WorkoutPlan): Promise<void> {
  await localDB.planos.put(plan)
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
    .sortBy('startedAt')
  return all.slice(0, limit)
}

export async function getSession(id: string): Promise<WorkoutSession | undefined> {
  return localDB.sessoes.get(id)
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  await localDB.sessoes.put(session)
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

export async function setCachedExercises(exercises: Exercise[]): Promise<void> {
  await localDB.exerciciosCache.bulkPut(exercises)
}

// ============
// Favoritos
// ============
export async function toggleExerciseFavorite(exerciseId: string, favorited: boolean): Promise<void> {
  const cached = await localDB.exerciciosCache.get(exerciseId)
  if (cached) {
    await localDB.exerciciosCache.put({ ...cached, favorited })
    return
  }
  const custom = await localDB.exerciciosPersonalizados.get(exerciseId)
  if (custom) {
    await localDB.exerciciosPersonalizados.put({ ...custom, favorited })
  }
}

export async function getFavoriteIds(): Promise<Set<string>> {
  const cached = await localDB.exerciciosCache.filter((ex) => ex.favorited === true).toArray()
  const custom = await localDB.exerciciosPersonalizados.filter((ex) => ex.favorited === true).toArray()
  return new Set([...cached, ...custom].map((ex) => ex.id))
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

export async function saveMeasurement(measurement: BodyMeasurement): Promise<void> {
  await localDB.medidas.put(measurement)
}

export async function deleteMeasurement(id: string): Promise<void> {
  await localDB.medidas.delete(id)
}
