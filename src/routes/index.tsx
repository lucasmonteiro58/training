import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { useAuthStore } from '../stores'
import { useHistorico } from '../hooks/useHistorico'
import { usePlanos } from '../hooks/usePlanos'
import { useTreinoAtivoStore } from '../stores'
import { getConfigUsuario, salvarConfigUsuario } from '../lib/firestore/sync'
import { calcularStreaks } from '../lib/streaks'
import { CORES_GRUPO } from '../types'
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
import { toast } from 'sonner'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const PULL_THRESHOLD = 80
const DIAS_DA_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function HomePage() {
  const user = useAuthStore(s => s.user)
  const { planosAtivos, loading, sincronizar: sincronizarPlanos } = usePlanos()
  const { sessoes, loading: loadingSessoes, sincronizar: sincronizarSessoes } = useHistorico()
  const [sincronizando, setSincronizando] = useState(false)
  const treinoAtivo = useTreinoAtivoStore(s => s.iniciado)
  const sessaoAtiva = useTreinoAtivoStore(s => s.sessao)
  const exercicioAtualIndex = useTreinoAtivoStore(s => s.exercicioAtualIndex)
  const pausado = useTreinoAtivoStore(s => s.pausado)
  const cronometroGeralSegundos = useTreinoAtivoStore(s => s.cronometroGeralSegundos)
  const [metaSemanal, setMetaSemanal] = useState(() => {
    const saved = localStorage.getItem('metaSemanal')
    return saved ? parseInt(saved, 10) : 4
  })
  const [showEditMeta, setShowEditMeta] = useState(false)
  const [metaInput, setMetaInput] = useState('4')

  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const touchStartY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const [diasOpcionais, setDiasOpcionais] = useState<number[]>(() => {
    try {
      const v = localStorage.getItem('diasOpcionais')
      if (!v) return []
      const arr = JSON.parse(v) as unknown
      return Array.isArray(arr) ? arr.filter((n): n is number => typeof n === 'number' && n >= 0 && n <= 6) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (!user) return
    getConfigUsuario(user.uid).then(config => {
      if (config.metaSemanal != null) {
        setMetaSemanal(config.metaSemanal)
        localStorage.setItem('metaSemanal', String(config.metaSemanal))
      }
      if (config.diasOpcionais && Array.isArray(config.diasOpcionais)) {
        setDiasOpcionais(config.diasOpcionais)
        localStorage.setItem('diasOpcionais', JSON.stringify(config.diasOpcionais))
      }
    })
  }, [user])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY
    } else {
      touchStartY.current = 0
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === 0 || isRefreshing) return
    const diff = e.touches[0].clientY - touchStartY.current
    if (diff > 0) setPullDistance(Math.min(diff * 0.5, 120))
  }, [isRefreshing])

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(PULL_THRESHOLD)
      await Promise.all([sincronizarPlanos(), sincronizarSessoes()])
      setIsRefreshing(false)
    }
    setPullDistance(0)
    touchStartY.current = 0
  }, [pullDistance, isRefreshing, sincronizarPlanos, sincronizarSessoes])

  const nome = user?.displayName?.split(' ')[0] ?? 'Atleta'
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  const hoje = new Date()
  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() - hoje.getDay())
  inicioSemana.setHours(0, 0, 0, 0)

  const treinosSemana = sessoes.filter(s => s.iniciadoEm >= inicioSemana.getTime()).length
  const volumeTotal = sessoes.reduce((acc, s) => acc + (s.volumeTotal ?? 0), 0)
  const ultimasSessoes = sessoes.slice(0, 3)
  const carregando = loading || loadingSessoes
  const streaks = useMemo(
    () => calcularStreaks(sessoes, metaSemanal, diasOpcionais),
    [sessoes, metaSemanal, diasOpcionais]
  )

  const exercicioAtual = sessaoAtiva?.exercicios[exercicioAtualIndex]
  const ultimaSessao = sessoes[0]
  const proximoPlano = useMemo(() => {
    if (!planosAtivos.length) return null
    if (!ultimaSessao) return planosAtivos[0]
    const idx = planosAtivos.findIndex(p => p.id === ultimaSessao.planoId)
    if (idx === -1) return planosAtivos[0]
    return planosAtivos[(idx + 1) % planosAtivos.length]
  }, [planosAtivos, ultimaSessao])

  const alertasGrupos = useMemo(() => {
    const agora = Date.now()
    const grupoMap: Record<string, number> = {}
    sessoes.forEach(s => {
      if (!s.finalizadoEm) return
      s.exercicios.forEach(ex => {
        const g = ex.grupoMuscular
        if (!g || g === 'Outro' || g === 'Corpo Inteiro' || g === 'Cardio') return
        const last = grupoMap[g]
        if (!last || s.finalizadoEm! > last) grupoMap[g] = s.finalizadoEm!
      })
    })
    return Object.entries(grupoMap)
      .map(([grupo, ultimo]) => ({
        grupo,
        dias: Math.floor((agora - ultimo) / 86400000),
        cor: CORES_GRUPO[grupo] ?? '#6366f1',
      }))
      .filter(a => a.dias >= 7)
      .sort((a, b) => b.dias - a.dias)
      .slice(0, 4)
  }, [sessoes])

  const handleSaveMeta = useCallback(
    (valor: number) => {
      setMetaSemanal(valor)
      localStorage.setItem('metaSemanal', String(valor))
      if (user) salvarConfigUsuario(user.uid, { metaSemanal: valor })
      toast.success(`Meta atualizada para ${valor}x por semana`)
    },
    [user]
  )

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
        threshold={PULL_THRESHOLD}
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
