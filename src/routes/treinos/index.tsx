import { createFileRoute } from '@tanstack/react-router'
import { usePlanos } from '../../hooks/usePlanos'
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
import type { PlanoDeTreino } from '../../types'
import { TreinosHeader } from './components/-TreinosHeader'
import { EmptyPlanos } from './components/-EmptyPlanos'
import { PlanoSortableCard } from './components/-PlanoSortableCard'
import { PlanosArquivadosSection } from './components/-PlanosArquivadosSection'

export const Route = createFileRoute('/treinos/')({
  component: TreinosPage,
})

function TreinosPage() {
  const {
    planosAtivos,
    planosArquivados,
    loading,
    excluirPlano,
    arquivarPlano,
    desarquivarPlano,
    reordenarPlanos,
  } = usePlanos()
  const [deletando, setDeletando] = useState<string | null>(null)
  const [processando, setProcessando] = useState<string | null>(null)
  const [mostrarArquivados, setMostrarArquivados] = useState(false)
  const [reordenando, setReordenando] = useState(false)
  const [ordemLocal, setOrdemLocal] = useState<PlanoDeTreino[]>([])

  const listaOrdenada = reordenando ? ordemLocal : planosAtivos

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
      setOrdemLocal([...planosAtivos])
      setReordenando(true)
    } else {
      reordenarPlanos(ordemLocal.map(p => p.id))
      setReordenando(false)
    }
  }

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Excluir o plano "${nome}"? Esta ação não pode ser desfeita.`)) return
    setDeletando(id)
    await excluirPlano(id)
    setDeletando(null)
  }

  const handleArchive = async (id: string) => {
    setProcessando(id)
    await arquivarPlano(id)
    setProcessando(null)
  }

  const handleRestore = async (id: string) => {
    setProcessando(id)
    await desarquivarPlano(id)
    setProcessando(null)
  }

  return (
    <div
      className="page-container pt-6"
      style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <TreinosHeader
        reordenando={reordenando}
        podeOrdenar={planosAtivos.length > 1}
        onToggleReordenar={handleToggleReordenar}
      />

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : planosAtivos.length === 0 && planosArquivados.length === 0 ? (
        <EmptyPlanos />
      ) : (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            {planosAtivos.length === 0 && (
              <p className="text-center text-text-muted text-sm py-8">Nenhum treino ativo no momento.</p>
            )}
            {reordenando ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={listaOrdenada.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {listaOrdenada.map(plano => (
                    <PlanoSortableCard
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
              planosAtivos.map(plano => (
                <PlanoSortableCard
                  key={plano.id}
                  plano={plano}
                  reordenando={false}
                  processando={processando}
                  onArchive={handleArchive}
                />
              ))
            )}
          </div>

          <PlanosArquivadosSection
            planos={planosArquivados}
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
