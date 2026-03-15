import { useState, useRef, useEffect } from 'react'

export interface TimerSetState {
  sIdx: number
  remaining: number
}

export function useSetTimer(resetWhenExerciseIndexChanges?: number) {
  const [timerSet, setTimerSet] = useState<TimerSetState | null>(null)
  const timerSetRef = useRef<number | null>(null)

  const startSetTimer = (sIdx: number, durationSeconds: number) => {
    if (timerSetRef.current) clearInterval(timerSetRef.current)
    setTimerSet({ sIdx, remaining: durationSeconds })
    timerSetRef.current = window.setInterval(() => {
      setTimerSet((prev) => {
        if (!prev || prev.remaining <= 1) {
          if (timerSetRef.current) clearInterval(timerSetRef.current)
          timerSetRef.current = null
          return null
        }
        return { ...prev, remaining: prev.remaining - 1 }
      })
    }, 1000)
  }

  const stopSetTimer = () => {
    if (timerSetRef.current) clearInterval(timerSetRef.current)
    timerSetRef.current = null
    setTimerSet(null)
  }

  useEffect(() => {
    stopSetTimer()
  }, [resetWhenExerciseIndexChanges])

  return { timerSet, startSetTimer, stopSetTimer }
}
