import { createFileRoute, useNavigate, useBlocker } from '@tanstack/react-router'
import { useNewPlan } from '../../hooks/useNovoPlano'
import { Plus, Link2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { GROUPING_CONFIG } from '../../types'
import { ExercisePicker } from '../../components/common/ExercicioPicker'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { NovoPlanoHeader } from './components/-NovoPlanoHeader'
import { PlanDetailsCard } from './components/-PlanDetailsCard'
import { ExerciseInPlanCard } from './components/-ExercicioNoPlanoCard'
import { CancelarCriacaoModal } from './components/-CancelarCriacaoModal'
import { GroupTypeModal } from './components/-GroupTypeModal'

export const Route = createFileRoute('/treinos/novo')({
  component: NovoPlanoPage,
})

function NovoPlanoPage() {
  const {
    nome,
    setNome,
    descricao,
    setDescricao,
    exercicios,
    saving,
    showPicker,
    setShowPicker,
    corSelecionada,
    setCorSelecionada,
    selecionados,
    setSelecionados,
    showGroupMenu,
    setShowGroupMenu,
    salvouRef,
    isDirty,
    sensors,
    criarAgrupamento,
    removerDoAgrupamento,
    toggleSelecionado,
    adicionarExercicio,
    removerExercicio,
    atualizarExercicio,
    handleDragOver,
    salvar,
  } = useNewPlan()
  const navigate = useNavigate()

  const { status: blockerStatus, proceed: blockerProceed, reset: blockerReset } =
    useBlocker({
      shouldBlockFn: () => isDirty && !salvouRef.current,
      withResolver: true,
    })

  return (
    <>
      <div className="page-container pt-4">
        <NovoPlanoHeader
          onBack={() => navigate({ to: '/treinos' })}
          onSave={salvar}
          saving={saving}
          saveDisabled={!nome.trim()}
        />

        <PlanDetailsCard
          nome={nome}
          onNomeChange={setNome}
          descricao={descricao}
          onDescricaoChange={setDescricao}
          corSelecionada={corSelecionada}
          onCorChange={setCorSelecionada}
        />

        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-text">EXERCÍCIOS ({exercicios.length})</h2>
            {exercicios.length >= 2 && (
              <div className="flex items-center gap-2">
                {selecionados.size >= 2 && (
                  <button
                    type="button"
                    onClick={() => setShowGroupMenu(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-lg"
                  >
                    <Link2 size={12} />
                    Agrupar ({selecionados.size})
                  </button>
                )}
                {selecionados.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelecionados(new Set())}
                    className="text-xs text-text-muted"
                  >
                    Limpar
                  </button>
                )}
              </div>
            )}
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragOver={handleDragOver}
          >
            <SortableContext items={exercicios.map(ex => ex.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {(() => {
                  const rendered = new Set<string>()
                  return exercicios.map(ex => {
                    if (ex.agrupamentoId && !rendered.has(ex.agrupamentoId)) {
                      rendered.add(ex.agrupamentoId)
                      const groupExs = exercicios.filter(e => e.agrupamentoId === ex.agrupamentoId)
                      const config = GROUPING_CONFIG[ex.tipoAgrupamento ?? 'superset']
                      return (
                        <div
                          key={`group-${ex.agrupamentoId}`}
                          className="rounded-2xl border-l-4 pl-1"
                          style={{ borderColor: config.cor }}
                        >
                          <div className="flex items-center justify-between px-2 py-1.5">
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: config.cor }}
                            >
                              {config.label} ({groupExs.length})
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            {groupExs.map(gex => (
                              <ExerciseInPlanCard
                                key={gex.id}
                                exercicio={gex}
                                onUpdate={campo => atualizarExercicio(gex.id, campo)}
                                onRemove={() => removerExercicio(gex.id)}
                                isSelected={selecionados.has(gex.id)}
                                onToggleSelect={() => toggleSelecionado(gex.id)}
                                showSelect={exercicios.length >= 2}
                                onRemoveFromGroup={() => removerDoAgrupamento(gex.id)}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    }
                    if (ex.agrupamentoId && rendered.has(ex.agrupamentoId)) return null
                    return (
                      <ExerciseInPlanCard
                        key={ex.id}
                        exercicio={ex}
                        onUpdate={campo => atualizarExercicio(ex.id, campo)}
                        onRemove={() => removerExercicio(ex.id)}
                        isSelected={selecionados.has(ex.id)}
                        onToggleSelect={() => toggleSelecionado(ex.id)}
                        showSelect={exercicios.length >= 2}
                      />
                    )
                  })
                })()}
              </div>
            </SortableContext>
          </DndContext>

          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="mt-3 w-full py-4 rounded-2xl border-2 border-dashed border-border-strong text-text-muted flex items-center justify-center gap-2 text-sm font-medium hover:border-accent  hover:text-accent transition-colors"
          >
            <Plus size={18} />
            Adicionar Exercício
          </button>
        </div>
      </div>

      {blockerStatus === 'blocked' && (
        <CancelarCriacaoModal onConfirm={() => blockerProceed?.()} onCancel={blockerReset} />
      )}

      {showPicker && (
        <ExercisePicker
          onSelect={(ex) => {
            adicionarExercicio({
              id: uuidv4(),
              exercicioId: ex.id,
              exercicio: ex,
              series: 3,
              repeticoesMeta: 10,
              pesoMeta: 0,
              descansoSegundos: 60,
            })
            setShowPicker(false)
          }}
          onClose={() => setShowPicker(false)}
        />
      )}

      {showGroupMenu && (
        <GroupTypeModal onSelect={criarAgrupamento} onClose={() => setShowGroupMenu(false)} />
      )}
    </>
  )
}
