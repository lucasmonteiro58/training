import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WorkoutSession } from '../types'
import { syncWorkoutProgressToFirestore, clearWorkoutProgressFromFirestore } from '../lib/firestore/sync'
import type { AutoClosedSnapshot } from './historyStore'

export function calcularVolume(sessao: WorkoutSession): number {
  return sessao.exercicios.reduce((total, ex) => {
    return (
      total +
      ex.series
        .filter(s => s.completada)
        .reduce((sum, s) => sum + s.peso * s.repeticoes, 0)
    )
  }, 0)
}

export const INATIVIDADE_AUTO_ENCERRAR_MS = 20 * 60 * 1000 // 20 minutos

/** Payload shape sent to Firestore "ativo" doc (keys kept for backward compatibility). */
export interface ActiveWorkoutSyncPayload {
  sessao: WorkoutSession
  exercicioAtualIndex: number
  serieAtualIndex: number
  cronometroGeralSegundos?: number
  iniciado?: boolean
  pausado?: boolean
  tempoPausadoTotal?: number
  ultimaPausaRecordada?: number | null
  timestampDescansoFim?: number | null
}

export interface ActiveWorkoutStoreState {
  session: WorkoutSession | null
  currentExerciseIndex: number
  currentSetIndex: number
  totalTimerSeconds: number
  restTimerSeconds: number
  restTimerActive: boolean
  paused: boolean
  started: boolean
  totalPausedTime: number
  lastPauseRecorded: number | null
  restEndTimestamp: number | null
  lastSetCompleted: { exercicioIdx: number; serieIdx: number } | null
  startWorkout: (session: WorkoutSession) => void
  finishWorkout: () => WorkoutSession | null
  pauseWorkout: () => void
  resume: () => void
  nextExercise: () => void
  previousExercise: () => void
  updateSet: (
    exercicioIdx: number,
    serieIdx: number,
    dados: Partial<{ repeticoes: number; peso: number; completada: boolean }>
  ) => void
  markSetCompleted: (exercicioIdx: number, serieIdx: number) => void
  undoLastSet: () => void
  startRest: (segundos: number) => void
  stopRest: () => void
  tickTotal: () => void
  tickRest: () => void
  updateTotalTimer: (segundos: number) => void
  restoreFromExternal: (dados: ActiveWorkoutSyncPayload & { pausado?: boolean; tempoPausadoTotal?: number; ultimaPausaRecordada?: number | null; timestampDescansoFim?: number | null; cronometroGeralSegundos?: number }) => void
  syncExternalState: (dados: ActiveWorkoutSyncPayload & { pausado: boolean; tempoPausadoTotal?: number; ultimaPausaRecordada?: number | null; timestampDescansoFim?: number | null }) => void
  updateNotes: (notas: string) => void
  clearLocal: () => void
  restoreFromAutoClosed: (snapshot: AutoClosedSnapshot) => void
  heartbeat: () => void
  restoreFromHistory: (session: WorkoutSession) => void
}

const syncActiveToFirestore = (state: ActiveWorkoutStoreState) => {
  if (state.started && state.session?.userId && state.session) {
    syncWorkoutProgressToFirestore(state.session.userId, {
      sessao: state.session,
      exercicioAtualIndex: state.currentExerciseIndex,
      serieAtualIndex: state.currentSetIndex,
      cronometroGeralSegundos: state.totalTimerSeconds,
      iniciado: state.started,
      pausado: state.paused,
      tempoPausadoTotal: state.totalPausedTime,
      ultimaPausaRecordada: state.lastPauseRecorded,
      timestampDescansoFim: state.restEndTimestamp,
      updatedAt: Date.now(),
    } as ActiveWorkoutSyncPayload & { updatedAt: number })
  }
}

export const useActiveWorkoutStore = create<ActiveWorkoutStoreState>()(
  persist(
    (set, get) => {
      const mapPayloadToState = (d: {
        sessao: WorkoutSession
        exercicioAtualIndex?: number
        serieAtualIndex?: number
        cronometroGeralSegundos?: number
        pausado?: boolean
        tempoPausadoTotal?: number
        ultimaPausaRecordada?: number | null
        timestampDescansoFim?: number | null
      }) => ({
        session: d.sessao,
        currentExerciseIndex: d.exercicioAtualIndex ?? 0,
        currentSetIndex: d.serieAtualIndex ?? 0,
        totalTimerSeconds: d.cronometroGeralSegundos ?? 0,
        restTimerSeconds: 0,
        restTimerActive: (d.timestampDescansoFim != null && d.timestampDescansoFim > Date.now()) ?? false,
        paused: d.pausado ?? false,
        totalPausedTime: d.tempoPausadoTotal ?? 0,
        lastPauseRecorded: d.ultimaPausaRecordada ?? null,
        restEndTimestamp: d.timestampDescansoFim ?? null,
        started: true,
      })
      return {
        session: null,
        currentExerciseIndex: 0,
        currentSetIndex: 0,
        totalTimerSeconds: 0,
        restTimerSeconds: 0,
        restTimerActive: false,
        paused: false,
        started: false,
        totalPausedTime: 0,
        lastPauseRecorded: null,
        restEndTimestamp: null,
        lastSetCompleted: null,

        startWorkout: session => {
          set({
            session,
            currentExerciseIndex: 0,
            currentSetIndex: 0,
            totalTimerSeconds: 0,
            restTimerSeconds: 0,
            restTimerActive: false,
            paused: false,
            started: true,
            totalPausedTime: 0,
            lastPauseRecorded: null,
            restEndTimestamp: null,
            lastSetCompleted: null,
          })
          syncActiveToFirestore(get())
        },

        finishWorkout: () => {
          const { session, totalTimerSeconds } = get()
          if (!session) return null
          const userId = session.userId
          const finalizada: WorkoutSession = {
            ...session,
            finalizadoEm: Date.now(),
            duracaoSegundos: totalTimerSeconds,
            volumeTotal: calcularVolume(session),
          }
          set({
            session: null,
            started: false,
            currentExerciseIndex: 0,
            currentSetIndex: 0,
            totalTimerSeconds: 0,
            restTimerActive: false,
            totalPausedTime: 0,
            lastPauseRecorded: null,
            restEndTimestamp: null,
            lastSetCompleted: null,
          })
          if (userId) clearWorkoutProgressFromFirestore(userId)
          return finalizada
        },

        pauseWorkout: () => {
          set({ paused: true, lastPauseRecorded: Date.now() })
          syncActiveToFirestore(get())
        },
        resume: () => {
          set(s => {
            const recent = s.lastPauseRecorded ? Date.now() - s.lastPauseRecorded : 0
            return {
              paused: false,
              totalPausedTime: s.totalPausedTime + recent,
              lastPauseRecorded: null,
            }
          })
          syncActiveToFirestore(get())
        },

        nextExercise: () => {
          set(s => {
            const total = s.session?.exercicios.length ?? 0
            const next = Math.min(s.currentExerciseIndex + 1, total - 1)
            return { currentExerciseIndex: next, currentSetIndex: 0 }
          })
          syncActiveToFirestore(get())
        },

        previousExercise: () => {
          set(s => ({
            currentExerciseIndex: Math.max(0, s.currentExerciseIndex - 1),
            currentSetIndex: 0,
          }))
          syncActiveToFirestore(get())
        },

        updateSet: (exercicioIdx, serieIdx, dados) => {
          set(s => {
            if (!s.session) return {}
            const exercicios = s.session.exercicios.map((ex, eIdx) => {
              if (eIdx !== exercicioIdx) return ex
              return {
                ...ex,
                series: ex.series.map((serie, sIdx) => {
                  if (sIdx !== serieIdx) return serie
                  return { ...serie, ...dados }
                }),
              }
            })
            return { session: { ...s.session, exercicios } }
          })
          syncActiveToFirestore(get())
        },

        markSetCompleted: (exercicioIdx, serieIdx) => {
          set(s => {
            if (!s.session) return {}
            const exercicios = s.session.exercicios.map((ex, eIdx) => {
              if (eIdx !== exercicioIdx) return ex
              return {
                ...ex,
                series: ex.series.map((serie, sIdx) => {
                  if (sIdx !== serieIdx) return serie
                  return { ...serie, completada: true }
                }),
              }
            })
            return {
              session: { ...s.session, exercicios },
              lastSetCompleted: { exercicioIdx, serieIdx },
            }
          })
          syncActiveToFirestore(get())
        },

        undoLastSet: () => {
          const { lastSetCompleted } = get()
          if (!lastSetCompleted) return
          const { exercicioIdx, serieIdx } = lastSetCompleted
          set(s => {
            if (!s.session) return {}
            const exercicios = s.session.exercicios.map((ex, eIdx) => {
              if (eIdx !== exercicioIdx) return ex
              return {
                ...ex,
                series: ex.series.map((serie, sIdx) => {
                  if (sIdx !== serieIdx) return serie
                  return { ...serie, completada: false }
                }),
              }
            })
            return {
              session: { ...s.session, exercicios },
              lastSetCompleted: null,
              restTimerActive: false,
              restTimerSeconds: 0,
              restEndTimestamp: null,
            }
          })
          syncActiveToFirestore(get())
        },

        startRest: segundos => {
          set({
            restTimerSeconds: segundos,
            restTimerActive: true,
            restEndTimestamp: Date.now() + segundos * 1000,
          })
          syncActiveToFirestore(get())
        },

        stopRest: () => {
          set({
            restTimerActive: false,
            restTimerSeconds: 0,
            restEndTimestamp: null,
          })
          syncActiveToFirestore(get())
        },

        tickTotal: () =>
          set(s => {
            if (!s.started || !s.session) return {}

            const agora = Date.now()
            let acum = s.totalPausedTime

            if (s.paused && s.lastPauseRecorded) {
              acum += agora - s.lastPauseRecorded
            }

            const tempoAtivoMs = agora - s.session.iniciadoEm - acum
            const novosSegundos = Math.max(0, Math.floor(tempoAtivoMs / 1000))

            if (novosSegundos === s.totalTimerSeconds) return {}
            return { totalTimerSeconds: novosSegundos }
          }),

        tickRest: () =>
          set(s => {
            if (!s.restTimerActive || !s.restEndTimestamp) return {}
            const agora = Date.now()
            const restante = Math.ceil((s.restEndTimestamp - agora) / 1000)

            if (restante <= 0)
              return {
                restTimerSeconds: 0,
                restTimerActive: false,
                restEndTimestamp: null,
              }
            return { restTimerSeconds: restante }
          }),

        updateTotalTimer: segundos => set({ totalTimerSeconds: segundos }),

        restoreFromExternal: dados =>
          set({
            ...mapPayloadToState(dados),
          }),

        syncExternalState: dados =>
          set({
            ...mapPayloadToState(dados),
          }),

        updateNotes: notas => {
          set(s => {
            if (!s.session) return {}
            return { session: { ...s.session, notas } }
          })
          syncActiveToFirestore(get())
        },

        clearLocal: () =>
          set({
            session: null,
            started: false,
            currentExerciseIndex: 0,
            currentSetIndex: 0,
            totalTimerSeconds: 0,
            restTimerSeconds: 0,
            restTimerActive: false,
            totalPausedTime: 0,
            lastPauseRecorded: null,
            restEndTimestamp: null,
            lastSetCompleted: null,
          }),

        restoreFromAutoClosed: snapshot => {
          const tempoOciosoSegundos = Math.floor(INATIVIDADE_AUTO_ENCERRAR_MS / 1000)
          const cronometroAtivo = Math.max(0, snapshot.totalTimerSeconds - tempoOciosoSegundos)
          const sessaoAtiva = {
            ...snapshot.session,
            finalizadoEm: undefined,
            duracaoSegundos: undefined,
            tempoOciosoDescontadoSegundos: undefined,
            autoEncerrado: undefined,
          }
          set({
            session: sessaoAtiva,
            currentExerciseIndex: snapshot.currentExerciseIndex,
            currentSetIndex: snapshot.currentSetIndex,
            totalTimerSeconds: snapshot.totalTimerSeconds,
            restTimerSeconds: 0,
            restTimerActive: false,
            paused: false,
            totalPausedTime: 0,
            lastPauseRecorded: null,
            restEndTimestamp: null,
            lastSetCompleted: null,
            started: true,
          })
          syncActiveToFirestore(get())
        },

        heartbeat: () => {
          syncActiveToFirestore(get())
        },

        restoreFromHistory: session => {
          const duracaoSegundos = session.duracaoSegundos ?? 0
          const sessaoAtiva = {
            ...session,
            finalizadoEm: undefined,
            duracaoSegundos: undefined,
            autoEncerrado: undefined,
          }
          set({
            session: sessaoAtiva,
            currentExerciseIndex: 0,
            currentSetIndex: 0,
            totalTimerSeconds: duracaoSegundos,
            restTimerSeconds: 0,
            restTimerActive: false,
            paused: false,
            totalPausedTime: 0,
            lastPauseRecorded: null,
            restEndTimestamp: null,
            lastSetCompleted: null,
            started: true,
          })
          syncActiveToFirestore(get())
        },
      }
    },
    {
      name: 'training-treino-ativo',
      version: 1,
      partialize: s => ({
        session: s.session,
        currentExerciseIndex: s.currentExerciseIndex,
        currentSetIndex: s.currentSetIndex,
        totalTimerSeconds: s.totalTimerSeconds,
        started: s.started,
        paused: s.paused,
        totalPausedTime: s.totalPausedTime,
        lastPauseRecorded: s.lastPauseRecorded,
        restEndTimestamp: s.restEndTimestamp,
      }),
      migrate: (persisted: unknown, version: number) => {
        const raw = persisted as Record<string, unknown>
        if (!raw || version >= 1) return persisted as Partial<ActiveWorkoutStoreState>
        return {
          session: raw.sessao ?? raw.session ?? null,
          currentExerciseIndex: (raw.exercicioAtualIndex as number) ?? raw.currentExerciseIndex ?? 0,
          currentSetIndex: (raw.serieAtualIndex as number) ?? raw.currentSetIndex ?? 0,
          totalTimerSeconds: (raw.cronometroGeralSegundos as number) ?? raw.totalTimerSeconds ?? 0,
          started: (raw.iniciado as boolean) ?? raw.started ?? false,
          paused: (raw.pausado as boolean) ?? raw.paused ?? false,
          totalPausedTime: (raw.tempoPausadoTotal as number) ?? raw.totalPausedTime ?? 0,
          lastPauseRecorded: (raw.ultimaPausaRecordada as number | null) ?? raw.lastPauseRecorded ?? null,
          restEndTimestamp: (raw.timestampDescansoFim as number | null) ?? raw.restEndTimestamp ?? null,
        }
      },
    }
  )
)
