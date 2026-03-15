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
  component: TreinosPage,
})

function TreinosPage() {
  const {
    activePlans,
    archivedPlans,
    loading,
    deletePlanById,
    archivePlan,
    unarchivePlan,
    reorderPlans,
  } = usePlans()
  const [deletando, setDeletando] = useState<string | null>(null)
  const [processando, setProcessando] = useState<string | null>(null)
  const [mostrarArquivados, setMostrarArquivados] = useState(false)
  const [reordenando, setReordenando] = useState(false)
  const [ordemLocal, setOrdemLocal] = useState<WorkoutPlan[]>([])

  const listaOrdenada = reordenando ? ordemLocal : activePlans

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = ordemLocal.findIndex(p => p.id === active.id)
    const newIdx = ordemLocal.findIndex(p => p.id === over.id)
    setOrdemLocal(arrayMove(ordemLocal, oldIdx, newIdx))
  }

  const handleToggleReordenar = () => {
    if (!reordenando) {
      setOrdemLocal([...activePlans])
      setReordenando(true)
    } else {
      reorderPlans(ordemLocal.map(p => p.id))
      setReordenando(false)
    }
  }

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Excluir o plano "${nome}"? Esta ação não pode ser desfeita.`)) return
    setDeletando(id)
    await deletePlanById(id)
    setDeletando(null)
  }

  const handleArchive = async (id: string) => {
    setProcessando(id)
    await archivePlan(id)
    setProcessando(null)
  }

  const handleRestore = async (id: string) => {
    setProcessando(id)
    await unarchivePlan(id)
    setProcessando(null)
  }

  return (
    <div
      className="page-container pt-6"
      style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <WorkoutsHeader
        reordenando={reordenando}
        podeOrdenar={activePlans.length > 1}
        onToggleReordenar={handleToggleReordenar}
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
            {reordenando ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={listaOrdenada.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {listaOrdenada.map(plano => (
                    <PlanSortableCard
                      key={plano.id}
                      plano={plano}
                      reordenando={reordenando}
                      processando={processando}
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
                  processando={processando}
                  onArchive={handleArchive}
                />
              ))
            )}
          </div>

          <ArchivedPlansSection
            planos={archivedPlans}
            expandido={mostrarArquivados}
            processando={processando}
            deletando={deletando}
            onToggle={() => setMostrarArquivados(!mostrarArquivados)}
            onRestore={handleRestore}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  )
}
