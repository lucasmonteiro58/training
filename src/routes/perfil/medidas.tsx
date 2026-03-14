import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMedidas } from '../../hooks/useMedidas'
import { useAuthStore } from '../../stores'
import { CAMPOS_MEDIDA } from '../../types'
import type { MedidaCorporal } from '../../types'
import { useState, useMemo } from 'react'
import { ChevronLeft, Ruler } from 'lucide-react'
import { toast } from 'sonner'
import { MedidasHeader } from './components/-MedidasHeader'
import { MedidasChart } from './components/-MedidasChart'
import { MedidaCard } from './components/-MedidaCard'
import { NovaMedidaModal } from './components/-NovaMedidaModal'
import { ConfirmDeleteMedidaModal } from './components/-ConfirmDeleteMedidaModal'

export const Route = createFileRoute('/perfil/medidas')({
  component: MedidasPage,
})

function MedidasPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { medidas, loading, adicionar, remover } = useMedidas()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [campoGrafico, setCampoGrafico] = useState<string>('peso')

  const handleSalvar = async () => {
    if (!user) return
    const temAlgumValor = CAMPOS_MEDIDA.some(c => form[c.key] && Number(form[c.key]) > 0)
    if (!temAlgumValor) {
      toast.error('Preencha pelo menos uma medida.')
      return
    }

    const medida: MedidaCorporal = {
      id: crypto.randomUUID(),
      userId: user.uid,
      data: Date.now(),
    }
    CAMPOS_MEDIDA.forEach(c => {
      const v = parseFloat(form[c.key] || '')
      if (v > 0) (medida as Record<string, unknown>)[c.key] = v
    })
    if (form.notas?.trim()) medida.notas = form.notas.trim()

    await adicionar(medida)
    setForm({})
    setShowForm(false)
    toast.success('Medida registrada!')
  }

  const dadosGrafico = useMemo(() => {
    const campo = CAMPOS_MEDIDA.find(c => c.key === campoGrafico)
    if (!campo) return []
    return [...medidas]
      .filter(m => (m as Record<string, unknown>)[campoGrafico] != null)
      .sort((a, b) => a.data - b.data)
      .map(m => ({
        data: new Date(m.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        valor: (m as Record<string, unknown>)[campoGrafico] as number,
      }))
  }, [medidas, campoGrafico])

  if (loading) {
    return (
      <div className="page-container pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button type="button" onClick={() => navigate({ to: '/perfil' })} className="btn-icon">
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
      <MedidasHeader
        onVoltar={() => navigate({ to: '/perfil' })}
        onNova={() => setShowForm(true)}
      />

      {medidas.length >= 1 && (
        <MedidasChart
          campoGrafico={campoGrafico}
          dados={dadosGrafico}
          onCampoChange={setCampoGrafico}
        />
      )}

      {medidas.length === 0 ? (
        <div className="card p-8 text-center animate-fade-up">
          <Ruler size={40} className="text-text-subtle mx-auto mb-3" />
          <p className="text-text-muted text-sm">Nenhuma medida registrada ainda.</p>
          <p className="text-xs text-text-subtle mt-1">
            Acompanhe seu peso, medidas e composição corporal.
          </p>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '100ms' }}>
          {medidas.map(m => (
            <MedidaCard
              key={m.id}
              medida={m}
              onExcluir={() => setConfirmDelete(m.id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <NovaMedidaModal
          form={form}
          onFormChange={setForm}
          onSalvar={handleSalvar}
          onClose={() => setShowForm(false)}
        />
      )}

      {confirmDelete && (
        <ConfirmDeleteMedidaModal
          onConfirm={async () => {
            await remover(confirmDelete)
            setConfirmDelete(null)
            toast.success('Medida excluída.')
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
