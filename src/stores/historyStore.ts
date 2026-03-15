import { create } from 'zustand'
import type { WorkoutSession } from '../types'

export interface AutoClosedSnapshot {
  session: WorkoutSession
  currentExerciseIndex: number
  currentSetIndex: number
  totalTimerSeconds: number
}

export interface HistoryState {
  sessions: WorkoutSession[]
  loading: boolean
  /** Filled when a workout was auto-closed due to inactivity (20 min) */
  autoClosedSnapshot: AutoClosedSnapshot | null
  setSessions: (sessions: WorkoutSession[]) => void
  addSession: (session: WorkoutSession) => void
  removeSession: (id: string) => void
  setLoading: (v: boolean) => void
  setAutoClosedSnapshot: (snapshot: AutoClosedSnapshot | null) => void
}

export const useHistoryStore = create<HistoryState>(set => ({
  sessions: [],
  loading: true,
  autoClosedSnapshot: null,
  setSessions: sessions => set({ sessions }),
  addSession: session =>
    set(s => {
      const exists = s.sessions.some(x => x.id === session.id)
      const next = exists
        ? s.sessions.map(x => (x.id === session.id ? session : x))
        : [session, ...s.sessions]
      return { sessions: next.sort((a, b) => b.iniciadoEm - a.iniciadoEm) }
    }),
  removeSession: id => set(s => ({ sessions: s.sessions.filter(s2 => s2.id !== id) })),
  setLoading: loading => set({ loading }),
  setAutoClosedSnapshot: autoClosedSnapshot => set({ autoClosedSnapshot }),
}))
