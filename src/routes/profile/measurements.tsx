import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMeasurements } from '../../hooks/useMeasurements'
import { useAuthStore } from '../../stores'
import { MEASUREMENT_FIELDS } from '../../types'
import type { BodyMeasurement } from '../../types'
import { useState, useMemo } from 'react'
import { ChevronLeft, Ruler } from 'lucide-react'
import { toast } from 'sonner'
import { MeasurementsHeader } from './components/-MeasurementsHeader'
import { MeasurementsChart } from './components/-MeasurementsChart'
import { MeasurementCard } from './components/-MeasurementCard'
import { NewMeasurementModal } from './components/-NewMeasurementModal'
import { ConfirmDeleteMeasurementModal } from './components/-ConfirmDeleteMeasurementModal'

export const Route = createFileRoute('/profile/measurements')({
  component: MeasurementsPage,
})

function MeasurementsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { measurements, loading, add, remove } = useMeasurements()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [chartField, setChartField] = useState<string>('peso')

  const handleSave = async () => {
    if (!user) return
    const hasAnyValue = MEASUREMENT_FIELDS.some(c => form[c.key] && Number(form[c.key]) > 0)
    if (!hasAnyValue) {
      toast.error('Preencha pelo menos uma medida.')
      return
    }

    const measurement: BodyMeasurement = {
      id: crypto.randomUUID(),
      userId: user.uid,
      data: Date.now(),
    }
    MEASUREMENT_FIELDS.forEach(c => {
      const v = parseFloat(form[c.key] || '')
      if (v > 0) (measurement as unknown as Record<string, unknown>)[c.key] = v
    })
    if (form.notas?.trim()) measurement.notas = form.notas.trim()

    await add(measurement)
    setForm({})
    setShowForm(false)
    toast.success('Medida registrada!')
  }

  const chartData = useMemo(() => {
    const field = MEASUREMENT_FIELDS.find(c => c.key === chartField)
    if (!field) return []
    return [...measurements]
      .filter(m => (m as unknown as Record<string, unknown>)[chartField] != null)
      .sort((a, b) => a.data - b.data)
      .map(m => ({
        data: new Date(m.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        valor: (m as unknown as Record<string, unknown>)[chartField] as number,
      }))
  }, [measurements, chartField])

  if (loading) {
    return (
      <div className="page-container pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button type="button" onClick={() => navigate({ to: '/profile' })} className="btn-icon">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-text">Medidas Corporais</h1>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 animate-pulse h-20" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="page-container pt-6 pb-28">
      <MeasurementsHeader
        onVoltar={() => navigate({ to: '/profile' })}
        onNova={() => setShowForm(true)}
      />

      {measurements.length >= 1 && (
        <MeasurementsChart
          campoGrafico={chartField}
          dados={chartData}
          onCampoChange={setChartField}
        />
      )}

      {measurements.length === 0 ? (
        <div className="card p-8 text-center animate-fade-up">
          <Ruler size={40} className="text-text-subtle mx-auto mb-3" />
          <p className="text-text-muted text-sm">Nenhuma medida registrada ainda.</p>
          <p className="text-xs text-text-subtle mt-1">
            Acompanhe seu peso, medidas e composição corporal.
          </p>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '100ms' }}>
          {measurements.map(m => (
            <MeasurementCard
              key={m.id}
              medida={m}
              onExcluir={() => setConfirmDelete(m.id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <NewMeasurementModal
          form={form}
          onFormChange={setForm}
          onSalvar={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}

      {confirmDelete && (
        <ConfirmDeleteMeasurementModal
          onConfirm={async () => {
            await remove(confirmDelete)
            setConfirmDelete(null)
            toast.success('Medida excluída.')
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
