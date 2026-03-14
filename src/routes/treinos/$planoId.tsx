import { createFileRoute, useNavigate, Link, useBlocker } from '@tanstack/react-router'
import { useState } from 'react'
import { usePlanos } from '../../hooks/usePlanos'
import { ArrowLeft, Dumbbell, Play, Edit2, Plus, Clock, Trash2, GripVertical, ChevronDown, Search, RefreshCw, XCircle, Copy, Link2, Unlink } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import type { ExercicioNoPlano, SeriePlano, TipoSerie, TipoAgrupamento } from '../../types'
import { GRUPOS_MUSCULARES, AGRUPAMENTO_CONFIG } from '../../types'
import { ExercicioPicker } from '../../components/common/ExercicioPicker'
import { toast } from 'sonner'
import { useIniciarTreino } from '../../hooks/useIniciarTreino'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export const Route = createFileRoute('/treinos/$planoId')({
  component: PlanoDetalheComponent,
})

function PlanoDetalheComponent() {
  const { planoId } = Route.useParams()
  const navigate = useNavigate()
  const { planos, atualizarPlano, excluirPlano, clonarPlano } = usePlanos()
  const plano = planos.find((p) => p.id === planoId)
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState(plano?.nome ?? '')
  const [showPicker, setShowPicker] = useState(false)
  const [exerciciosEdit, setExerciciosEdit] = useState<ExercicioNoPlano[]>(plano?.exercicios ?? [])
  const [expandedEx, setExpandedEx] = useState<Set<string>>(new Set())
  const { handleIniciar, modal: modalInicio } = useIniciarTreino()
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [showGroupMenu, setShowGroupMenu] = useState(false)

  const { status: blockerStatus, proceed: blockerProceed, reset: blockerReset } = useBlocker({
    shouldBlockFn: () => editando,
    withResolver: true,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  if (!plano) {
    return (
      <div className="page-container pt-6 text-center">
        <p className="text-text-muted">Plano não encontrado.</p>
        <Link to="/treinos" className="text-accent text-sm mt-2 block">Voltar</Link>
      </div>
    )
  }

  const salvarEdicao = async () => {
    await atualizarPlano({ ...plano, nome, exercicios: exerciciosEdit })
    setEditando(false)
  }

  const adicionarEx = (ex: any) => {
    setExerciciosEdit((prev) => [
      ...prev,
      { id: uuidv4(), exercicioId: ex.id, exercicio: ex, series: 3, repeticoesMeta: 10, pesoMeta: 0, descansoSegundos: 60, ordem: prev.length, seriesDetalhadas: [{ peso: 0, repeticoes: 10 }, { peso: 0, repeticoes: 10 }, { peso: 0, repeticoes: 10 }] },
    ])
  }

  const removerEx = (id: string) => setExerciciosEdit((p) => p.filter((e) => e.id !== id))

  const atualizarSerieEdit = (exId: string, sIdx: number, campo: Partial<SeriePlano>) => {
    setExerciciosEdit((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex
        const base = ex.seriesDetalhadas ?? Array.from({ length: ex.series }, () => ({ peso: ex.pesoMeta ?? 0, repeticoes: ex.repeticoesMeta }))
        const novas = base.map((s, i) => (i === sIdx ? { ...s, ...campo } : s))
        return { ...ex, seriesDetalhadas: novas }
      })
    )
  }

  const atualizarExercicioEdit = (exId: string, campos: Partial<ExercicioNoPlano['exercicio']>) => {
    setExerciciosEdit((prev) =>
      prev.map((ex) =>
        ex.id === exId ? { ...ex, exercicio: { ...ex.exercicio, ...campos } } : ex
      )
    )
  }

  const atualizarDescansoEdit = (exId: string, segundos: number) => {
    setExerciciosEdit((prev) =>
      prev.map((ex) => (ex.id === exId ? { ...ex, descansoSegundos: segundos } : ex))
    )
  }

  const atualizarTipoSerieEdit = (exId: string, tipo: TipoSerie) => {
    setExerciciosEdit((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex
        const base = ex.seriesDetalhadas ?? Array.from({ length: ex.series }, () => ({ peso: ex.pesoMeta ?? 0, repeticoes: ex.repeticoesMeta }))
        const seriesDetalhadas = tipo === 'tempo' ? base.map((s) => ({ ...s, repeticoes: 1 })) : base
        return { ...ex, tipoSerie: tipo, seriesDetalhadas }
      })
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setExerciciosEdit((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex).map((ex, idx) => ({ ...ex, ordem: idx }))
      })
    }
  }

  const toggleExpandedEx = (id: string) =>
    setExpandedEx((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const criarAgrupamento = (tipo: TipoAgrupamento) => {
    if (selecionados.size < 2) return
    const agrupamentoId = uuidv4()
    setExerciciosEdit(prev => prev.map(ex =>
      selecionados.has(ex.id) ? { ...ex, agrupamentoId, tipoAgrupamento: tipo } : ex
    ))
    setSelecionados(new Set())
    setShowGroupMenu(false)
  }

  const removerDoAgrupamento = (exId: string) => {
    setExerciciosEdit(prev => prev.map(ex =>
      ex.id === exId ? { ...ex, agrupamentoId: undefined, tipoAgrupamento: undefined } : ex
    ))
  }

  const toggleSelecionado = (id: string) => {
    setSelecionados(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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
            <button onClick={() => { setEditando(true); setNome(plano.nome); setExerciciosEdit(plano.exercicios) }}
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

function ExercicioDetalheCard({
  ex,
  editando,
  isExpanded,
  onToggleExpand,
  onRemove,
  onUpdateSerie,
  onUpdateDescanso,
  onUpdateTipoSerie,
  onUpdateExercicio,
  showSelect,
  isSelected,
  onToggleSelect,
  onRemoveFromGroup,
}: {
  ex: ExercicioNoPlano
  editando: boolean
  isExpanded: boolean
  onToggleExpand: () => void
  onRemove: () => void
  onUpdateSerie: (sIdx: number, campo: Partial<SeriePlano>) => void
  onUpdateDescanso: (segundos: number) => void
  onUpdateTipoSerie: (tipo: TipoSerie) => void
  onUpdateExercicio: (campos: Partial<ExercicioNoPlano['exercicio']>) => void
  showSelect?: boolean
  isSelected?: boolean
  onToggleSelect?: () => void
  onRemoveFromGroup?: () => void
}) {
  const [buscandoImagem, setBuscandoImagem] = useState(false)
  const [imagensWeb, setImagensWeb] = useState<string[]>([])
  const [termoBusca, setTermoBusca] = useState(ex.exercicio.nome)

  const buscarImagem = async () => {
    if (!termoBusca.trim()) return
    setBuscandoImagem(true)
    setImagensWeb([])
    try {
      const key = import.meta.env.VITE_GIPHY_API_KEY
      if (!key) {
        toast.error('Chave da API Giphy não configurada.')
        return
      }
      const apiUrl = `https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${encodeURIComponent(termoBusca + ' exercise')}&limit=12&rating=g`
      const res = await fetch(apiUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const urls: string[] = (data.data ?? []).map((gif: any) => gif?.images?.original?.url ?? gif?.images?.downsized?.url).filter(Boolean)
      setImagensWeb(urls)
      if (urls.length === 0) toast.info('Nenhuma imagem encontrada. Tente outro termo.')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao buscar imagens.')
    } finally {
      setBuscandoImagem(false)
    }
  }
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: ex.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  const tipo = ex.tipoSerie ?? 'reps'
  const ciclo: TipoSerie[] = ['reps', 'tempo', 'falha']
  const proximo = ciclo[(ciclo.indexOf(tipo) + 1) % ciclo.length]
  const tipoLabels: Record<TipoSerie, string> = { reps: 'Reps', tempo: 'Min', falha: 'Falha ⚡' }

  const displayReps =
    tipo === 'tempo'
      ? `${ex.seriesDetalhadas?.[0]?.repeticoes ?? 1} min`
      : tipo === 'falha'
      ? 'Falha ⚡'
      : `${ex.repeticoesMeta} reps`

  const seriesEdit = isExpanded
    ? (ex.seriesDetalhadas ?? Array.from({ length: ex.series }, (_, i) => ({ peso: ex.pesoMeta ?? 0, repeticoes: tipo === 'tempo' ? 1 : ex.repeticoesMeta })))
    : []

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card p-3 transition-opacity ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        {editando && (
          <div ref={setActivatorNodeRef} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 touch-none select-none">
            <GripVertical size={16} className="text-text-subtle shrink-0" />
          </div>
        )}
        {showSelect && !ex.agrupamentoId && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect?.() }}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
              isSelected ? 'bg-accent border-accent  text-white' : 'border-border-strong'
            }`}
          >
            {isSelected && <span className="text-xs">✓</span>}
          </button>
        )}
        {ex.agrupamentoId && onRemoveFromGroup && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemoveFromGroup() }}
            className="p-1 rounded-lg hover:bg-surface-2 text-text-subtle"
            title="Remover do agrupamento"
          >
            <Unlink size={14} />
          </button>
        )}
        {ex.exercicio.gifUrl ? (
          <img src={ex.exercicio.gifUrl} alt={ex.exercicio.nome}
            className="w-12 h-12 rounded-xl object-cover bg-surface-2 shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center shrink-0">
            <span className="text-2xl">💪</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-text font-semibold text-sm truncate">{ex.exercicio.nome}</p>
          <div className="flex gap-3 mt-1 flex-wrap">
            <span className="text-xs text-text-muted">{ex.series} séries</span>
            <span className="text-xs text-text-muted">{displayReps}</span>
            <span className="text-xs text-text-muted">⏱ {ex.descansoSegundos}s</span>
          </div>
        </div>
        {editando && (
          <div className="flex items-center gap-1">
            <button onClick={onToggleExpand} className="btn-ghost p-2 text-text-subtle" title="Editar séries">
              <ChevronDown size={15} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            <button onClick={onRemove} className="btn-ghost p-2 text-danger">
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">

          {/* Nome */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-subtle block mb-1 px-1">NOME</label>
            <input
              className="input text-sm w-full"
              value={ex.exercicio.nome}
              onChange={e => onUpdateExercicio({ nome: e.target.value })}
            />
          </div>

          {/* Grupo muscular */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-subtle block mb-1 px-1">GRUPO MUSCULAR</label>
            <select
              className="input text-sm w-full"
              value={ex.exercicio.grupoMuscular}
              onChange={e => onUpdateExercicio({ grupoMuscular: e.target.value })}
            >
              {GRUPOS_MUSCULARES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Busca de imagem */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-subtle block mb-1 px-1">BUSCAR IMAGEM (WEB)</label>
            <div className="flex gap-2">
              <input
                className="input flex-1 text-sm"
                value={termoBusca}
                onChange={e => setTermoBusca(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && buscarImagem()}
                placeholder="Ex: bench press"
              />
              <button onClick={buscarImagem} disabled={buscandoImagem} className="btn-secondary px-3 shrink-0">
                {buscandoImagem ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
              </button>
            </div>
            {imagensWeb.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2 p-2 bg-surface-2 rounded-xl max-h-44 overflow-y-auto">
                {imagensWeb.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => onUpdateExercicio({ gifUrl: url })}
                    className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                      ex.exercicio.gifUrl === url ? 'border-accent  opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
            <div className="mt-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-subtle block mb-1 px-1">URL MANUAL</label>
              <div className="flex gap-2 items-start">
                <input
                  className="input text-sm flex-1"
                  placeholder="https://exemplo.com/exercicio.gif"
                  value={ex.exercicio.gifUrl ?? ''}
                  onChange={e => onUpdateExercicio({ gifUrl: e.target.value || undefined })}
                />
                {ex.exercicio.gifUrl && (
                  <img
                    src={ex.exercicio.gifUrl}
                    alt={ex.exercicio.nome}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 bg-surface-2"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Modo (tipoSerie) */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">Modo</span>
            <button
              onClick={() => onUpdateTipoSerie(proximo)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors ${
                tipo === 'reps'
                  ? 'text-text-muted border-border hover:text-accent hover:border-accent /50'
                  : 'text-accent border-accent /40 bg-accent/10'
              }`}
            >
              {tipoLabels[tipo]} → {tipoLabels[proximo]}
            </button>
          </div>
          {/* Intervalo */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle shrink-0">Intervalo (s)</span>
            <input
              type="number"
              className="set-input h-8! py-0! text-sm! flex-1"
              value={ex.descansoSegundos}
              min={0}
              step={15}
              onChange={(e) => onUpdateDescanso(e.target.value === '' ? 0 : parseInt(e.target.value))}
              onFocus={(e) => e.target.select()}
            />
          </div>
          {/* Header séries */}
          <div className="grid grid-cols-[30px_1fr_1fr] gap-2 px-1 text-[10px] font-bold uppercase tracking-wider text-text-subtle">
            <span className="text-center">#</span>
            <span className="text-center">Peso (kg)</span>
            <span className="text-center">{tipoLabels[tipo]}</span>
          </div>
          {seriesEdit.map((s, i) => (
            <div key={i} className="grid grid-cols-[30px_1fr_1fr] gap-2 items-center bg-surface-2/50 px-1 py-1 rounded-lg">
              <span className="text-[11px] font-bold text-text-muted text-center">{i + 1}</span>
              <input
                type="number"
                className="set-input h-9! py-0! text-sm!"
                value={s.peso === 0 ? '' : s.peso}
                onChange={(e) => onUpdateSerie(i, { peso: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                onFocus={(e) => e.target.select()}
                placeholder="0"
              />
              <input
                type="number"
                className="set-input h-9! py-0! text-sm!"
                value={s.repeticoes === 0 ? '' : s.repeticoes}
                onChange={(e) => onUpdateSerie(i, { repeticoes: e.target.value === '' ? 0 : (tipo === 'tempo' ? parseFloat(e.target.value) : parseInt(e.target.value)) })}
                onFocus={(e) => e.target.select()}
                placeholder={tipo === 'falha' ? 'Falha' : tipo === 'tempo' ? '0.0' : '0'}
                step={tipo === 'tempo' ? '0.5' : '1'}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
