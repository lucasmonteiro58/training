import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore'

// Firestore rejects `undefined` field values – strip them recursively
function stripUndefined<T>(obj: T): T {
  if (Array.isArray(obj)) return obj.map(stripUndefined) as unknown as T
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)])
    ) as T
  }
  return obj
}
import { db } from '../firebase'
import { savePlan, saveSession, savePersonalizedExercise, saveMeasurement } from '../db/dexie'
import type { WorkoutPlan, WorkoutSession, Exercise, BodyMeasurement } from '../../types'
import { incrementSync, decrementSync, enqueueWrite } from '../syncQueue'

// Helper: tenta escrita online, senão enfileira
async function writeOrQueue(
  collectionName: string,
  docId: string,
  operation: 'set' | 'delete',
  data?: Record<string, unknown>,
): Promise<void> {
  if (!navigator.onLine) {
    await enqueueWrite(collectionName, docId, operation, data)
    return
  }
  if (operation === 'set' && data) {
    const ref = doc(db, collectionName, docId)
    await setDoc(ref, data)
  } else if (operation === 'delete') {
    await deleteDoc(doc(db, collectionName, docId))
  }
}

// ============================
// Planos
// ============================
export async function syncPlanToFirestore(plano: WorkoutPlan): Promise<void> {
  incrementSync()
  try {
    const data = stripUndefined({ ...plano, syncedAt: Date.now() })
    await writeOrQueue('planos', plano.id, 'set', data as Record<string, unknown>)
    await savePlan({ ...plano, syncedAt: Date.now() })
  } catch (err) {
    console.error('Erro ao sincronizar plano:', err)
    await enqueueWrite('planos', plano.id, 'set', stripUndefined({ ...plano, syncedAt: Date.now() }) as Record<string, unknown>)
  } finally {
    decrementSync()
  }
}

export async function deletePlanFromFirestore(id: string): Promise<void> {
  incrementSync()
  try {
    await writeOrQueue('planos', id, 'delete')
  } catch (err) {
    console.error('Erro ao deletar plano do Firestore:', err)
    await enqueueWrite('planos', id, 'delete')
  } finally {
    decrementSync()
  }
}

export function subscribeToPlans(
  userId: string,
  callback: (planos: WorkoutPlan[]) => void
): () => void {
  const q = query(
    collection(db, 'planos'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  )

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const planos: WorkoutPlan[] = []
      snapshot.forEach((d) => {
        const data = d.data() as WorkoutPlan
        planos.push(data)
        savePlan(data)
      })
      callback(planos)
    },
    (err) => {
      if (err.code === 'permission-denied') {
        console.warn('Acesso negado ao Firestore (Planos). Verifique as Security Rules.')
      } else {
        console.error('Erro no subscribe de Planos:', err)
      }
    }
  )

  return unsubscribe
}

// ============================
// Sessões
// ============================
export async function syncSessionToFirestore(sessao: WorkoutSession): Promise<void> {
  incrementSync()
  try {
    const data = stripUndefined({ ...sessao, syncedAt: Date.now() })
    await writeOrQueue('sessoes', sessao.id, 'set', data as Record<string, unknown>)
    await saveSession({ ...sessao, syncedAt: Date.now() })
  } catch (err) {
    console.error('Erro ao sincronizar sessão:', err)
    await enqueueWrite('sessoes', sessao.id, 'set', stripUndefined({ ...sessao, syncedAt: Date.now() }) as Record<string, unknown>)
  } finally {
    decrementSync()
  }
}

export async function deleteSessionFromFirestore(id: string): Promise<void> {
  incrementSync()
  try {
    await writeOrQueue('sessoes', id, 'delete')
  } catch (err) {
    console.error('Erro ao deletar sessão do Firestore:', err)
    await enqueueWrite('sessoes', id, 'delete')
  } finally {
    decrementSync()
  }
}

export function subscribeToSessions(
  userId: string,
  callback: (sessoes: WorkoutSession[]) => void,
  limitN = 50
): () => void {
  const q = query(
    collection(db, 'sessoes'),
    where('userId', '==', userId),
    orderBy('iniciadoEm', 'desc'),
    limit(limitN)
  )

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const sessoes: WorkoutSession[] = []
      snapshot.forEach((d) => {
        const data = d.data() as WorkoutSession
        sessoes.push(data)
        saveSession(data)
      })
      callback(sessoes)
    },
    (err) => {
      if (err.code === 'permission-denied') {
        console.warn('Acesso negado ao Firestore (Sessões).')
      } else {
        console.error('Erro no subscribe de Sessões:', err)
      }
    }
  )

  return unsubscribe
}

// ============================
// Progresso em Tempo Real (Treino Ativo)
// ============================
export async function syncWorkoutProgressToFirestore(
  userId: string,
  dados: any
): Promise<void> {
  try {
    const ref = doc(db, 'ativo', userId)
    await setDoc(ref, stripUndefined({ ...dados, updatedAt: Date.now() }))
  } catch (err) {
    console.error('Erro ao sincronizar progresso ativo:', err)
  }
}

export function subscribeToWorkoutProgress(
  userId: string,
  callback: (dados: any) => void
): () => void {
  const ref = doc(db, 'ativo', userId)
  return onSnapshot(
    ref,
    (d) => {
      if (d.exists()) {
        callback(d.data())
      } else {
        callback(null)
      }
    },
    (err) => {
      if (err.code === 'permission-denied') {
        console.warn('Acesso negado ao Firestore (Treino Ativo).')
      } else {
        console.error('Erro no subscribe de Progresso Treino:', err)
      }
    }
  )
}

export async function clearWorkoutProgressFromFirestore(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'ativo', userId))
  } catch (err) {
    console.error('Erro ao limpar progresso ativo:', err)
  }
}

// ============================
// Configurações do Usuário
// ============================
export interface ConfigUsuario {
  metaSemanal?: number
  /** Dias da semana marcados como opcionais (0=dom, 1=seg, ..., 6=sáb). Não treinar nesses dias não quebra o streak. */
  diasOpcionais?: number[]
}

export async function getConfigUsuario(userId: string): Promise<ConfigUsuario> {
  try {
    const ref = doc(db, 'configuracoes', userId)
    const snap = await getDoc(ref)
    if (snap.exists()) return snap.data() as ConfigUsuario
    return {}
  } catch {
    return {}
  }
}

export async function salvarConfigUsuario(
  userId: string,
  config: Partial<ConfigUsuario>
): Promise<void> {
  try {
    const ref = doc(db, 'configuracoes', userId)
    await setDoc(ref, stripUndefined({ ...config, updatedAt: Date.now() }), { merge: true })
  } catch (err) {
    console.error('Erro ao salvar config:', err)
  }
}

// Busca inicial de planos (para sync manual)
export async function fetchPlans(userId: string): Promise<WorkoutPlan[]> {
  try {
    const q = query(
      collection(db, 'planos'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    )
    const snapshot = await getDocs(q)
    const planos: WorkoutPlan[] = []
    snapshot.forEach((d) => {
      const data = d.data() as WorkoutPlan
      planos.push(data)
      savePlan(data)
    })
    return planos
  } catch {
    return []
  }
}

// Busca inicial de sessões (para carregar dados offline rapidamente)
export async function fetchSessions(userId: string, limitN = 50): Promise<WorkoutSession[]> {
  try {
    const q = query(
      collection(db, 'sessoes'),
      where('userId', '==', userId),
      orderBy('iniciadoEm', 'desc'),
      limit(limitN)
    )
    const snapshot = await getDocs(q)
    const sessoes: WorkoutSession[] = []
    snapshot.forEach((d) => {
      sessoes.push(d.data() as WorkoutSession)
    })
    return sessoes
  } catch {
    return []
  }
}

// ============================
// Exercícios Personalizados
// ============================
export async function syncExerciseToFirestore(exercicio: Exercise): Promise<void> {
  incrementSync()
  try {
    const data = { ...exercicio, syncedAt: Date.now() }
    await writeOrQueue('exercicios', exercicio.id, 'set', data as Record<string, unknown>)
    await savePersonalizedExercise({ ...exercicio, syncedAt: Date.now() } as any)
  } catch (err) {
    console.error('Erro ao sincronizar exercicios:', err)
    await enqueueWrite('exercicios', exercicio.id, 'set', { ...exercicio, syncedAt: Date.now() } as Record<string, unknown>)
  } finally {
    decrementSync()
  }
}

export function subscribeToExercises(
  userId: string,
  callback: (exercicios: Exercise[]) => void
): () => void {
  const q = query(
    collection(db, 'exercicios'),
    where('userId', '==', userId)
  )

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const exercicios: Exercise[] = []
      snapshot.forEach((d) => {
        const data = d.data() as Exercise
        exercicios.push(data)
        savePersonalizedExercise(data)
      })
      callback(exercicios)
    },
    (err) => {
      console.error('Erro no subscribe de Exercícios:', err)
    }
  )

  return unsubscribe
}

// ============================
// Medidas Corporais
// ============================
export async function syncMeasurementToFirestore(medida: BodyMeasurement): Promise<void> {
  incrementSync()
  try {
    const data = stripUndefined({ ...medida, syncedAt: Date.now() })
    await writeOrQueue('medidas', medida.id, 'set', data as Record<string, unknown>)
  } catch (err) {
    console.error('Erro ao sincronizar medida:', err)
    await enqueueWrite('medidas', medida.id, 'set', stripUndefined({ ...medida, syncedAt: Date.now() }) as Record<string, unknown>)
  } finally {
    decrementSync()
  }
}

export async function deleteMeasurementFromFirestore(id: string): Promise<void> {
  incrementSync()
  try {
    await writeOrQueue('medidas', id, 'delete')
  } catch (err) {
    console.error('Erro ao deletar medida do Firestore:', err)
    await enqueueWrite('medidas', id, 'delete')
  } finally {
    decrementSync()
  }
}

export function subscribeToMeasurements(
  userId: string,
  callback: (medidas: BodyMeasurement[]) => void
): () => void {
  const q = query(
    collection(db, 'medidas'),
    where('userId', '==', userId),
    orderBy('data', 'desc')
  )

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const medidas: BodyMeasurement[] = []
      snapshot.forEach((d) => {
        const data = d.data() as BodyMeasurement
        medidas.push(data)
        saveMeasurement(data)
      })
      callback(medidas)
    },
    (err) => {
      if (err.code === 'permission-denied') {
        console.warn('Acesso negado ao Firestore (Medidas).')
      } else {
        console.error('Erro no subscribe de Medidas:', err)
      }
    }
  )

  return unsubscribe
}
