import { createFileRoute, useNavigate, Link, useBlocker } from '@tanstack/react-router'
import { useState } from 'react'
import { usePlanos } from '../../hooks/usePlanos'
import { useEdicaoPlano } from '../../hooks/useEdicaoPlano'
import { ArrowLeft, Dumbbell, Play, Edit2, Plus, Clock, Trash2, XCircle, Copy, Link2 } from 'lucide-react'
import type { TipoAgrupamento } from '../../types'
import { AGRUPAMENTO_CONFIG } from '../../types'
import { ExercicioPicker } from '../../components/common/ExercicioPicker'
import { ExercicioDetalheCard } from './components/-ExercicioDetalheCard'
import { toast } from 'sonner'
import { useIniciarTreino } from '../../hooks/useIniciarTreino'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

export const Route = createFileRoute('/treinos/$planoId')({
  component: PlanoDetalheComponent,
})

function PlanoDetalheComponent() {
  const { planoId } = Route.useParams()
  const navigate = useNavigate()
  const { planos, atualizarPlano, excluirPlano, clonarPlano } = usePlanos()
  const plano = planos.find((p) => p.id === planoId)
  const [showPicker, setShowPicker] = useState(false)
  const { handleIniciar, modal: modalInicio } = useIniciarTreino()

  const edicao = useEdicaoPlano(plano, atualizarPlano)
  const {
    editando,
    nome,
    setNome,
    exerciciosEdit,
    expandedEx,
    selecionados,
    showGroupMenu,
    setShowGroupMenu,
    setSelecionados,
    sensors,
    salvarEdicao,
    iniciarEdicao,
    adicionarEx,
    removerEx,
    atualizarSerieEdit,
    atualizarExercicioEdit,
    atualizarDescansoEdit,
    atualizarTipoSerieEdit,
    handleDragEnd,
    toggleExpandedEx,
    criarAgrupamento,
    removerDoAgrupamento,
    toggleSelecionado,
  } = edicao

  const { status: blockerStatus, proceed: blockerProceed, reset: blockerReset } = useBlocker({
    shouldBlockFn: () => editando,
    withResolver: true,
  })

  if (!plano) {
    return (
      <div className="page-container pt-6 text-center">
        <p className="text-text-muted">Plano não encontrado.</p>
        <Link to="/treinos" className="text-accent text-sm mt-2 block">Voltar</Link>
      </div>
    )
  }

  return (
    <>
      <div className="page-container pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-fade-up">
          <button onClick={() => navigate({ to: '/treinos' })}
            className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-muted">
            <ArrowLeft size={18} />
          </button>
          {editando ? (
            <input className="input flex-1 text-lg font-bold py-2" value={nome} onChange={(e) => setNome(e.target.value)} />
          ) : (
            <h1 className="text-xl font-bold text-text flex-1">{plano.nome}</h1>
          )}
          {editando ? (
            <button onClick={salvarEdicao} className="btn-primary py-2 px-4 text-sm">Salvar</button>
          ) : (
            <button onClick={iniciarEdicao}
              className="btn-ghost p-2.5">
              <Edit2 size={16} />
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-6 animate-fade-up" style={{ animationDelay: '50ms' }}>
          {[
            { label: 'Exercícios', value: plano.exercicios.length, icon: Dumbbell },
            { label: 'Séries tot.', value: plano.exercicios.reduce((s, e) => s + e.series, 0), icon: null },
            { label: 'Descanso', value: `${plano.exercicios[0]?.descansoSegundos ?? '-'}s`, icon: Clock },
          ].map((stat, i) => (
            <div key={i} className="card p-3 text-center">
              <p className="text-lg font-bold text-text">{stat.value}</p>
              <p className="text-[10px] text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Start button */}
        <button
          className="btn-primary w-full mb-6 py-4 text-base animate-fade-up"
          style={{ animationDelay: '100ms' }}
          onClick={() => handleIniciar(planoId)}
        >
          <Play size={20} />
          Iniciar Treino
        </button>
        {modalInicio}

        {/* Exercises list */}
        <div className="animate-fade-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-text">
              EXERCÍCIOS
            </h2>
            {editando && exerciciosEdit.length >= 2 && (
              <div className="flex items-center gap-2">
                {selecionados.size >= 2 && (
                  <button
                    onClick={() => setShowGroupMenu(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-lg"
                  >
                    <Link2 size={12} />
                    Agrupar ({selecionados.size})
                  </button>
                )}
                {selecionados.size > 0 && (
                  <button
                    onClick={() => setSelecionados(new Set())}
                    className="text-xs text-text-muted"
                  >
                    Limpar
                  </button>
                )}
              </div>
            )}
          </div>

          {editando ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={exerciciosEdit.map((ex) => ex.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {(() => {
                    const rendered = new Set<string>()
                    return exerciciosEdit.map((ex) => {
                      if (ex.agrupamentoId && !rendered.has(ex.agrupamentoId)) {
                        rendered.add(ex.agrupamentoId)
                        const groupExs = exerciciosEdit.filter(e => e.agrupamentoId === ex.agrupamentoId)
                        const config = AGRUPAMENTO_CONFIG[ex.tipoAgrupamento ?? 'superset']
                        return (
                          <div key={`group-${ex.agrupamentoId}`} className="rounded-2xl border-l-4 pl-1" style={{ borderColor: config.cor }}>
                            <div className="flex items-center justify-between px-2 py-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: config.cor }}>
                                {config.label} ({groupExs.length})
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              {groupExs.map(gex => (
                                <ExercicioDetalheCard
                                  key={gex.id}
                                  ex={gex}
                                  editando
                                  isExpanded={expandedEx.has(gex.id)}
                                  onToggleExpand={() => toggleExpandedEx(gex.id)}
                                  onRemove={() => removerEx(gex.id)}
                                  onUpdateSerie={(sIdx, campo) => atualizarSerieEdit(gex.id, sIdx, campo)}
                                  onUpdateDescanso={(s) => atualizarDescansoEdit(gex.id, s)}
                                  onUpdateTipoSerie={(tipo) => atualizarTipoSerieEdit(gex.id, tipo)}
                                  onUpdateExercicio={(campos) => atualizarExercicioEdit(gex.id, campos)}
                                  showSelect
                                  isSelected={selecionados.has(gex.id)}
                                  onToggleSelect={() => toggleSelecionado(gex.id)}
                                  onRemoveFromGroup={() => removerDoAgrupamento(gex.id)}
                                />
                              ))}
                            </div>
                          </div>
                        )
                      }
                      if (ex.agrupamentoId && rendered.has(ex.agrupamentoId)) return null
                      return (
                        <ExercicioDetalheCard
                          key={ex.id}
                          ex={ex}
                          editando
                          isExpanded={expandedEx.has(ex.id)}
                          onToggleExpand={() => toggleExpandedEx(ex.id)}
                          onRemove={() => removerEx(ex.id)}
                          onUpdateSerie={(sIdx, campo) => atualizarSerieEdit(ex.id, sIdx, campo)}
                          onUpdateDescanso={(s) => atualizarDescansoEdit(ex.id, s)}
                          onUpdateTipoSerie={(tipo) => atualizarTipoSerieEdit(ex.id, tipo)}
                          onUpdateExercicio={(campos) => atualizarExercicioEdit(ex.id, campos)}
                          showSelect={exerciciosEdit.length >= 2}
                          isSelected={selecionados.has(ex.id)}
                          onToggleSelect={() => toggleSelecionado(ex.id)}
                        />
                      )
                    })
                  })()}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="flex flex-col gap-2">
              {(() => {
                const rendered = new Set<string>()
                return plano.exercicios.map((ex) => {
                  if (ex.agrupamentoId && !rendered.has(ex.agrupamentoId)) {
                    rendered.add(ex.agrupamentoId)
                    const groupExs = plano.exercicios.filter(e => e.agrupamentoId === ex.agrupamentoId)
                    const config = AGRUPAMENTO_CONFIG[ex.tipoAgrupamento ?? 'superset']
                    return (
                      <div key={`group-${ex.agrupamentoId}`} className="rounded-2xl border-l-4 pl-1" style={{ borderColor: config.cor }}>
                        <div className="px-2 py-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: config.cor }}>
                            {config.label} ({groupExs.length})
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          {groupExs.map(gex => (
                            <ExercicioDetalheCard key={gex.id} ex={gex} editando={false} isExpanded={false} onToggleExpand={() => {}} onRemove={() => {}} onUpdateSerie={() => {}} onUpdateDescanso={() => {}} onUpdateTipoSerie={() => {}} onUpdateExercicio={() => {}} />
                          ))}
                        </div>
                      </div>
                    )
                  }
                  if (ex.agrupamentoId && rendered.has(ex.agrupamentoId)) return null
                  return (
                    <ExercicioDetalheCard key={ex.id} ex={ex} editando={false} isExpanded={false} onToggleExpand={() => {}} onRemove={() => {}} onUpdateSerie={() => {}} onUpdateDescanso={() => {}} onUpdateTipoSerie={() => {}} onUpdateExercicio={() => {}} />
                  )
                })
              })()}
            </div>
          )}

          {editando && (
            <button onClick={() => setShowPicker(true)}
              className="mt-3 w-full py-4 rounded-2xl border-2 border-dashed border-border-strong text-text-muted flex items-center justify-center gap-2 text-sm font-medium hover:border-accent hover:text-accent transition-colors">
              <Plus size={18} /> Adicionar Exercício
            </button>
          )}
        </div>

        {/* Danger zone */}
        {!editando && (
          <div className="mt-8 mb-4 animate-fade-up flex flex-col gap-3" style={{ animationDelay: '200ms' }}>
            <button
              onClick={async () => {
                const clone = await clonarPlano(plano.id)
                if (clone) {
                  toast.success(`"${clone.nome}" criado!`)
                  navigate({ to: '/treinos/$planoId', params: { planoId: clone.id } })
                }
              }}
              className="btn-secondary w-full"
            >
              <Copy size={16} />
              Duplicar Plano
            </button>
            <button
              onClick={async () => {
                if (confirm(`Excluir "${plano.nome}"?`)) {
                  await excluirPlano(plano.id)
                  navigate({ to: '/treinos' })
                }
              }}
              className="btn-danger w-full"
            >
              <Trash2 size={16} />
              Excluir Plano
            </button>
          </div>
        )}
      </div>

      {showPicker && (
        <ExercicioPicker onSelect={(ex) => { adicionarEx(ex); setShowPicker(false) }} onClose={() => setShowPicker(false)} />
      )}

      {showGroupMenu && (
        <div className="modal-overlay" onClick={() => setShowGroupMenu(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-text mb-4">Tipo de Agrupamento</h2>
            <div className="flex flex-col gap-2">
              {(Object.entries(AGRUPAMENTO_CONFIG) as [TipoAgrupamento, typeof AGRUPAMENTO_CONFIG[string]][]).map(([tipo, config]) => (
                <button
                  key={tipo}
                  onClick={() => criarAgrupamento(tipo)}
                  className="flex items-center gap-3 p-4 rounded-xl transition-colors hover:bg-surface-2"
                  style={{ background: config.corBg }}
                >
                  <Link2 size={18} style={{ color: config.cor }} />
                  <div className="text-left">
                    <p className="font-semibold text-text text-sm">{config.label}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {tipo === 'superset' && 'Executa exercícios alternados sem descanso'}
                      {tipo === 'dropset' && 'Reduz peso progressivamente sem pausa'}
                      {tipo === 'giantset' && 'Circuito de 3+ exercícios sem descanso'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {blockerStatus === 'blocked' && (
        <div className="modal-overlay" onClick={blockerReset}>
          <div className="modal-content text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-3xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-danger" />
            </div>
            <h2 className="text-xl font-bold text-text mb-2">Descartar edição?</h2>
            <p className="text-text-muted text-sm mb-6">
              As alterações feitas serão perdidas.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={blockerProceed} className="btn-danger w-full py-4 text-base">
                Sim, Descartar
              </button>
              <button onClick={blockerReset} className="btn-ghost w-full py-3">
                Continuar Editando
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
