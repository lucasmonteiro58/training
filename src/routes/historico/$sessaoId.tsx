import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useHistory } from '../../hooks/useHistorico'
import { useHistoryStore, useActiveWorkoutStore } from '../../stores'
import { calcularRecordes } from '../../lib/records'
import { useSessionEdit } from '../../hooks/useEdicaoSessao'
import { useMemo } from 'react'
import { SessaoDetalheHeader } from './components/-SessaoDetalheHeader'
import { SessaoStats } from './components/-SessaoStats'
import { ProgressoSeries } from './components/-ProgressoSeries'
import { BotaoRetornarTreino } from './components/-BotaoRetornarTreino'
import { NotasTreino } from './components/-NotasTreino'
import { ExercicioSessaoCard } from './components/-ExercicioSessaoCard'

export const Route = createFileRoute('/historico/$sessaoId')({
  component: SessaoDetalhePage,
})

function SessaoDetalhePage() {
  const { sessaoId } = Route.useParams()
  const navigate = useNavigate()
  const { sessoes, salvarSessaoCompleta } = useHistory()
  const allSessoes = useHistoryStore((s) => s.sessoes)
  const sessao = sessoes.find((s) => s.id === sessaoId)
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
    () => calcularRecordes(allSessoes.filter((s) => s.id !== sessaoId)),
    [allSessoes, sessaoId]
  )

  if (!sessao) {
    return (
      <div className="page-container pt-6 text-center">
        <p className="text-text-muted">Sessão não encontrada.</p>
        <Link
          to="/historico"
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
      <SessaoDetalheHeader
        planoNome={displaySessao!.planoNome}
        dataStr={dataStr}
        editando={editando}
        autoEncerrado={displaySessao!.autoEncerrado}
        iniciadoEm={
          editando && editData ? editData.iniciadoEm : displaySessao!.iniciadoEm
        }
        finalizadoEm={displaySessao!.finalizadoEm}
        onIniciadoEmChange={editando ? updateIniciadoEm : undefined}
        onVoltar={() => navigate({ to: '/historico' })}
        onIniciarEdicao={iniciarEdicao}
        onCancelarEdicao={cancelarEdicao}
        onSalvarEdicao={salvarEdicao}
      />

      <SessaoStats
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

      <ProgressoSeries seriesOk={seriesOk} totalSeries={totalSeries} />

      <BotaoRetornarTreino
        onClick={() => {
          restaurarDeHistorico(displaySessao!)
          navigate({
            to: '/treino-ativo/$planoId',
            params: { planoId: displaySessao!.planoId },
          })
        }}
      />

      {displaySessao!.notas && (
        <NotasTreino notas={displaySessao!.notas} />
      )}

      <div className="flex flex-col gap-3">
        {displaySessao!.exercicios.map((ex, eIdx) => (
          <ExercicioSessaoCard
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
