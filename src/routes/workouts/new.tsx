import { createFileRoute, useNavigate, useBlocker } from '@tanstack/react-router'
import { useNewPlan } from '../../hooks/useNewPlan'
import { Plus, Link2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { GROUPING_CONFIG } from '../../types'
import { ExercisePicker } from '../../components/common/ExercisePicker'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { NewPlanHeader } from './components/-NewPlanHeader'
import { PlanDetailsCard } from './components/-PlanDetailsCard'
import { ExerciseInPlanCard } from './components/-ExerciseInPlanCard'
import { CancelCreationModal } from './components/-CancelCreationModal'
import { GroupTypeModal } from './components/-GroupTypeModal'

export const Route = createFileRoute('/workouts/new')({
  component: NewPlanPage,
})

function NewPlanPage() {
  const {
    name,
    setName,
    description,
    setDescription,
    exercises,
    saving,
    showPicker,
    setShowPicker,
    selectedColor,
    setSelectedColor,
    selected,
    setSelected,
    showGroupMenu,
    setShowGroupMenu,
    savedRef,
    isDirty,
    sensors,
    createGrouping,
    removeFromGrouping,
    toggleSelected,
    addExercise,
    removeExercise,
    updateExercise,
    handleDragOver,
    save,
  } = useNewPlan()
  const navigate = useNavigate()

  const { status: blockerStatus, proceed: blockerProceed, reset: blockerReset } =
    useBlocker({
      shouldBlockFn: () => isDirty && !savedRef.current,
      withResolver: true,
    })

  return (
    <>
      <div className="page-container pt-4">
        <NewPlanHeader
          onBack={() => navigate({ to: '/workouts' })}
          onSave={save}
          saving={saving}
          saveDisabled={!name.trim()}
        />

        <PlanDetailsCard
          name={name}
          onNameChange={setName}
          description={description}
          onDescriptionChange={setDescription}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />

        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-text">EXERCÍCIOS ({exercises.length})</h2>
            {exercises.length >= 2 && (
              <div className="flex items-center gap-2">
                {selected.size >= 2 && (
                  <button
                    type="button"
                    onClick={() => setShowGroupMenu(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-lg"
                  >
                    <Link2 size={12} />
                    Agrupar ({selected.size})
                  </button>
                )}
                {selected.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
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
            <SortableContext items={exercises.map(ex => ex.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {(() => {
                  const rendered = new Set<string>()
                  return exercises.map(ex => {
                    if (ex.groupingId && !rendered.has(ex.groupingId)) {
                      rendered.add(ex.groupingId)
                      const groupExs = exercises.filter((e) => e.groupingId === ex.groupingId)
                      const config = GROUPING_CONFIG[ex.groupingType ?? 'superset']
                      return (
                        <div
                          key={`group-${ex.groupingId}`}
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
                                exercise={gex}
                                onUpdate={field => updateExercise(gex.id, field)}
                                onRemove={() => removeExercise(gex.id)}
                                isSelected={selected.has(gex.id)}
                                onToggleSelect={() => toggleSelected(gex.id)}
                                showSelect={exercises.length >= 2}
                                onRemoveFromGroup={() => removeFromGrouping(gex.id)}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    }
                    if (ex.groupingId && rendered.has(ex.groupingId)) return null
                    return (
                      <ExerciseInPlanCard
                        key={ex.id}
                        exercise={ex}
                        onUpdate={field => updateExercise(ex.id, field)}
                        onRemove={() => removeExercise(ex.id)}
                        isSelected={selected.has(ex.id)}
                        onToggleSelect={() => toggleSelected(ex.id)}
                        showSelect={exercises.length >= 2}
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
        <CancelCreationModal onConfirm={() => blockerProceed?.()} onCancel={blockerReset} />
      )}

      {showPicker && (
        <ExercisePicker
          onSelect={(ex) => {
            addExercise({
              id: uuidv4(),
              exerciseId: ex.id,
              exercise: ex,
              series: 3,
              targetReps: 10,
              targetWeight: 0,
              restSeconds: 60,
              order: exercises.length,
              setsDetail: [
                { weight: 0, reps: 10 },
                { weight: 0, reps: 10 },
                { weight: 0, reps: 10 },
              ],
            })
            setShowPicker(false)
          }}
          onClose={() => setShowPicker(false)}
        />
      )}

      {showGroupMenu && (
        <GroupTypeModal onSelect={createGrouping} onClose={() => setShowGroupMenu(false)} />
      )}
    </>
  )
}
