import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useHistory } from '../../hooks/useHistory'
import { useHistoryStore, useActiveWorkoutStore } from '../../stores'
import { calcularRecordes } from '../../lib/records'
import { useSessionEdit } from '../../hooks/useSessionEdit'
import { useMemo } from 'react'
import { SessionDetailHeader } from './components/-SessionDetailHeader'
import { SessionStats } from './components/-SessionStats'
import { SetsProgress } from './components/-SetsProgress'
import { ReturnToWorkoutButton } from './components/-ReturnToWorkoutButton'
import { WorkoutNotes } from './components/-WorkoutNotes'
import { ExerciseSessionCard } from './components/-ExerciseSessionCard'

export const Route = createFileRoute('/history/$sessionId')({
  component: SessaoDetalhePage,
})

function SessaoDetalhePage() {
  const { sessionId } = Route.useParams()
  const navigate = useNavigate()
  const { sessoes, salvarSessaoCompleta } = useHistory()
  const allSessoes = useHistoryStore((s) => s.sessoes)
  const sessao = sessoes.find((s) => s.id === sessionId)
  const restaurarDeHistorico = useActiveWorkoutStore(
    (s) => s.restaurarDeHistorico
  )

  const edicao = useSessionEdit(sessao, salvarSessaoCompleta)
  const {
    editando,
    editData,
    displaySessao,
    iniciarEdicao,
    salvarEdicao,
    cancelarEdicao,
    updateSerie,
    updateDuracao,
    updateIniciadoEm,
  } = edicao

  const recordesSemAtual = useMemo(
    () => calcularRecordes(allSessoes.filter((s) => s.id !== sessionId)),
    [allSessoes, sessionId]
  )

  if (!sessao) {
    return (
      <div className="page-container pt-6 text-center">
        <p className="text-text-muted">Sessão não encontrada.</p>
        <Link
          to="/history"
          className="text-accent text-sm mt-2 block"
          style={{ textDecoration: 'none' }}
        >
          Voltar
        </Link>
      </div>
    )
  }

  const data = new Date(displaySessao!.iniciadoEm)
  const dataStr = data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const totalSeries = displaySessao!.exercicios.reduce(
    (s, ex) => s + ex.series.length,
    0
  )
  const seriesOk = displaySessao!.exercicios.reduce(
    (s, ex) => s + ex.series.filter((sr) => sr.completada).length,
    0
  )

  return (
    <div className="page-container pt-4">
      <SessionDetailHeader
        planoNome={displaySessao!.planoNome}
        dataStr={dataStr}
        editando={editando}
        autoEncerrado={displaySessao!.autoEncerrado}
        iniciadoEm={
          editando && editData ? editData.iniciadoEm : displaySessao!.iniciadoEm
        }
        finalizadoEm={displaySessao!.finalizadoEm}
        onIniciadoEmChange={editando ? updateIniciadoEm : undefined}
        onVoltar={() => navigate({ to: '/history' })}
        onIniciarEdicao={iniciarEdicao}
        onCancelarEdicao={cancelarEdicao}
        onSalvarEdicao={salvarEdicao}
      />

      <SessionStats
        duracaoSegundos={displaySessao!.duracaoSegundos}
        numExercicios={displaySessao!.exercicios.length}
        volumeTotal={displaySessao!.volumeTotal}
        editando={editando}
        duracaoMinutos={
          editData?.duracaoSegundos != null
            ? Math.round(editData.duracaoSegundos / 60)
            : undefined
        }
        onDuracaoChange={editando ? updateDuracao : undefined}
        tempoOciosoDescontadoSegundos={
          displaySessao!.tempoOciosoDescontadoSegundos
        }
      />

      <SetsProgress seriesOk={seriesOk} totalSeries={totalSeries} />

      <ReturnToWorkoutButton
        onClick={() => {
          restaurarDeHistorico(displaySessao!)
          navigate({
            to: '/active-workout/$planId',
            params: { planId: displaySessao!.planoId },
          })
        }}
      />

      {displaySessao!.notas && (
        <WorkoutNotes notas={displaySessao!.notas} />
      )}

      <div className="flex flex-col gap-3">
        {displaySessao!.exercicios.map((ex, eIdx) => (
          <ExerciseSessionCard
            key={`${ex.exercicioId}-${eIdx}`}
            ex={ex}
            exIdx={eIdx}
            editando={editando}
            recordesSemAtual={recordesSemAtual}
            onUpdateSerie={updateSerie}
          />
        ))}
      </div>
    </div>
  )
}
