import { createFileRoute } from '@tanstack/react-router'
import { usePlans } from '../../hooks/usePlans'
import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import type { WorkoutPlan } from '../../types'
import { WorkoutsHeader } from './components/-WorkoutsHeader'
import { EmptyPlans } from './components/-EmptyPlans'
import { PlanSortableCard } from './components/-PlanSortableCard'
import { ArchivedPlansSection } from './components/-ArchivedPlansSection'

export const Route = createFileRoute('/workouts/')({
  component: WorkoutsPage,
})

function WorkoutsPage() {
  const {
    activePlans,
    archivedPlans,
    loading,
    deletePlanById,
    archivePlan,
    unarchivePlan,
    reorderPlans,
  } = usePlans()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const [localOrder, setLocalOrder] = useState<WorkoutPlan[]>([])

  const sortedList = isReordering ? localOrder : activePlans

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = localOrder.findIndex(p => p.id === active.id)
    const newIdx = localOrder.findIndex(p => p.id === over.id)
    setLocalOrder(arrayMove(localOrder, oldIdx, newIdx))
  }

  const handleToggleReorder = () => {
    if (!isReordering) {
      setLocalOrder([...activePlans])
      setIsReordering(true)
    } else {
      reorderPlans(localOrder.map(p => p.id))
      setIsReordering(false)
    }
  }

  const handleDelete = async (id: string, planName: string) => {
    if (!confirm(`Excluir o plano "${planName}"? Esta ação não pode ser desfeita.`)) return
    setDeletingId(id)
    await deletePlanById(id)
    setDeletingId(null)
  }

  const handleArchive = async (id: string) => {
    setProcessingId(id)
    await archivePlan(id)
    setProcessingId(null)
  }

  const handleRestore = async (id: string) => {
    setProcessingId(id)
    await unarchivePlan(id)
    setProcessingId(null)
  }

  return (
    <div
      className="page-container pt-6"
      style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <WorkoutsHeader
        reordenando={isReordering}
        podeOrdenar={activePlans.length > 1}
        onToggleReordenar={handleToggleReorder}
      />

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : activePlans.length === 0 && archivedPlans.length === 0 ? (
        <EmptyPlans />
      ) : (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            {activePlans.length === 0 && (
              <p className="text-center text-text-muted text-sm py-8">Nenhum treino ativo no momento.</p>
            )}
            {isReordering ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={sortedList.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedList.map(plano => (
                    <PlanSortableCard
                      key={plano.id}
                      plano={plano}
                      reordenando={isReordering}
                      processando={processingId}
                      onArchive={handleArchive}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              activePlans.map(plan => (
                <PlanSortableCard
                  key={plan.id}
                  plano={plan}
                  reordenando={false}
                  processando={processingId}
                  onArchive={handleArchive}
                />
              ))
            )}
          </div>

          <ArchivedPlansSection
            planos={archivedPlans}
            expandido={showArchived}
            processando={processingId}
            deletando={deletingId}
            onToggle={() => setShowArchived(!showArchived)}
            onRestore={handleRestore}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  )
}
