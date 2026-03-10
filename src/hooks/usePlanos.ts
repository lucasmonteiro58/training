import { useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { usePlanosStore } from '../stores'
import { useAuthStore } from '../stores'
import { getPlanos, salvarPlano, deletarPlano } from '../lib/db/dexie'
import { syncPlanoParaFirestore, deletarPlanoFirestore, subscribeToPlanos, subscribeToExercicios, fetchPlanos } from '../lib/firestore/sync'
import type { PlanoDeTreino, ExercicioNoPlano } from '../types'
import { CORES_PLANO } from '../types'

export function usePlanos() {
  const user = useAuthStore((s) => s.user)
  const { planos, loading, setPlanos, addPlano, updatePlano, removePlano, setLoading } =
    usePlanosStore()

  // Carregar planos locais e assinar firestore
  useEffect(() => {
    if (!user) return

    // 1. Carrega local primeiro (mais rápido)
    getPlanos(user.uid).then((local) => {
      setPlanos(local)
      setLoading(false)
    })

    // 2. Subscribe em tempo real ao Firestore
    const unsubPlanos = subscribeToPlanos(user.uid, (remote) => {
      setPlanos(remote)
      setLoading(false)
    })

    // 3. Subscribe em tempo real aos Exercícios Personalizados
    const unsubExercicios = subscribeToExercicios(user.uid, () => {
      // O subscribeToExercicios já salva no Dexie local automaticamente.
      // Não precisamos atualizar um store específico aqui se não houver um useExerciciosStore,
      // mas as telas que consultam o Dexie (como a de Exercícios) verão os dados.
    })

    return () => {
      unsubPlanos()
      unsubExercicios()
    }
  }, [user, setPlanos, setLoading])

  const criarPlano = useCallback(
    async (nome: string, descricao?: string): Promise<PlanoDeTreino> => {
      if (!user) throw new Error('Usuário não autenticado')
      const corAleatoria = CORES_PLANO[Math.floor(Math.random() * CORES_PLANO.length)]
      const plano: PlanoDeTreino = {
        id: uuidv4(),
        userId: user.uid,
        nome,
        descricao,
        exercicios: [],
        cor: corAleatoria,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      await salvarPlano(plano)
      addPlano(plano)
      syncPlanoParaFirestore(plano) // background
      return plano
    },
    [user, addPlano]
  )

  const atualizarPlano = useCallback(
    async (plano: PlanoDeTreino): Promise<void> => {
      const updated = { ...plano, updatedAt: Date.now() }
      await salvarPlano(updated)
      updatePlano(updated)
      syncPlanoParaFirestore(updated) // background
    },
    [updatePlano]
  )

  const excluirPlano = useCallback(
    async (id: string): Promise<void> => {
      await deletarPlano(id)
      removePlano(id)
      deletarPlanoFirestore(id) // background
    },
    [removePlano]
  )

  const sincronizar = useCallback(async () => {
    if (!user) return
    const remote = await fetchPlanos(user.uid)
    if (remote.length > 0) setPlanos(remote)
  }, [user, setPlanos])

  const arquivarPlano = useCallback(
    async (id: string): Promise<void> => {
      const plano = planos.find(p => p.id === id)
      if (!plano) return
      const updated = { ...plano, arquivado: true, updatedAt: Date.now() }
      await salvarPlano(updated)
      updatePlano(updated)
      syncPlanoParaFirestore(updated)
    },
    [planos, updatePlano]
  )

  const desarquivarPlano = useCallback(
    async (id: string): Promise<void> => {
      const plano = planos.find(p => p.id === id)
      if (!plano) return
      const updated = { ...plano, arquivado: false, updatedAt: Date.now() }
      await salvarPlano(updated)
      updatePlano(updated)
      syncPlanoParaFirestore(updated)
    },
    [planos, updatePlano]
  )

  const reordenarPlanos = useCallback(
    async (idsOrdenados: string[]): Promise<void> => {
      const atualizados = planos.map((p) => {
        const idx = idsOrdenados.indexOf(p.id)
        if (idx === -1) return p
        const updated = { ...p, ordem: idx, updatedAt: Date.now() }
        salvarPlano(updated)
        syncPlanoParaFirestore(updated)
        return updated
      })
      setPlanos(atualizados)
    },
    [planos, setPlanos]
  )

  const clonarPlano = useCallback(
    async (planoId: string): Promise<PlanoDeTreino | null> => {
      if (!user) throw new Error('Usuário não autenticado')
      const original = planos.find(p => p.id === planoId)
      if (!original) return null
      const clone: PlanoDeTreino = {
        ...original,
        id: uuidv4(),
        nome: `${original.nome} (cópia)`,
        exercicios: original.exercicios.map(ex => ({
          ...ex,
          id: uuidv4(),
        })),
        arquivado: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncedAt: undefined,
      }
      await salvarPlano(clone)
      addPlano(clone)
      syncPlanoParaFirestore(clone)
      return clone
    },
    [user, planos, addPlano]
  )

  const planosAtivos = planos
    .filter((p) => !p.arquivado)
    .sort((a, b) => (a.ordem ?? a.createdAt) - (b.ordem ?? b.createdAt))
  const planosArquivados = planos.filter((p) => p.arquivado)

  return {
    planos,
    planosAtivos,
    planosArquivados,
    loading,
    criarPlano,
    atualizarPlano,
    excluirPlano,
    arquivarPlano,
    desarquivarPlano,
    reordenarPlanos,
    clonarPlano,
    sincronizar,
  }
}
