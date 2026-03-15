import { useEffect } from 'react'
import { useActiveWorkoutStore, useHistoryStore } from '../stores'
import { INATIVIDADE_AUTO_ENCERRAR_MS, calcularVolume } from '../stores'
import {
  subscribeToWorkoutProgress,
  clearWorkoutProgressFromFirestore,
} from '../lib/firestore/sync'
import { useHistory } from './useHistory'
import type { WorkoutSession } from '../types'

export function useWorkoutProgressSync(user: { uid: string } | null) {
  const { saveSessionComplete } = useHistory()
  const setAutoClosedSnapshot = useHistoryStore(
    (s) => s.setAutoClosedSnapshot
  )

  useEffect(() => {
    if (!user) return

    const unsub = subscribeToWorkoutProgress(user.uid, (data) => {
      const state = useActiveWorkoutStore.getState()
      const historyState = useHistoryStore.getState()

      // Doc deletado (ex.: Cloud Function encerrou por inatividade): tratar como encerrado e mostrar modal
      if (data === null && state.started && state.session) {
        const idleTimeSeconds = Math.floor(
          INATIVIDADE_AUTO_ENCERRAR_MS / 1000
        )
        const finishedSession: WorkoutSession = {
          ...state.session,
          finishedAt: Date.now(),
          durationSeconds: Math.max(
            0,
            state.totalTimerSeconds - idleTimeSeconds
          ),
          idleSecondsDeducted: idleTimeSeconds,
          totalVolume: calcularVolume(state.session),
          autoClosed: true,
        }
        saveSessionComplete(finishedSession).then(() => {
          state.clearLocal()
          setAutoClosedSnapshot({
            session: finishedSession,
            currentExerciseIndex: state.currentExerciseIndex,
            currentSetIndex: state.currentSetIndex,
            totalTimerSeconds: state.totalTimerSeconds,
          })
        })
        return
      }

      // Não limpar quando data é null: o doc pode ainda não existir (write em progresso ao iniciar treino)
      const isActive = data && (data.started === true || data.iniciado === true)
      if (!isActive) {
        if (data != null && state.started) state.clearLocal()
        return
      }

      const updatedAt = (data as { updatedAt?: number }).updatedAt
      const session = ((data as { session?: WorkoutSession; sessao?: WorkoutSession }).session ?? (data as { sessao?: WorkoutSession }).sessao) as WorkoutSession | undefined
      const rawTimerSeconds =
        (data as { totalTimerSeconds?: number; cronometroGeralSegundos?: number }).totalTimerSeconds ??
        (data as { cronometroGeralSegundos?: number }).cronometroGeralSegundos ?? 0
      const currentIdx = (data as { currentExerciseIndex?: number; exercicioAtualIndex?: number }).currentExerciseIndex ?? (data as { exercicioAtualIndex?: number }).exercicioAtualIndex ?? 0
      const setIdx = (data as { currentSetIndex?: number; serieAtualIndex?: number }).currentSetIndex ?? (data as { serieAtualIndex?: number }).serieAtualIndex ?? 0

      if (
        updatedAt &&
        Date.now() - updatedAt > INATIVIDADE_AUTO_ENCERRAR_MS
      ) {
        if (historyState.autoClosedSnapshot?.session.id === session?.id) return
        if (!session) return
        const idleTimeSeconds = Math.floor(
          INATIVIDADE_AUTO_ENCERRAR_MS / 1000
        )
        const finishedSession: WorkoutSession = {
          ...session,
          finishedAt: Date.now(),
          durationSeconds: Math.max(
            0,
            rawTimerSeconds - idleTimeSeconds
          ),
          idleSecondsDeducted: idleTimeSeconds,
          totalVolume: calcularVolume(session),
          autoClosed: true,
        }
        saveSessionComplete(finishedSession).then(() => {
          clearWorkoutProgressFromFirestore(user.uid)
          state.clearLocal()
          setAutoClosedSnapshot({
            session: finishedSession,
            currentExerciseIndex: currentIdx,
            currentSetIndex: setIdx,
            totalTimerSeconds: rawTimerSeconds,
          })
        })
        return
      }

      // Só restaura do Firestore quando não temos sessão local (ex.: abriu em outra aba).
      // Não restaurar se a sessão vinda do Firestore tiver exercícios sem séries (0/0),
      // para não sobrescrever e deixar useStartWorkoutSession criar a sessão a partir do plano.
      if (!state.started) {
        const session = (data as { session?: { exercises?: { sets?: unknown[] }[] } }).session ?? (data as { sessao?: { exercises?: { sets?: unknown[] }[] } }).sessao
        const hasValidSets = session?.exercises?.length && session.exercises.every((ex) => (ex.sets?.length ?? 0) > 0)
        if (hasValidSets) {
          state.restoreFromExternal(data as Parameters<typeof state.restoreFromExternal>[0])
        }
      }
    })

    return unsub
  }, [user, saveSessionComplete, setAutoClosedSnapshot])
}
