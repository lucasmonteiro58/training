import Dexie, { type Table } from 'dexie'
import type { PlanoDeTreino, SessaoDeTreino, Exercicio } from '../../types'

class FitTrackDB extends Dexie {
  planos!: Table<PlanoDeTreino>
  sessoes!: Table<SessaoDeTreino>
  exerciciosPersonalizados!: Table<Exercicio>
  exerciciosCache!: Table<Exercicio>

  constructor() {
    super('fittrack-db')
    this.version(1).stores({
      planos: 'id, userId, updatedAt, syncedAt',
      sessoes: 'id, userId, planoId, iniciadoEm, finalizadoEm, syncedAt',
      exerciciosPersonalizados: 'id, userId, grupoMuscular',
      exerciciosCache: 'id, grupoMuscular, nome',
    })
  }
}

export const localDB = new FitTrackDB()

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
