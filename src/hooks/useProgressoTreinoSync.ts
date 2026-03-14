import { useEffect } from 'react'
import { useTreinoAtivoStore, useHistoricoStore } from '../stores'
import { INATIVIDADE_AUTO_ENCERRAR_MS, calcularVolume } from '../stores'
import {
  subscribeToProgressoTreino,
  limparProgressoTreinoFirestore,
} from '../lib/firestore/sync'
import { useHistorico } from './useHistorico'

export function useProgressoTreinoSync(user: { uid: string } | null) {
  const { salvarSessaoCompleta } = useHistorico()
  const setSessaoAutoEncerrada = useHistoricoStore(
    (s) => s.setSessaoAutoEncerrada
  )

  useEffect(() => {
    if (!user) return

    const unsub = subscribeToProgressoTreino(user.uid, (dados) => {
      const state = useTreinoAtivoStore.getState()
      const historicoState = useHistoricoStore.getState()

      if (!dados || !dados.iniciado) {
        if (state.iniciado) state.limparLocal()
        return
      }

      const updatedAt = (dados as { updatedAt?: number }).updatedAt
      if (
        updatedAt &&
        Date.now() - updatedAt > INATIVIDADE_AUTO_ENCERRAR_MS
      ) {
        if (
          historicoState.sessaoAutoEncerrada?.sessao.id === dados.sessao?.id
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
        salvarSessaoCompleta(finalizada).then(() => {
          limparProgressoTreinoFirestore(user.uid)
          state.limparLocal()
          setSessaoAutoEncerrada({
            sessao: finalizada,
            exercicioAtualIndex: dados.exercicioAtualIndex ?? 0,
            serieAtualIndex: dados.serieAtualIndex ?? 0,
            cronometroGeralSegundos:
              (dados as { cronometroGeralSegundos?: number })
                .cronometroGeralSegundos ?? 0,
          })
        })
        return
      }

      if (!state.iniciado) {
        state.restaurarDeExterno(dados)
        return
      }

      state.sincronizarEstadoExterno(dados)
    })

    return unsub
  }, [user, salvarSessaoCompleta, setSessaoAutoEncerrada])
}
