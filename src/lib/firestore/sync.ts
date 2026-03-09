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
import { salvarPlano, salvarSessao, salvarExercicioPersonalizado } from '../db/dexie'
import type { PlanoDeTreino, SessaoDeTreino, Exercicio } from '../../types'

// ============================
// Planos
// ============================
export async function syncPlanoParaFirestore(plano: PlanoDeTreino): Promise<void> {
  try {
    const ref = doc(db, 'planos', plano.id)
    await setDoc(ref, stripUndefined({ ...plano, syncedAt: Date.now() }))
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

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const planos: PlanoDeTreino[] = []
      snapshot.forEach((d) => {
        const data = d.data() as PlanoDeTreino
        planos.push(data)
        salvarPlano(data)
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
export async function syncSessaoParaFirestore(sessao: SessaoDeTreino): Promise<void> {
  try {
    const ref = doc(db, 'sessoes', sessao.id)
    await setDoc(ref, stripUndefined({ ...sessao, syncedAt: Date.now() }))
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

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const sessoes: SessaoDeTreino[] = []
      snapshot.forEach((d) => {
        const data = d.data() as SessaoDeTreino
        sessoes.push(data)
        salvarSessao(data)
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
export async function syncProgressoTreinoParaFirestore(
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

export function subscribeToProgressoTreino(
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

export async function limparProgressoTreinoFirestore(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'ativo', userId))
  } catch (err) {
    console.error('Erro ao limpar progresso ativo:', err)
  }
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

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const exercicios: Exercicio[] = []
      snapshot.forEach((d) => {
        const data = d.data() as Exercicio
        exercicios.push(data)
        salvarExercicioPersonalizado(data)
      })
      callback(exercicios)
    },
    (err) => {
      console.error('Erro no subscribe de Exercícios:', err)
    }
  )

  return unsubscribe
}
