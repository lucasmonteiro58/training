import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useHistorico } from '../../hooks/useHistorico'
import { useHistoricoStore, useTreinoAtivoStore } from '../../stores'
import { formatarTempo } from '../../lib/notifications'
import { calcularRecordes } from '../../lib/records'
import { ArrowLeft, Clock, Dumbbell, TrendingUp, CheckCircle2, Circle, Edit2, Trophy, Save, RotateCcw } from 'lucide-react'
import { useState, useMemo } from 'react'
import type { SessaoDeTreino } from '../../types'
import { toast } from 'sonner'

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

  // Compute records from all sessions EXCEPT current one (to detect PRs in current)
  const recordesSemAtual = useMemo(() => {
    return calcularRecordes(allSessoes.filter(s => s.id !== sessaoId))
  }, [allSessoes, sessaoId])

  if (!sessao) {
    return (
      <div className="page-container pt-6 text-center">
        <p className="text-[var(--color-text-muted)]">Sessão não encontrada.</p>
        <Link to="/historico" className="text-[var(--color-accent)] text-sm mt-2 block" style={{ textDecoration: 'none' }}>Voltar</Link>
      </div>
    )
  }

  const displaySessao = editando && editData ? editData : sessao

  const data = new Date(displaySessao.iniciadoEm)
  const dataStr = data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const totalSeries = displaySessao.exercicios.reduce((s, ex) => s + ex.series.length, 0)
  const seriesOk = displaySessao.exercicios.reduce((s, ex) => s + ex.series.filter((sr) => sr.completada).length, 0)

  const iniciarEdicao = () => {
    setEditData(JSON.parse(JSON.stringify(sessao)))
    setEditando(true)
  }

  const salvarEdicao = async () => {
    if (!editData) return
    const volumeTotal = editData.exercicios.reduce((sum, ex) =>
      sum + ex.series.filter(s => s.completada).reduce((s, sr) => s + (sr.peso ?? 0) * (sr.repeticoes ?? 0), 0), 0
    )
    await salvarSessaoCompleta({ ...editData, volumeTotal })
    setEditando(false)
    setEditData(null)
    toast.success('Sessão atualizada!')
  }

  const updateSerie = (exIdx: number, sIdx: number, campo: Partial<{ peso: number; repeticoes: number; completada: boolean }>) => {
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

  return (
    <div className="page-container pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-fade-up">
        <button onClick={() => navigate({ to: '/historico' })}
          className="w-10 h-10 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-muted)]">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[var(--color-text)] truncate">{displaySessao.planoNome}</h1>
          <p className="text-xs text-[var(--color-text-muted)] capitalize mt-0.5">{dataStr}</p>
        </div>
        {editando ? (
          <div className="flex gap-2">
            <button onClick={() => { setEditando(false); setEditData(null) }} className="btn-ghost p-2.5 text-text-muted text-sm">Cancelar</button>
            <button onClick={salvarEdicao} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
              <Save size={14} /> Salvar
            </button>
          </div>
        ) : (
          <button onClick={iniciarEdicao} className="btn-ghost p-2.5">
            <Edit2 size={16} />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5 animate-fade-up" style={{ animationDelay: '50ms' }}>
        <div className="card p-3 text-center">
          <Clock size={16} className="text-[var(--color-accent)] mx-auto mb-1" />
          {editando && editData ? (
            <div className="flex flex-col gap-1">
              <input
                type="number"
                min={0}
                className="w-full text-lg font-bold text-[var(--color-text)] bg-[var(--color-surface-2)] rounded-lg px-2 py-1 text-center"
                value={editData.duracaoSegundos != null ? Math.round(editData.duracaoSegundos / 60) : ''}
                onChange={(e) => {
                  const min = e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0
                  updateDuracao(min * 60)
                }}
                onFocus={(e) => e.target.select()}
              />
              <span className="text-[10px] text-[var(--color-text-muted)]">min</span>
            </div>
          ) : (
            <p className="text-lg font-bold text-[var(--color-text)]">
              {displaySessao.duracaoSegundos ? formatarTempo(displaySessao.duracaoSegundos) : '–'}
            </p>
          )}
          <p className="text-[10px] text-[var(--color-text-muted)]">Duração</p>
        </div>
        <div className="card p-3 text-center">
          <Dumbbell size={16} className="text-[var(--color-accent)] mx-auto mb-1" />
          <p className="text-lg font-bold text-[var(--color-text)]">{displaySessao.exercicios.length}</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">Exercícios</p>
        </div>
        <div className="card p-3 text-center">
          <TrendingUp size={16} className="text-[var(--color-accent)] mx-auto mb-1" />
          <p className="text-lg font-bold text-[var(--color-text)]">
            {displaySessao.volumeTotal ? Math.round(displaySessao.volumeTotal) : '–'}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)]">Volume (kg)</p>
        </div>
      </div>

      {/* Progresso geral */}
      <div className="card p-4 mb-5 animate-fade-up" style={{ animationDelay: '100ms' }}>
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-semibold text-[var(--color-text-muted)]">SÉRIES COMPLETADAS</p>
          <p className="text-sm font-bold text-[var(--color-text)]">{seriesOk}/{totalSeries}</p>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${totalSeries ? (seriesOk / totalSeries) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Retornar como treino ativo */}
      <div className="mb-5 animate-fade-up" style={{ animationDelay: '110ms' }}>
        <button
          type="button"
          onClick={() => {
            restaurarDeHistorico(displaySessao)
            navigate({ to: '/treino-ativo/$planoId', params: { planoId: displaySessao.planoId } })
          }}
          className="w-full py-3 rounded-xl flex items-center justify-center gap-2 bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-semibold text-sm"
        >
          <RotateCcw size={16} /> Retornar como treino ativo
        </button>
      </div>

      {/* Notas do treino */}
      {displaySessao.notas && (
        <div className="card p-4 mb-5 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">📝 NOTAS</p>
          <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap">{displaySessao.notas}</p>
        </div>
      )}

      {/* Exercícios */}
      <div className="flex flex-col gap-3">
        {displaySessao.exercicios.map((ex, eIdx) => {
          // Detect PRs per series
          const seriesPRs = ex.series.map(s => {
            if (!s.completada || s.peso <= 0) return false
            const rec = recordesSemAtual.get(ex.exercicioId)
            if (!rec) return true // first time → PR
            return s.peso > rec.maiorPeso
          })

          return (
          <div key={`${ex.exercicioId}-${eIdx}`} className="card p-4 animate-fade-up" style={{ animationDelay: `${(eIdx + 3) * 40}ms` }}>
            <div className="flex items-center gap-3 mb-3">
              {ex.gifUrl ? (
                <img src={ex.gifUrl} alt={ex.exercicioNome}
                  className="w-12 h-12 rounded-xl object-contain bg-[var(--color-surface-2)] flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💪</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[var(--color-text)] font-bold text-sm truncate">{ex.exercicioNome}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{ex.grupoMuscular}</p>
              </div>
              {seriesPRs.some(Boolean) && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                  <Trophy size={10} /> PR
                </span>
              )}
            </div>

            {/* Tabela de séries */}
            <div className="grid grid-cols-[24px_1fr_1fr_24px] gap-2 px-1 mb-1">
              {['#', 'Peso (kg)', 'Reps', ''].map((h, i) => (
                <span key={i} className="text-[9px] text-[var(--color-text-subtle)] font-semibold text-center">{h}</span>
              ))}
            </div>
            {ex.series.map((s, sIdx) => (
              <div key={s.id} className={`grid grid-cols-[24px_1fr_1fr_24px] gap-2 px-1 py-1.5 rounded-lg ${s.completada ? 'bg-[rgba(34,197,94,0.06)]' : ''}`}>
                <span className="text-xs text-center text-[var(--color-text-subtle)] font-bold">{sIdx + 1}</span>
                {editando ? (
                  <>
                    <input
                      type="number"
                      className="set-input h-8! py-0! text-sm! text-center"
                      value={s.peso === 0 ? '' : s.peso}
                      onChange={e => updateSerie(eIdx, sIdx, { peso: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                      onFocus={e => e.target.select()}
                    />
                    <input
                      type="number"
                      className="set-input h-8! py-0! text-sm! text-center"
                      value={s.repeticoes === 0 ? '' : s.repeticoes}
                      onChange={e => updateSerie(eIdx, sIdx, { repeticoes: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                      onFocus={e => e.target.select()}
                    />
                  </>
                ) : (
                  <>
                    <span className="text-sm text-center text-[var(--color-text)] font-semibold">
                      {s.peso ? `${s.peso}kg` : '–'}
                    </span>
                    <span className="text-sm text-center text-[var(--color-text)] font-semibold">
                      {s.repeticoes || '–'}
                    </span>
                  </>
                )}
                <span className="flex items-center justify-center">
                  {editando ? (
                    <button
                      type="button"
                      onClick={() => updateSerie(eIdx, sIdx, { completada: !s.completada })}
                      className="p-0.5 rounded-full hover:bg-[var(--color-surface-2)] transition-colors"
                      title={s.completada ? 'Marcar como não concluída' : 'Marcar como concluída'}
                    >
                      {s.completada ? (
                        <CheckCircle2 size={15} className="text-[var(--color-success)]" />
                      ) : (
                        <Circle size={15} className="text-[var(--color-text-subtle)]" />
                      )}
                    </button>
                  ) : seriesPRs[sIdx] ? (
                    <Trophy size={15} className="text-yellow-400" />
                  ) : s.completada ? (
                    <CheckCircle2 size={15} className="text-[var(--color-success)]" />
                  ) : (
                    <Circle size={15} className="text-[var(--color-text-subtle)]" />
                  )}
                </span>
              </div>
            ))}
          </div>
          )
        })}
      </div>
    </div>
  )
}
