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

    const unsub = subscribeToWorkoutProgress(user.uid, (dados) => {
      const state = useActiveWorkoutStore.getState()
      const historicoState = useHistoryStore.getState()

      if (!dados || !dados.iniciado) {
        if (state.started) state.clearLocal()
        return
      }

      const updatedAt = (dados as { updatedAt?: number }).updatedAt
      if (
        updatedAt &&
        Date.now() - updatedAt > INATIVIDADE_AUTO_ENCERRAR_MS
      ) {
        if (
          historicoState.autoClosedSnapshot?.session.id === dados.sessao?.id
        )
          return
        const sessao = dados.sessao
        if (!sessao) return
        const cronometroBruto =
          (dados as { cronometroGeralSegundos?: number })
            .cronometroGeralSegundos ?? 0
        const tempoOciosoSegundos = Math.floor(
          INATIVIDADE_AUTO_ENCERRAR_MS / 1000
        )
        const finalizada = {
          ...sessao,
          finalizadoEm: Date.now(),
          duracaoSegundos: Math.max(
            0,
            cronometroBruto - tempoOciosoSegundos
          ),
          tempoOciosoDescontadoSegundos: tempoOciosoSegundos,
          volumeTotal: calcularVolume(sessao),
          autoEncerrado: true,
        }
        saveSessionComplete(finalizada).then(() => {
          clearWorkoutProgressFromFirestore(user.uid)
          state.clearLocal()
          setAutoClosedSnapshot({
            session: finalizada,
            currentExerciseIndex: dados.exercicioAtualIndex ?? 0,
            currentSetIndex: dados.serieAtualIndex ?? 0,
            totalTimerSeconds:
              (dados as { cronometroGeralSegundos?: number })
                .cronometroGeralSegundos ?? 0,
          })
        })
        return
      }

      if (!state.started) {
        state.restoreFromExternal(dados as Parameters<typeof state.restoreFromExternal>[0])
        return
      }

      state.syncExternalState(dados as Parameters<typeof state.syncExternalState>[0])
    })

    return unsub
  }, [user, saveSessionComplete, setAutoClosedSnapshot])
}
