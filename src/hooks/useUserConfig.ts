import { useState, useEffect, useCallback } from 'react'
import { getConfigUsuario, salvarConfigUsuario } from '../lib/firestore/sync'
import { toast } from 'sonner'

export function useUserConfig(user: { uid: string } | null) {
  const [metaSemanal, setMetaSemanal] = useState(() => {
    const saved = localStorage.getItem('metaSemanal')
    return saved ? parseInt(saved, 10) : 4
  })
  const [diasOpcionais, setDiasOpcionais] = useState<number[]>(() => {
    try {
      const v = localStorage.getItem('diasOpcionais')
      if (!v) return []
      const arr = JSON.parse(v) as unknown
      return Array.isArray(arr)
        ? arr.filter(
            (n): n is number => typeof n === 'number' && n >= 0 && n <= 6
          )
        : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (!user) return
    getConfigUsuario(user.uid).then((config) => {
      if (config.metaSemanal != null) {
        setMetaSemanal(config.metaSemanal)
        localStorage.setItem('metaSemanal', String(config.metaSemanal))
      }
      if (config.diasOpcionais && Array.isArray(config.diasOpcionais)) {
        setDiasOpcionais(config.diasOpcionais)
        localStorage.setItem(
          'diasOpcionais',
          JSON.stringify(config.diasOpcionais)
        )
      }
    })
  }, [user])

  const handleSaveMeta = useCallback(
    (valor: number) => {
      setMetaSemanal(valor)
      localStorage.setItem('metaSemanal', String(valor))
      if (user) salvarConfigUsuario(user.uid, { metaSemanal: valor })
      toast.success(`Meta atualizada para ${valor}x por semana`)
    },
    [user]
  )

  return {
    metaSemanal,
    setMetaSemanal,
    diasOpcionais,
    setDiasOpcionais,
    handleSaveMeta,
  }
}
