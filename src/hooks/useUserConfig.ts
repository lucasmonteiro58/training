import { useState, useEffect, useCallback } from 'react'
import { getUserConfig, saveUserConfig } from '../lib/firestore/sync'
import { toast } from 'sonner'

export function useUserConfig(user: { uid: string } | null) {
  const [weeklyGoal, setWeeklyGoal] = useState(() => {
    const saved = localStorage.getItem('weeklyGoal')
    return saved ? parseInt(saved, 10) : 4
  })
  const [optionalDays, setOptionalDays] = useState<number[]>(() => {
    try {
      const v = localStorage.getItem('optionalDays')
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
    getUserConfig(user.uid).then((config) => {
      if (config.metaSemanal != null) {
        setWeeklyGoal(config.metaSemanal)
        localStorage.setItem('weeklyGoal', String(config.metaSemanal))
      }
      if (config.diasOpcionais && Array.isArray(config.diasOpcionais)) {
        setOptionalDays(config.diasOpcionais)
        localStorage.setItem(
          'optionalDays',
          JSON.stringify(config.diasOpcionais)
        )
      }
    })
  }, [user])

  const handleSaveGoal = useCallback(
    (value: number) => {
      setWeeklyGoal(value)
      localStorage.setItem('weeklyGoal', String(value))
      if (user) saveUserConfig(user.uid, { metaSemanal: value })
      toast.success(`Meta atualizada para ${value}x por semana`)
    },
    [user]
  )

  return {
    weeklyGoal,
    setWeeklyGoal,
    optionalDays,
    setOptionalDays,
    handleSaveGoal,
  }
}
