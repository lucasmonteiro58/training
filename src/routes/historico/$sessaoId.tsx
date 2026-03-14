import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useHistorico } from '../../hooks/useHistorico'
import { useHistoricoStore, useTreinoAtivoStore } from '../../stores'
import { calcularRecordes } from '../../lib/records'
import { useState, useMemo } from 'react'
import type { SessaoDeTreino } from '../../types'
import { toast } from 'sonner'
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
  const { sessoes, salvarSessaoCompleta } = useHistorico()
  const allSessoes = useHistoricoStore(s => s.sessoes)
  const sessao = sessoes.find((s) => s.id === sessaoId)
  const restaurarDeHistorico = useTreinoAtivoStore(s => s.restaurarDeHistorico)
  const [editando, setEditando] = useState(false)
  const [editData, setEditData] = useState<SessaoDeTreino | null>(null)

  const recordesSemAtual = useMemo(
    () => calcularRecordes(allSessoes.filter(s => s.id !== sessaoId)),
    [allSessoes, sessaoId]
  )

  if (!sessao) {
    return (
      <div className="page-container pt-6 text-center">
        <p className="text-text-muted">Sessão não encontrada.</p>
        <Link to="/historico" className="text-accent text-sm mt-2 block" style={{ textDecoration: 'none' }}>
          Voltar
        </Link>
      </div>
    )
  }

  const displaySessao = editando && editData ? editData : sessao
  const data = new Date(displaySessao.iniciadoEm)
  const dataStr = data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const totalSeries = displaySessao.exercicios.reduce((s, ex) => s + ex.series.length, 0)
  const seriesOk = displaySessao.exercicios.reduce(
    (s, ex) => s + ex.series.filter((sr) => sr.completada).length,
    0
  )

  const iniciarEdicao = () => {
    setEditData(JSON.parse(JSON.stringify(sessao)))
    setEditando(true)
  }

  const salvarEdicao = async () => {
    if (!editData) return
    const volumeTotal = editData.exercicios.reduce(
      (sum, ex) =>
        sum +
        ex.series
          .filter(s => s.completada)
          .reduce((s, sr) => s + (sr.peso ?? 0) * (sr.repeticoes ?? 0), 0),
      0
    )
    await salvarSessaoCompleta({ ...editData, volumeTotal })
    setEditando(false)
    setEditData(null)
    toast.success('Sessão atualizada!')
  }

  const updateSerie = (
    exIdx: number,
    sIdx: number,
    campo: Partial<{ peso: number; repeticoes: number; completada: boolean }>
  ) => {
    if (!editData) return
    const updated = { ...editData }
    updated.exercicios = updated.exercicios.map((ex, eI) => {
      if (eI !== exIdx) return ex
      return {
        ...ex,
        series: ex.series.map((s, sI) => (sI === sIdx ? { ...s, ...campo } : s)),
      }
    })
    setEditData(updated)
  }

  const updateDuracao = (duracaoSegundos: number) => {
    if (!editData) return
    setEditData({ ...editData, duracaoSegundos })
  }

  const updateIniciadoEm = (iniciadoEm: number) => {
    if (!editData) return
    setEditData({ ...editData, iniciadoEm })
  }

  return (
    <div className="page-container pt-4">
      <SessaoDetalheHeader
        planoNome={displaySessao.planoNome}
        dataStr={dataStr}
        editando={editando}
        autoEncerrado={displaySessao.autoEncerrado}
        iniciadoEm={editando && editData ? editData.iniciadoEm : undefined}
        onIniciadoEmChange={editando ? updateIniciadoEm : undefined}
        onVoltar={() => navigate({ to: '/historico' })}
        onIniciarEdicao={iniciarEdicao}
        onCancelarEdicao={() => {
          setEditando(false)
          setEditData(null)
        }}
        onSalvarEdicao={salvarEdicao}
      />

      <SessaoStats
        duracaoSegundos={displaySessao.duracaoSegundos}
        numExercicios={displaySessao.exercicios.length}
        volumeTotal={displaySessao.volumeTotal}
        editando={editando}
        duracaoMinutos={
          editData?.duracaoSegundos != null ? Math.round(editData.duracaoSegundos / 60) : undefined
        }
        onDuracaoChange={editando ? updateDuracao : undefined}
        tempoOciosoDescontadoSegundos={displaySessao.tempoOciosoDescontadoSegundos}
      />

      <ProgressoSeries seriesOk={seriesOk} totalSeries={totalSeries} />

      <BotaoRetornarTreino
        onClick={() => {
          restaurarDeHistorico(displaySessao)
          navigate({ to: '/treino-ativo/$planoId', params: { planoId: displaySessao.planoId } })
        }}
      />

      {displaySessao.notas && <NotasTreino notas={displaySessao.notas} />}

      <div className="flex flex-col gap-3">
        {displaySessao.exercicios.map((ex, eIdx) => (
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
