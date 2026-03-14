import { useState, useRef, useEffect } from 'react'

export interface TimerSerieState {
  sIdx: number
  restando: number
}

export function useTimerSerie(resetWhenExerciseIndexChanges?: number) {
  const [timerSerie, setTimerSerie] = useState<TimerSerieState | null>(null)
  const timerSerieRef = useRef<number | null>(null)

  const iniciarTimerSerie = (sIdx: number, duracaoSegundos: number) => {
    if (timerSerieRef.current) clearInterval(timerSerieRef.current)
    setTimerSerie({ sIdx, restando: duracaoSegundos })
    timerSerieRef.current = window.setInterval(() => {
      setTimerSerie((prev) => {
        if (!prev || prev.restando <= 1) {
          if (timerSerieRef.current) clearInterval(timerSerieRef.current)
          timerSerieRef.current = null
          return null
        }
        return { ...prev, restando: prev.restando - 1 }
      })
    }, 1000)
  }

  const pararTimerSerie = () => {
    if (timerSerieRef.current) clearInterval(timerSerieRef.current)
    timerSerieRef.current = null
    setTimerSerie(null)
  }

  useEffect(() => {
    pararTimerSerie()
  }, [resetWhenExerciseIndexChanges])

  return { timerSerie, iniciarTimerSerie, pararTimerSerie }
}
