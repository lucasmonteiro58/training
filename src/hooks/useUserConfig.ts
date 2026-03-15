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
      if (config.weeklyGoal != null) {
        setWeeklyGoal(config.weeklyGoal)
        localStorage.setItem('weeklyGoal', String(config.weeklyGoal))
      }
      if (config.optionalDays && Array.isArray(config.optionalDays)) {
        setOptionalDays(config.optionalDays)
        localStorage.setItem(
          'optionalDays',
          JSON.stringify(config.optionalDays)
        )
      }
    })
  }, [user])

  const handleSaveGoal = useCallback(
    (value: number) => {
      setWeeklyGoal(value)
      localStorage.setItem('weeklyGoal', String(value))
      if (user) saveUserConfig(user.uid, { weeklyGoal: value })
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
