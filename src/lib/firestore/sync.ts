import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore'
import { db } from '../firebase'
import { salvarPlano, salvarSessao, salvarExercicioPersonalizado } from '../db/dexie'
import type { PlanoDeTreino, SessaoDeTreino, Exercicio } from '../../types'

// ============================
// Planos
// ============================
export async function syncPlanoParaFirestore(plano: PlanoDeTreino): Promise<void> {
  try {
    const ref = doc(db, 'planos', plano.id)
    await setDoc(ref, {
      ...plano,
      syncedAt: Date.now(),
    })
    // Atualiza local com syncedAt
    await salvarPlano({ ...plano, syncedAt: Date.now() })
  } catch (err) {
    console.error('Erro ao sincronizar plano:', err)
  }
}

export async function deletarPlanoFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'planos', id))
  } catch (err) {
    console.error('Erro ao deletar plano do Firestore:', err)
  }
}

export function subscribeToPlanos(
  userId: string,
  callback: (planos: PlanoDeTreino[]) => void
): () => void {
  const q = query(
    collection(db, 'planos'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  )

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const planos: PlanoDeTreino[] = []
    snapshot.forEach((d) => {
      const data = d.data() as PlanoDeTreino
      planos.push(data)
      // Sync para local
      salvarPlano(data)
    })
    callback(planos)
  })

  return unsubscribe
}

// ============================
// Sessões
// ============================
export async function syncSessaoParaFirestore(sessao: SessaoDeTreino): Promise<void> {
  try {
    const ref = doc(db, 'sessoes', sessao.id)
    await setDoc(ref, {
      ...sessao,
      syncedAt: Date.now(),
    })
    await salvarSessao({ ...sessao, syncedAt: Date.now() })
  } catch (err) {
    console.error('Erro ao sincronizar sessão:', err)
  }
}

export async function deletarSessaoFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'sessoes', id))
  } catch (err) {
    console.error('Erro ao deletar sessão do Firestore:', err)
  }
}

export function subscribeToSessoes(
  userId: string,
  callback: (sessoes: SessaoDeTreino[]) => void,
  limitN = 50
): () => void {
  const q = query(
    collection(db, 'sessoes'),
    where('userId', '==', userId),
    orderBy('iniciadoEm', 'desc'),
    limit(limitN)
  )

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const sessoes: SessaoDeTreino[] = []
    snapshot.forEach((d) => {
      const data = d.data() as SessaoDeTreino
      sessoes.push(data)
      salvarSessao(data)
    })
    callback(sessoes)
  })

  return unsubscribe
}

// Busca inicial de sessões (para carregar dados offline rapidamente)
export async function fetchSessoes(userId: string, limitN = 50): Promise<SessaoDeTreino[]> {
  try {
    const q = query(
      collection(db, 'sessoes'),
      where('userId', '==', userId),
      orderBy('iniciadoEm', 'desc'),
      limit(limitN)
    )
    const snapshot = await getDocs(q)
    const sessoes: SessaoDeTreino[] = []
    snapshot.forEach((d) => {
      sessoes.push(d.data() as SessaoDeTreino)
    })
    return sessoes
  } catch {
    return []
  }
}

// ============================
// Exercícios Personalizados
// ============================
export async function syncExercicioParaFirestore(exercicio: Exercicio): Promise<void> {
  try {
    const ref = doc(db, 'exercicios', exercicio.id)
    await setDoc(ref, {
      ...exercicio,
      syncedAt: Date.now(),
    })
    await salvarExercicioPersonalizado({ ...exercicio, syncedAt: Date.now() } as any)
  } catch (err) {
    console.error('Erro ao sincronizar exercicios:', err)
  }
}

export function subscribeToExercicios(
  userId: string,
  callback: (exercicios: Exercicio[]) => void
): () => void {
  const q = query(
    collection(db, 'exercicios'),
    where('userId', '==', userId)
  )

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const exercicios: Exercicio[] = []
    snapshot.forEach((d) => {
      const data = d.data() as Exercicio
      exercicios.push(data)
      salvarExercicioPersonalizado(data)
    })
    callback(exercicios)
  })

  return unsubscribe
}
