import { useEffect } from 'react'
import { useActiveWorkoutStore, useHistoryStore } from '../stores'
import { INATIVIDADE_AUTO_ENCERRAR_MS, calcularVolume } from '../stores'
import {
  subscribeToWorkoutProgress,
  clearWorkoutProgressFromFirestore,
} from '../lib/firestore/sync'
import { useHistory } from './useHistory'

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

      // Não limpar quando data é null: o doc pode ainda não existir (write em progresso ao iniciar treino)
      const isActive = data && (data.started === true || data.iniciado === true)
      if (!isActive) {
        if (data != null && state.started) state.clearLocal()
        return
      }

      const updatedAt = (data as { updatedAt?: number }).updatedAt
      if (
        updatedAt &&
        Date.now() - updatedAt > INATIVIDADE_AUTO_ENCERRAR_MS
      ) {
        if (
          historyState.autoClosedSnapshot?.session.id === data.sessao?.id
        )
          return
        const session = data.sessao
        if (!session) return
        const rawTimerSeconds =
          (data as { cronometroGeralSegundos?: number })
            .cronometroGeralSegundos ?? 0
        const idleTimeSeconds = Math.floor(
          INATIVIDADE_AUTO_ENCERRAR_MS / 1000
        )
        const finishedSession = {
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
            currentExerciseIndex: data.exercicioAtualIndex ?? 0,
            currentSetIndex: data.serieAtualIndex ?? 0,
            totalTimerSeconds:
              (data as { cronometroGeralSegundos?: number })
                .cronometroGeralSegundos ?? 0,
          })
        })
        return
      }

      if (!state.started) {
        state.restoreFromExternal(data as Parameters<typeof state.restoreFromExternal>[0])
        return
      }

      state.syncExternalState(data as Parameters<typeof state.syncExternalState>[0])
    })

    return unsub
  }, [user, saveSessionComplete, setAutoClosedSnapshot])
}
