import { useState, useCallback } from 'react'
import type { WorkoutSession } from '../types'
import { toast } from 'sonner'

export function useSessionEdit(
  sessao: WorkoutSession | undefined,
  salvarSessaoCompleta: (sessao: WorkoutSession) => Promise<void>
) {
  const [editando, setEditando] = useState(false)
  const [editData, setEditData] = useState<WorkoutSession | null>(null)

  const displaySessao = editando && editData ? editData : sessao ?? null

  const iniciarEdicao = useCallback(() => {
    if (!sessao) return
    setEditData(JSON.parse(JSON.stringify(sessao)))
    setEditando(true)
  }, [sessao])

  const salvarEdicao = useCallback(async () => {
    if (!editData) return
    const volumeTotal = editData.exercicios.reduce(
      (sum, ex) =>
        sum +
        ex.series
          .filter((s) => s.completada)
          .reduce((s, sr) => s + (sr.peso ?? 0) * (sr.repeticoes ?? 0), 0),
      0
    )
    await salvarSessaoCompleta({ ...editData, volumeTotal })
    setEditando(false)
    setEditData(null)
    toast.success('Sessão atualizada!')
  }, [editData, salvarSessaoCompleta])

  const cancelarEdicao = useCallback(() => {
    setEditando(false)
    setEditData(null)
  }, [])

  const updateSerie = useCallback(
    (
      exIdx: number,
      sIdx: number,
      campo: Partial<{
        peso: number
        repeticoes: number
        completada: boolean
      }>
    ) => {
      if (!editData) return
      const updated = { ...editData }
      updated.exercicios = updated.exercicios.map((ex, eI) => {
        if (eI !== exIdx) return ex
        return {
          ...ex,
          series: ex.series.map((s, sI) =>
            sI === sIdx ? { ...s, ...campo } : s
          ),
        }
      })
      setEditData(updated)
    },
    [editData]
  )

  const updateDuracao = useCallback((duracaoSegundos: number) => {
    setEditData((prev) => (prev ? { ...prev, duracaoSegundos } : null))
  }, [])

  const updateIniciadoEm = useCallback((iniciadoEm: number) => {
    setEditData((prev) => (prev ? { ...prev, iniciadoEm } : null))
  }, [])

  return {
    editando,
    editData,
    displaySessao,
    iniciarEdicao,
    salvarEdicao,
    cancelarEdicao,
    updateSerie,
    updateDuracao,
    updateIniciadoEm,
  }
}
