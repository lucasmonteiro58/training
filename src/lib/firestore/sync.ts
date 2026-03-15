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
// Plans
// ============================
export async function syncPlanToFirestore(plan: WorkoutPlan): Promise<void> {
  incrementSync()
  try {
    const data = stripUndefined({ ...plan, syncedAt: Date.now() })
    await writeOrQueue('plans', plan.id, 'set', data as Record<string, unknown>)
    await savePlan({ ...plan, syncedAt: Date.now() })
  } catch (err) {
    console.error('Erro ao sincronizar plano:', err)
    await enqueueWrite('plans', plan.id, 'set', stripUndefined({ ...plan, syncedAt: Date.now() }) as Record<string, unknown>)
  } finally {
    decrementSync()
  }
}

export async function deletePlanFromFirestore(id: string): Promise<void> {
  incrementSync()
  try {
    await writeOrQueue('plans', id, 'delete')
  } catch (err) {
    console.error('Erro ao deletar plano do Firestore:', err)
    await enqueueWrite('plans', id, 'delete')
  } finally {
    decrementSync()
  }
}

export function subscribeToPlans(
  userId: string,
  callback: (plans: WorkoutPlan[]) => void
): () => void {
  const q = query(
    collection(db, 'plans'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  )

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const plans: WorkoutPlan[] = []
      snapshot.forEach((d) => {
        const data = d.data() as WorkoutPlan
        plans.push(data)
        savePlan(data)
      })
      callback(plans)
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
// Sessions
// ============================
export async function syncSessionToFirestore(session: WorkoutSession): Promise<void> {
  incrementSync()
  try {
    const data = stripUndefined({ ...session, syncedAt: Date.now() })
    await writeOrQueue('sessions', session.id, 'set', data as Record<string, unknown>)
    await saveSession({ ...session, syncedAt: Date.now() })
  } catch (err) {
    console.error('Erro ao sincronizar sessão:', err)
    await enqueueWrite('sessions', session.id, 'set', stripUndefined({ ...session, syncedAt: Date.now() }) as Record<string, unknown>)
  } finally {
    decrementSync()
  }
}

export async function deleteSessionFromFirestore(id: string): Promise<void> {
  incrementSync()
  try {
    await writeOrQueue('sessions', id, 'delete')
  } catch (err) {
    console.error('Erro ao deletar sessão do Firestore:', err)
    await enqueueWrite('sessions', id, 'delete')
  } finally {
    decrementSync()
  }
}

export function subscribeToSessions(
  userId: string,
  callback: (sessions: WorkoutSession[]) => void,
  limitN = 50
): () => void {
  const q = query(
    collection(db, 'sessions'),
    where('userId', '==', userId),
    orderBy('startedAt', 'desc'),
    limit(limitN)
  )

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const sessions: WorkoutSession[] = []
      snapshot.forEach((d) => {
        const data = d.data() as WorkoutSession
        sessions.push(data)
        saveSession(data)
      })
      callback(sessions)
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
  data: any
): Promise<void> {
  try {
    const ref = doc(db, 'active', userId)
    await setDoc(ref, stripUndefined({ ...data, updatedAt: Date.now() }))
  } catch (err) {
    console.error('Erro ao sincronizar progresso ativo:', err)
  }
}

export function subscribeToWorkoutProgress(
  userId: string,
  callback: (data: any) => void
): () => void {
  const ref = doc(db, 'active', userId)
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
    await deleteDoc(doc(db, 'active', userId))
  } catch (err) {
    console.error('Erro ao limpar progresso ativo:', err)
  }
}

// ============================
// Configurações do Usuário
// ============================
export interface UserConfig {
  weeklyGoal?: number
  optionalDays?: number[]
}

export async function getUserConfig(userId: string): Promise<UserConfig> {
  try {
    const ref = doc(db, 'settings', userId)
    const snap = await getDoc(ref)
    if (snap.exists()) return snap.data() as UserConfig
    return {}
  } catch {
    return {}
  }
}

export async function saveUserConfig(
  userId: string,
  config: Partial<UserConfig>
): Promise<void> {
  try {
    const ref = doc(db, 'settings', userId)
    await setDoc(ref, stripUndefined({ ...config, updatedAt: Date.now() }), { merge: true })
  } catch (err) {
    console.error('Erro ao salvar config:', err)
  }
}

// Busca inicial de planos (para sync manual)
export async function fetchPlans(userId: string): Promise<WorkoutPlan[]> {
  try {
    const q = query(
      collection(db, 'plans'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    )
    const snapshot = await getDocs(q)
    const plans: WorkoutPlan[] = []
    snapshot.forEach((d) => {
      const data = d.data() as WorkoutPlan
      plans.push(data)
      savePlan(data)
    })
    return plans
  } catch {
    return []
  }
}

// Busca inicial de sessões (para carregar dados offline rapidamente)
export async function fetchSessions(userId: string, limitN = 50): Promise<WorkoutSession[]> {
  try {
    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', userId),
      orderBy('startedAt', 'desc'),
      limit(limitN)
    )
    const snapshot = await getDocs(q)
    const sessions: WorkoutSession[] = []
    snapshot.forEach((d) => {
      sessions.push(d.data() as WorkoutSession)
    })
    return sessions
  } catch {
    return []
  }
}

// ============================
// Exercises (personalizados)
// ============================
export async function syncExerciseToFirestore(exercise: Exercise): Promise<void> {
  incrementSync()
  try {
    const data = { ...exercise, syncedAt: Date.now() }
    await writeOrQueue('exercises', exercise.id, 'set', data as Record<string, unknown>)
    await savePersonalizedExercise({ ...exercise, syncedAt: Date.now() } as any)
  } catch (err) {
    console.error('Erro ao sincronizar exercícios:', err)
    await enqueueWrite('exercises', exercise.id, 'set', { ...exercise, syncedAt: Date.now() } as Record<string, unknown>)
  } finally {
    decrementSync()
  }
}

export function subscribeToExercises(
  userId: string,
  callback: (exercises: Exercise[]) => void
): () => void {
  const q = query(
    collection(db, 'exercises'),
    where('userId', '==', userId)
  )

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const exercises: Exercise[] = []
      snapshot.forEach((d) => {
        const data = d.data() as Exercise
        exercises.push(data)
        savePersonalizedExercise(data)
      })
      callback(exercises)
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
export async function syncMeasurementToFirestore(measurement: BodyMeasurement): Promise<void> {
  incrementSync()
  try {
    const data = stripUndefined({ ...measurement, syncedAt: Date.now() })
    await writeOrQueue('measurements', measurement.id, 'set', data as Record<string, unknown>)
  } catch (err) {
    console.error('Erro ao sincronizar medida:', err)
    await enqueueWrite('measurements', measurement.id, 'set', stripUndefined({ ...measurement, syncedAt: Date.now() }) as Record<string, unknown>)
  } finally {
    decrementSync()
  }
}

export async function deleteMeasurementFromFirestore(id: string): Promise<void> {
  incrementSync()
  try {
    await writeOrQueue('measurements', id, 'delete')
  } catch (err) {
    console.error('Erro ao deletar medida do Firestore:', err)
    await enqueueWrite('measurements', id, 'delete')
  } finally {
    decrementSync()
  }
}

export function subscribeToMeasurements(
  userId: string,
  callback: (measurements: BodyMeasurement[]) => void
): () => void {
  const q = query(
    collection(db, 'measurements'),
    where('userId', '==', userId),
    orderBy('data', 'desc')
  )

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const measurements: BodyMeasurement[] = []
      snapshot.forEach((d) => {
        const data = d.data() as BodyMeasurement
        measurements.push(data)
        saveMeasurement(data)
      })
      callback(measurements)
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
