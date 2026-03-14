import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuthStore } from '../stores'
import { useHistorico } from '../hooks/useHistorico'
import { usePlanos } from '../hooks/usePlanos'
import { useTreinoAtivoStore } from '../stores'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { useConfigUsuario } from '../hooks/useConfigUsuario'
import { useHomeStats } from '../hooks/useHomeStats'
import { HomeHeader } from './index/components/-HomeHeader'
import { PullToRefreshIndicator } from './index/components/-PullToRefreshIndicator'
import { TreinoAtivoBanner } from './index/components/-TreinoAtivoBanner'
import { HomeStats } from './index/components/-HomeStats'
import { StreakMetaSection } from './index/components/-StreakMetaSection'
import { WeekDaysCard } from './index/components/-WeekDaysCard'
import { ProximoTreinoSection } from './index/components/-ProximoTreinoSection'
import { FrequenciaGruposCard } from './index/components/-FrequenciaGruposCard'
import { MeusPlanosSection } from './index/components/-MeusPlanosSection'
import { UltimosTreinosSection } from './index/components/-UltimosTreinosSection'
import { EditMetaModal } from './index/components/-EditMetaModal'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const DIAS_DA_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function HomePage() {
  const user = useAuthStore((s) => s.user)
  const { planosAtivos, loading, sincronizar: sincronizarPlanos } = usePlanos()
  const { sessoes, loading: loadingSessoes, sincronizar: sincronizarSessoes } =
    useHistorico()
  const [sincronizando, setSincronizando] = useState(false)
  const [showEditMeta, setShowEditMeta] = useState(false)
  const [metaInput, setMetaInput] = useState('4')

  const treinoAtivo = useTreinoAtivoStore((s) => s.iniciado)
  const sessaoAtiva = useTreinoAtivoStore((s) => s.sessao)
  const exercicioAtualIndex = useTreinoAtivoStore((s) => s.exercicioAtualIndex)
  const pausado = useTreinoAtivoStore((s) => s.pausado)
  const cronometroGeralSegundos = useTreinoAtivoStore(
    (s) => s.cronometroGeralSegundos
  )

  const { metaSemanal, diasOpcionais, handleSaveMeta } =
    useConfigUsuario(user)

  const {
    pullDistance,
    isRefreshing,
    containerRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    threshold: pullThreshold,
  } = usePullToRefresh(async () => {
    await Promise.all([sincronizarPlanos(), sincronizarSessoes()])
  })

  const stats = useHomeStats({
    sessoes,
    planosAtivos,
    metaSemanal,
    diasOpcionais,
    loading,
    loadingSessoes,
  })
  const {
    treinosSemana,
    volumeTotal,
    ultimasSessoes,
    carregando,
    streaks,
    proximoPlano,
    alertasGrupos,
    hoje,
    inicioSemana,
    ultimaSessao,
  } = stats

  const nome = user?.displayName?.split(' ')[0] ?? 'Atleta'
  const hora = new Date().getHours()
  const saudacao =
    hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const exercicioAtual = sessaoAtiva?.exercicios[exercicioAtualIndex]

  return (
    <div
      ref={containerRef}
      className="page-container pt-6 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        threshold={pullThreshold}
      />

      <HomeHeader
        saudacao={saudacao}
        nome={nome}
        onSync={async () => {
          setSincronizando(true)
          await Promise.all([sincronizarPlanos(), sincronizarSessoes()])
          setSincronizando(false)
        }}
        sincronizando={sincronizando}
      />

      {treinoAtivo && sessaoAtiva && (
        <TreinoAtivoBanner
          planoId={sessaoAtiva.planoId}
          pausado={pausado}
          cronometroGeralSegundos={cronometroGeralSegundos}
          exercicioAtualNome={exercicioAtual?.exercicioNome ?? null}
          planoNome={sessaoAtiva.planoNome}
        />
      )}

      {carregando ? (
        <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-up" style={{ animationDelay: '50ms' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-[88px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <HomeStats
          treinosSemana={treinosSemana}
          volumeTotal={volumeTotal}
          treinosTotal={sessoes.length}
        />
      )}

      {!carregando && sessoes.length > 0 && (
        <StreakMetaSection
          streakAtual={streaks.streakAtual}
          treinosEstaSemana={streaks.treinosEstaSemana}
          metaSemanal={streaks.metaSemanal}
          onEditMeta={() => {
            setMetaInput(String(metaSemanal))
            setShowEditMeta(true)
          }}
        />
      )}


      <WeekDaysCard
        diasDaSemana={DIAS_DA_SEMANA}
        inicioSemana={inicioSemana}
        hoje={hoje}
        sessoes={sessoes}
        diasOpcionais={diasOpcionais}
      />

      {!treinoAtivo && proximoPlano && (
        <ProximoTreinoSection
          proximoPlano={proximoPlano}
          ultimaSessao={ultimaSessao}
        />
      )}

      {!carregando && sessoes.length > 0 && (
        <FrequenciaGruposCard alertas={alertasGrupos} />
      )}

      <MeusPlanosSection planos={planosAtivos} carregando={carregando} />

      <UltimosTreinosSection
        sessoes={ultimasSessoes.map(s => ({
          id: s.id,
          planoNome: s.planoNome,
          iniciadoEm: s.iniciadoEm,
          duracaoSegundos: s.duracaoSegundos,
          volumeTotal: s.volumeTotal,
        }))}
        carregando={carregando}
      />

      {showEditMeta && (
        <EditMetaModal
          metaInput={metaInput}
          onMetaInputChange={setMetaInput}
          onSave={handleSaveMeta}
          onClose={() => setShowEditMeta(false)}
        />
      )}
    </div>
  )
}
