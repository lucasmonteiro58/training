import { createFileRoute, useNavigate, Link, useBlocker } from '@tanstack/react-router'
import { useState } from 'react'
import { usePlans } from '../../hooks/usePlans'
import { usePlanEdit } from '../../hooks/usePlanEdit'
import { ArrowLeft, Dumbbell, Play, Edit2, Plus, Clock, Trash2, XCircle, Copy, Link2 } from 'lucide-react'
import type { GroupingType } from '../../types'
import { GROUPING_CONFIG } from '../../types'
import { ExercisePicker } from '../../components/common/ExercisePicker'
import { ExerciseDetailCard } from './components/-ExerciseDetailCard'
import { toast } from 'sonner'
import { useStartWorkout } from '../../hooks/useStartWorkout'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

export const Route = createFileRoute('/workouts/$planId')({
  component: PlanDetailPage,
})

function PlanDetailPage() {
  const { planId } = Route.useParams()
  const navigate = useNavigate()
  const { plans, updatePlanById, deletePlanById, clonePlan } = usePlans()
  const plan = plans.find((p) => p.id === planId)
  const [showPicker, setShowPicker] = useState(false)
  const { handleStart: handleStartWorkout, modal: startWorkoutModal } = useStartWorkout()

  const planEditState = usePlanEdit(plan, updatePlanById)
  const {
    editing,
    name,
    setName,
    exercisesEdit,
    expandedEx,
    selected,
    showGroupMenu,
    setShowGroupMenu,
    setSelected,
    sensors,
    saveEdit,
    startEdit,
    addExercise,
    removeExercise,
    updateSetEdit,
    updateExerciseEdit,
    updateRestEdit,
    updateSetTypeEdit,
    handleDragEnd,
    toggleExpandedEx,
    createGrouping,
    removeFromGrouping,
    toggleSelected,
  } = planEditState

  const { status: blockerStatus, proceed: blockerProceed, reset: blockerReset } = useBlocker({
    shouldBlockFn: () => editing,
    withResolver: true,
  })

  if (!plan) {
    return (
      <div className="page-container pt-6 text-center">
        <p className="text-text-muted">Plano não encontrado.</p>
        <Link to="/workouts" className="text-accent text-sm mt-2 block">Voltar</Link>
      </div>
    )
  }

  return (
    <>
      <div className="page-container pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-fade-up">
          <button onClick={() => navigate({ to: '/workouts' })}
            className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-muted">
            <ArrowLeft size={18} />
          </button>
          {editing ? (
            <input className="input flex-1 text-lg font-bold py-2" value={name} onChange={(e) => setName(e.target.value)} />
          ) : (
            <h1 className="text-xl font-bold text-text flex-1">{plan.name}</h1>
          )}
          {editing ? (
            <button onClick={saveEdit} className="btn-primary py-2 px-4 text-sm">Salvar</button>
          ) : (
            <button onClick={startEdit}
              className="btn-ghost p-2.5">
              <Edit2 size={16} />
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-6 animate-fade-up" style={{ animationDelay: '50ms' }}>
          {[
            { label: 'Exercícios', value: plan.exercises.length, icon: Dumbbell },
            { label: 'Séries tot.', value: plan.exercises.reduce((s, e) => s + e.series, 0), icon: null },
            { label: 'Descanso', value: `${plan.exercises[0]?.restSeconds ?? '-'}s`, icon: Clock },
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
          onClick={() => handleStartWorkout(planId)}
        >
          <Play size={20} />
          Iniciar Treino
        </button>
        {startWorkoutModal}

        {/* Exercises list */}
        <div className="animate-fade-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-text">
              EXERCÍCIOS
            </h2>
            {editing && exercisesEdit.length >= 2 && (
              <div className="flex items-center gap-2">
                {selected.size >= 2 && (
                  <button
                    onClick={() => setShowGroupMenu(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-lg"
                  >
                    <Link2 size={12} />
                    Agrupar ({selected.size})
                  </button>
                )}
                {selected.size > 0 && (
                  <button
                    onClick={() => setSelected(new Set())}
                    className="text-xs text-text-muted"
                  >
                    Limpar
                  </button>
                )}
              </div>
            )}
          </div>

          {editing ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={exercisesEdit.map((ex) => ex.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {(() => {
                    const rendered = new Set<string>()
                    return exercisesEdit.map((ex) => {
                      if (ex.groupingId && !rendered.has(ex.groupingId)) {
                        rendered.add(ex.groupingId)
                        const groupExs = exercisesEdit.filter((e) => e.groupingId === ex.groupingId)
                        const config = GROUPING_CONFIG[ex.groupingType ?? 'superset']
                        return (
                          <div key={`group-${ex.groupingId}`} className="rounded-2xl border-l-4 pl-1" style={{ borderColor: config.cor }}>
                            <div className="flex items-center justify-between px-2 py-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: config.cor }}>
                                {config.label} ({groupExs.length})
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              {groupExs.map(gex => (
                                <ExerciseDetailCard
                                  key={gex.id}
                                  ex={gex}
                                  editing={editing}
                                  isExpanded={expandedEx.has(gex.id)}
                                  onToggleExpand={() => toggleExpandedEx(gex.id)}
                                  onRemove={() => removeExercise(gex.id)}
                                  onUpdateSerie={(sIdx, campo) => updateSetEdit(gex.id, sIdx, campo)}
                                  onUpdateDescanso={(s) => updateRestEdit(gex.id, s)}
                                  onUpdateSetType={(tipo: import('../../types').SetType) => updateSetTypeEdit(gex.id, tipo)}
                                  onUpdateExercicio={(campos) => updateExerciseEdit(gex.id, campos)}
                                  showSelect
                                  isSelected={selected.has(gex.id)}
                                  onToggleSelect={() => toggleSelected(gex.id)}
                                  onRemoveFromGroup={() => removeFromGrouping(gex.id)}
                                />
                              ))}
                            </div>
                          </div>
                        )
                      }
                      if (ex.groupingId && rendered.has(ex.groupingId)) return null
                      return (
                        <ExerciseDetailCard
                          key={ex.id}
                          ex={ex}
                          editing={editing}
                          isExpanded={expandedEx.has(ex.id)}
                          onToggleExpand={() => toggleExpandedEx(ex.id)}
                          onRemove={() => removeExercise(ex.id)}
                          onUpdateSerie={(sIdx, campo) => updateSetEdit(ex.id, sIdx, campo)}
                          onUpdateDescanso={(s) => updateRestEdit(ex.id, s)}
                          onUpdateSetType={(tipo: import('../../types').SetType) => updateSetTypeEdit(ex.id, tipo)}
                          onUpdateExercicio={(campos) => updateExerciseEdit(ex.id, campos)}
                          showSelect={exercisesEdit.length >= 2}
                          isSelected={selected.has(ex.id)}
                          onToggleSelect={() => toggleSelected(ex.id)}
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
                return plan.exercises.map((ex) => {
                  if (ex.groupingId && !rendered.has(ex.groupingId)) {
                    rendered.add(ex.groupingId)
                    const groupExs = plan.exercises.filter((e) => e.groupingId === ex.groupingId)
                    const config = GROUPING_CONFIG[ex.groupingType ?? 'superset']
                    return (
                      <div key={`group-${ex.groupingId}`} className="rounded-2xl border-l-4 pl-1" style={{ borderColor: config.cor }}>
                        <div className="px-2 py-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: config.cor }}>
                            {config.label} ({groupExs.length})
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          {groupExs.map(gex => (
                            <ExerciseDetailCard key={gex.id} ex={gex} editing={false} isExpanded={false} onToggleExpand={() => {}} onRemove={() => {}} onUpdateSerie={() => {}} onUpdateDescanso={() => {}} onUpdateSetType={() => {}} onUpdateExercicio={() => {}} />
                          ))}
                        </div>
                      </div>
                    )
                  }
                  if (ex.groupingId && rendered.has(ex.groupingId)) return null
                  return (
                    <ExerciseDetailCard key={ex.id} ex={ex} editing={false} isExpanded={false} onToggleExpand={() => {}} onRemove={() => {}} onUpdateSerie={() => {}} onUpdateDescanso={() => {}} onUpdateSetType={() => {}} onUpdateExercicio={() => {}} />
                  )
                })
              })()}
            </div>
          )}

          {editing && (
            <button onClick={() => setShowPicker(true)}
              className="mt-3 w-full py-4 rounded-2xl border-2 border-dashed border-border-strong text-text-muted flex items-center justify-center gap-2 text-sm font-medium hover:border-accent hover:text-accent transition-colors">
              <Plus size={18} /> Adicionar Exercício
            </button>
          )}
        </div>

        {/* Danger zone */}
        {!editing && (
          <div className="mt-8 mb-4 animate-fade-up flex flex-col gap-3" style={{ animationDelay: '200ms' }}>
            <button
              onClick={async () => {
                const clone = await clonePlan(plan.id)
                if (clone) {
                  toast.success(`"${clone.name}" criado!`)
                  navigate({ to: '/workouts/$planId', params: { planId: clone.id } })
                }
              }}
              className="btn-secondary w-full"
            >
              <Copy size={16} />
              Duplicar Plano
            </button>
            <button
              onClick={async () => {
                if (confirm(`Excluir "${plan.name}"?`)) {
                  await deletePlanById(plan.id)
                  navigate({ to: '/workouts' })
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
        <ExercisePicker onSelect={(ex) => { addExercise(ex); setShowPicker(false) }} onClose={() => setShowPicker(false)} />
      )}

      {showGroupMenu && (
        <div className="modal-overlay" onClick={() => setShowGroupMenu(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-text mb-4">Tipo de Agrupamento</h2>
            <div className="flex flex-col gap-2">
              {(Object.entries(GROUPING_CONFIG) as [GroupingType, typeof GROUPING_CONFIG[string]][]).map(([tipo, config]) => (
                <button
                  key={tipo}
                  onClick={() => createGrouping(tipo)}
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
