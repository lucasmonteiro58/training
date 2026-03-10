import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMedidas } from '../../hooks/useMedidas'
import { useAuthStore } from '../../stores'
import { CAMPOS_MEDIDA } from '../../types'
import type { MedidaCorporal } from '../../types'
import { useState, useMemo } from 'react'
import { ChevronLeft, Plus, Trash2, Ruler, X } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { toast } from 'sonner'

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
      if (v > 0) (medida as any)[c.key] = v
    })
    if (form.notas?.trim()) medida.notas = form.notas.trim()

    await adicionar(medida)
    setForm({})
    setShowForm(false)
    toast.success('Medida registrada!')
  }

  const handleDeletar = async (id: string) => {
    await remover(id)
    setConfirmDelete(null)
    toast.success('Medida excluída.')
  }

  // Dados para gráfico
  const dadosGrafico = useMemo(() => {
    const campo = CAMPOS_MEDIDA.find(c => c.key === campoGrafico)
    if (!campo) return []
    return [...medidas]
      .filter(m => (m as any)[campoGrafico] != null)
      .sort((a, b) => a.data - b.data)
      .map(m => ({
        data: new Date(m.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        valor: (m as any)[campoGrafico] as number,
      }))
  }, [medidas, campoGrafico])

  const campoAtual = CAMPOS_MEDIDA.find(c => c.key === campoGrafico)

  if (loading) {
    return (
      <div className="page-container pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate({ to: '/perfil' })} className="btn-icon">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-[var(--color-text)]">Medidas Corporais</h1>
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: '/perfil' })} className="btn-icon">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-[var(--color-text)]">Medidas Corporais</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-1.5 text-sm py-2 px-3"
        >
          <Plus size={16} />
          Nova
        </button>
      </div>

      {/* Gráfico */}
      {medidas.length >= 1 && (
        <div className="card p-4 mb-5 animate-fade-up" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase">Evolução</p>
            <select
              value={campoGrafico}
              onChange={e => setCampoGrafico(e.target.value)}
              className="text-xs bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg px-2 py-1"
            >
              {CAMPOS_MEDIDA.map(c => (
                <option key={c.key} value={c.key}>{c.label} ({c.unidade})</option>
              ))}
            </select>
          </div>
          {dadosGrafico.length >= 1 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={dadosGrafico}>
                <XAxis dataKey="data" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                  domain={['auto', 'auto']}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: any) => [`${v} ${campoAtual?.unidade ?? ''}`, campoAtual?.label ?? '']}
                />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--color-accent)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)] text-center py-6">
              Registre mais medidas de {campoAtual?.label.toLowerCase()} para ver o gráfico.
            </p>
          )}
        </div>
      )}

      {/* Lista de medidas */}
      {medidas.length === 0 ? (
        <div className="card p-8 text-center animate-fade-up">
          <Ruler size={40} className="text-[var(--color-text-subtle)] mx-auto mb-3" />
          <p className="text-[var(--color-text-muted)] text-sm">Nenhuma medida registrada ainda.</p>
          <p className="text-xs text-[var(--color-text-subtle)] mt-1">
            Acompanhe seu peso, medidas e composição corporal.
          </p>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '100ms' }}>
          {medidas.map(m => (
            <div key={m.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {new Date(m.data).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <button
                  onClick={() => setConfirmDelete(m.id)}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-subtle)]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {CAMPOS_MEDIDA.filter(c => (m as any)[c.key] != null).map(c => (
                  <div key={c.key} className="bg-[var(--color-surface-2)] rounded-lg px-2 py-1.5">
                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase">{c.label}</p>
                    <p className="text-sm font-bold text-[var(--color-text)]">
                      {(m as any)[c.key]} <span className="text-xs font-normal text-[var(--color-text-muted)]">{c.unidade}</span>
                    </p>
                  </div>
                ))}
              </div>
              {m.notas && (
                <p className="text-xs text-[var(--color-text-muted)] mt-2 italic">📝 {m.notas}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Nova Medida */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--color-text)]">Nova Medida</h2>
              <button onClick={() => setShowForm(false)} className="btn-icon"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {CAMPOS_MEDIDA.map(c => (
                <div key={c.key}>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">{c.label} ({c.unidade})</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder="0"
                    value={form[c.key] ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, [c.key]: e.target.value }))}
                    className="input-field w-full text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Notas (opcional)</label>
              <textarea
                placeholder="Observações..."
                value={form.notas ?? ''}
                onChange={e => setForm(prev => ({ ...prev, notas: e.target.value }))}
                className="input-field w-full text-sm resize-none"
                rows={2}
              />
            </div>

            <button onClick={handleSalvar} className="btn-primary w-full">
              Salvar Medida
            </button>
          </div>
        </div>
      )}

      {/* Modal Confirmação Excluir */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content text-center" onClick={e => e.stopPropagation()}>
            <p className="text-lg font-bold text-[var(--color-text)] mb-2">Excluir medida?</p>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button onClick={() => handleDeletar(confirmDelete)} className="btn-danger flex-1">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
