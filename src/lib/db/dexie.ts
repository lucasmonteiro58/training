import Dexie, { type Table } from 'dexie'
import type { PlanoDeTreino, SessaoDeTreino, Exercicio, MedidaCorporal } from '../../types'

class TrainingDB extends Dexie {
  planos!: Table<PlanoDeTreino>
  sessoes!: Table<SessaoDeTreino>
  exerciciosPersonalizados!: Table<Exercicio>
  exerciciosCache!: Table<Exercicio>
  medidas!: Table<MedidaCorporal>

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
  }
}

export const localDB = new TrainingDB()

// ============
// Planos
// ============
export async function getPlanos(userId: string): Promise<PlanoDeTreino[]> {
  return localDB.planos
    .where('userId')
    .equals(userId)
    .reverse()
    .sortBy('updatedAt')
}

export async function getPlano(id: string): Promise<PlanoDeTreino | undefined> {
  return localDB.planos.get(id)
}

export async function salvarPlano(plano: PlanoDeTreino): Promise<void> {
  await localDB.planos.put(plano)
}

export async function deletarPlano(id: string): Promise<void> {
  await localDB.planos.delete(id)
}

// ============
// Sessões
// ============
export async function getSessoes(userId: string, limit = 50): Promise<SessaoDeTreino[]> {
  const all = await localDB.sessoes
    .where('userId')
    .equals(userId)
    .reverse()
    .sortBy('iniciadoEm')
  return all.slice(0, limit)
}

export async function getSessao(id: string): Promise<SessaoDeTreino | undefined> {
  return localDB.sessoes.get(id)
}

export async function salvarSessao(sessao: SessaoDeTreino): Promise<void> {
  await localDB.sessoes.put(sessao)
}

export async function deletarSessao(id: string): Promise<void> {
  await localDB.sessoes.delete(id)
}

// ============
// Exercícios personalizados
// ============
export async function getExerciciosPersonalizados(userId: string): Promise<Exercicio[]> {
  return localDB.exerciciosPersonalizados
    .where('userId')
    .equals(userId)
    .toArray()
}

export async function salvarExercicioPersonalizado(ex: Exercicio): Promise<void> {
  await localDB.exerciciosPersonalizados.put(ex)
}

// ============
// Cache exercícios (free-exercise-db)
// ============
export async function getCachedExercicios(): Promise<Exercicio[]> {
  return localDB.exerciciosCache.toArray()
}

export async function setCachedExercicios(exercicios: Exercicio[]): Promise<void> {
  await localDB.exerciciosCache.bulkPut(exercicios)
}

// ============
// Favoritos
// ============
export async function toggleFavoritoExercicio(exercicioId: string, favoritado: boolean): Promise<void> {
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
export async function getMedidas(userId: string): Promise<MedidaCorporal[]> {
  return localDB.medidas
    .where('userId')
    .equals(userId)
    .reverse()
    .sortBy('data')
}

export async function salvarMedida(medida: MedidaCorporal): Promise<void> {
  await localDB.medidas.put(medida)
}

export async function deletarMedida(id: string): Promise<void> {
  await localDB.medidas.delete(id)
}
