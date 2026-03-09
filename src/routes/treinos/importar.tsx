import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { parsearCsv, downloadTemplateCsv } from '../../lib/csvImport'
import type { PlanoImportado } from '../../lib/csvImport'
import { usePlanos } from '../../hooks/usePlanos'
import {
  ArrowLeft, FileUp, Download, CheckCircle, AlertCircle, X,
  ChevronDown, ChevronUp, Plus, Trash2,
} from 'lucide-react'
import type { ExercicioNoPlano } from '../../types'
import { GRUPOS_MUSCULARES } from '../../types'
import { useAuthStore } from '../../stores'
import { salvarExercicioPersonalizado } from '../../lib/db/dexie'
import { syncExercicioParaFirestore } from '../../lib/firestore/sync'
import { toast } from 'sonner'

export const Route = createFileRoute('/treinos/importar')({
  component: ImportarCsvPage,
})

type PlanoEditado = PlanoImportado & { collapsed: boolean }

// ── ExercicioEditCard ─────────────────────────────────────────────────────────

function ExercicioEditCard({
  ex,
  idx,
  expanded,
  onToggle,
  onUpdate,
  onRemove,
}: {
  ex: ExercicioNoPlano
  idx: number
  expanded: boolean
  onToggle: () => void
  onUpdate: (fn: (e: ExercicioNoPlano) => ExercicioNoPlano) => void
  onRemove: () => void
}) {
  const series = ex.seriesDetalhadas ?? [{ peso: ex.pesoMeta ?? 0, repeticoes: ex.repeticoesMeta }]

  const setField = (field: string, value: unknown) =>
    onUpdate(e => ({ ...e, exercicio: { ...e.exercicio, [field]: value } }))

  const setSerie = (sIdx: number, field: 'peso' | 'repeticoes', raw: string) => {
    const value = field === 'peso' ? parseFloat(raw) || 0 : parseInt(raw, 10) || 0
    onUpdate(e => {
      const s = (e.seriesDetalhadas ?? []).map((sr, i) => i === sIdx ? { ...sr, [field]: value } : sr)
      return { ...e, seriesDetalhadas: s, series: s.length, repeticoesMeta: s[0]?.repeticoes ?? 1, pesoMeta: s[0]?.peso ?? 0 }
    })
  }

  const addSerie = () =>
    onUpdate(e => {
      const last = (e.seriesDetalhadas ?? [])[e.seriesDetalhadas!.length - 1] ?? { peso: 0, repeticoes: 12 }
      const s = [...(e.seriesDetalhadas ?? []), { ...last }]
      return { ...e, seriesDetalhadas: s, series: s.length }
    })

  const removeSerie = (sIdx: number) =>
    onUpdate(e => {
      const s = (e.seriesDetalhadas ?? []).filter((_, i) => i !== sIdx)
      if (s.length === 0) return e
      return { ...e, seriesDetalhadas: s, series: s.length, repeticoesMeta: s[0]?.repeticoes ?? 1 }
    })

  return (
    <div className="card overflow-hidden">
      {/* Row header */}
      <div className="flex items-center gap-2 p-3">
        <span className="w-6 h-6 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] text-xs font-bold flex items-center justify-center flex-shrink-0">
          {idx + 1}
        </span>
        <button className="flex-1 text-left min-w-0" onClick={onToggle}>
          <p className="text-sm font-medium text-[var(--color-text)] truncate">{ex.exercicio.nome}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {series.length} série{series.length !== 1 ? 's' : ''} · {ex.exercicio.grupoMuscular} · ⏱ {ex.descansoSegundos}s
          </p>
        </button>
        <button onClick={onRemove} className="p-1.5 text-[var(--color-danger)] opacity-60 hover:opacity-100 flex-shrink-0">
          <Trash2 size={15} />
        </button>
        <button onClick={onToggle} className="p-1.5 text-[var(--color-text-muted)] flex-shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded form */}
      {expanded && (
        <div className="border-t border-[var(--color-border)] p-3 flex flex-col gap-3 bg-[var(--color-surface-2)]/40">

          {/* Nome */}
          <div>
            <label className="label-xs">NOME DO EXERCÍCIO</label>
            <input
              className="input mt-1"
              value={ex.exercicio.nome}
              onChange={e => setField('nome', e.target.value)}
            />
          </div>

          {/* Grupo + Descanso side by side */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label-xs">GRUPO MUSCULAR</label>
              <select
                className="input mt-1 text-sm"
                value={ex.exercicio.grupoMuscular}
                onChange={e => setField('grupoMuscular', e.target.value)}
              >
                {GRUPOS_MUSCULARES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-xs">DESCANSO (s)</label>
              <input
                className="input mt-1"
                type="number"
                min={0}
                value={ex.descansoSegundos}
                onChange={e => onUpdate(ex => ({ ...ex, descansoSegundos: parseInt(e.target.value, 10) || 0 }))}
              />
            </div>
          </div>

          {/* Imagem URL */}
          <div>
            <label className="label-xs">URL DA IMAGEM / GIF</label>
            <div className="flex gap-2 mt-1 items-start">
              <input
                className="input flex-1"
                placeholder="https://exemplo.com/exercicio.gif"
                value={ex.exercicio.gifUrl ?? ''}
                onChange={e => setField('gifUrl', e.target.value || undefined)}
              />
              {ex.exercicio.gifUrl && (
                <img
                  src={ex.exercicio.gifUrl}
                  alt={ex.exercicio.nome}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-[var(--color-surface-2)]"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
            </div>
          </div>

          {/* Instruções */}
          <div>
            <label className="label-xs">INSTRUÇÕES (uma por linha)</label>
            <textarea
              className="input mt-1 text-sm leading-relaxed"
              rows={3}
              placeholder="Ex: Deite no banco&#10;Desça a barra devagar"
              value={(ex.exercicio.instrucoes ?? []).join('\n')}
              onChange={e => setField('instrucoes', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
            />
          </div>

          {/* Notas */}
          <div>
            <label className="label-xs">NOTAS / OBSERVAÇÕES</label>
            <input
              className="input mt-1"
              placeholder="Ex: Focar na contração"
              value={ex.notas ?? ''}
              onChange={e => onUpdate(ex => ({ ...ex, notas: e.target.value || undefined }))}
            />
          </div>

          {/* Series */}
          <div>
            <label className="label-xs mb-2 block">SÉRIES</label>
            <div className="flex flex-col gap-1.5">
              {/* Header */}
              <div className="grid grid-cols-[24px_1fr_1fr_32px] gap-2 px-1">
                <span />
                <span className="text-[10px] text-[var(--color-text-muted)] font-semibold text-center uppercase tracking-wide">Peso (kg)</span>
                <span className="text-[10px] text-[var(--color-text-muted)] font-semibold text-center uppercase tracking-wide">Reps</span>
                <span />
              </div>
              {series.map((sr, sIdx) => (
                <div key={sIdx} className="grid grid-cols-[24px_1fr_1fr_32px] gap-2 items-center">
                  <span className="text-[10px] text-[var(--color-text-subtle)] font-bold text-center">{sIdx + 1}</span>
                  <input
                    className="input py-1.5 text-center text-sm"
                    type="number"
                    min={0}
                    step={0.5}
                    value={sr.peso}
                    onChange={e => setSerie(sIdx, 'peso', e.target.value)}
                  />
                  <input
                    className="input py-1.5 text-center text-sm"
                    type="number"
                    min={1}
                    value={sr.repeticoes}
                    onChange={e => setSerie(sIdx, 'repeticoes', e.target.value)}
                  />
                  <button
                    onClick={() => removeSerie(sIdx)}
                    disabled={series.length <= 1}
                    className="flex items-center justify-center text-[var(--color-danger)] opacity-60 hover:opacity-100 disabled:opacity-20"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={addSerie}
                className="mt-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-[var(--color-border-strong)] text-xs text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
              >
                <Plus size={13} />
                Adicionar série
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── PlanoEditCard ─────────────────────────────────────────────────────────────

function PlanoEditCard({
  plano,
  expandedExs,
  onToggleEx,
  onChange,
  onRemove,
}: {
  plano: PlanoEditado
  expandedExs: Set<string>
  onToggleEx: (id: string) => void
  onChange: (fn: (p: PlanoEditado) => PlanoEditado) => void
  onRemove: () => void
}) {
  const totalExs = plano.exercicios.length
  const totalSeries = plano.exercicios.reduce((acc, e) => acc + (e.seriesDetalhadas?.length ?? e.series), 0)

  return (
    <div className="card overflow-hidden">
      {/* Plan header */}
      <div className="flex items-center gap-3 p-4 bg-[var(--color-surface-2)]/60">
        <button
          onClick={() => onChange(p => ({ ...p, collapsed: !p.collapsed }))}
          className="text-[var(--color-text-muted)]"
        >
          {plano.collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
        <div className="flex-1 min-w-0">
          <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block">
            NOME DO PLANO
          </label>
          <input
            className="input py-1.5 text-sm font-semibold w-full"
            value={plano.nome}
            onChange={e => onChange(p => ({ ...p, nome: e.target.value }))}
            onClick={e => e.stopPropagation()}
          />
        </div>
        <button onClick={onRemove} className="p-2 text-[var(--color-danger)] opacity-60 hover:opacity-100 flex-shrink-0">
          <Trash2 size={16} />
        </button>
      </div>

      {!plano.collapsed && (
        <div className="p-3 flex flex-col gap-2">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">
            {totalExs} exercício{totalExs !== 1 ? 's' : ''} · {totalSeries} série{totalSeries !== 1 ? 's' : ''} no total
          </p>
          {plano.exercicios.map((ex, i) => (
            <ExercicioEditCard
              key={ex.id}
              ex={ex}
              idx={i}
              expanded={expandedExs.has(ex.id)}
              onToggle={() => onToggleEx(ex.id)}
              onUpdate={fn => onChange(p => ({
                ...p,
                exercicios: p.exercicios.map(e => e.id === ex.id ? fn(e) : e),
              }))}
              onRemove={() => onChange(p => ({ ...p, exercicios: p.exercicios.filter(e => e.id !== ex.id) }))}
            />
          ))}
          {plano.exercicios.length === 0 && (
            <p className="text-xs text-[var(--color-text-subtle)] text-center py-4">
              Nenhum exercício. Remova este plano ou adicione exercícios manualmente.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── ImportarCsvPage ───────────────────────────────────────────────────────────

function ImportarCsvPage() {
  const navigate = useNavigate()
  const { criarPlano, atualizarPlano } = usePlanos()
  const user = useAuthStore(s => s.user)
  const inputRef = useRef<HTMLInputElement>(null)
  const [planos, setPlanos] = useState<PlanoEditado[] | null>(null)
  const [erros, setErros] = useState<string[]>([])
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [expandedExs, setExpandedExs] = useState<Set<string>>(new Set())

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const texto = e.target?.result as string
      const resultado = parsearCsv(texto)
      setPlanos(resultado.planos.map(p => ({ ...p, collapsed: false })))
      setErros(resultado.erros)
      setExpandedExs(new Set())
    }
    reader.readAsText(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.csv')) handleFile(file)
  }

  const toggleExpandEx = (exId: string) =>
    setExpandedExs(prev => {
      const next = new Set(prev)
      if (next.has(exId)) next.delete(exId)
      else next.add(exId)
      return next
    })

  const changePlano = (planoId: string) => (fn: (p: PlanoEditado) => PlanoEditado) =>
    setPlanos(prev => prev?.map(p => p.id === planoId ? fn(p) : p) ?? null)

  const salvar = async () => {
    if (!planos || !user) return
    const validos = planos.filter(p => p.nome.trim() && p.exercicios.length > 0)
    if (validos.length === 0) {
      toast.error('Nenhum plano válido para salvar.')
      return
    }
    setSalvando(true)
    try {
      for (const planoData of validos) {
        const exerciciosComUser = await Promise.all(
          planoData.exercicios.map(async (ex) => {
            const exFinal = { ...ex.exercicio, userId: user.uid }
            await salvarExercicioPersonalizado(exFinal)
            syncExercicioParaFirestore(exFinal)
            return { ...ex, exercicio: exFinal }
          }),
        )
        const plano = await criarPlano(planoData.nome.trim())
        await atualizarPlano({ ...plano, exercicios: exerciciosComUser })
      }
      setSucesso(true)
      setTimeout(() => navigate({ to: '/treinos' }), 1500)
    } catch (e) {
      console.error(e)
      toast.error('Erro ao salvar planos.')
    } finally {
      setSalvando(false)
    }
  }

  const planosValidos = planos?.filter(p => p.nome.trim() && p.exercicios.length > 0) ?? []

  return (
    <div className="page-container pt-4 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-fade-up">
        <button
          onClick={() => navigate({ to: '/treinos' })}
          className="w-10 h-10 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-muted)]"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-[var(--color-text)]">Importar CSV</h1>
        {planos && (
          <span className="ml-auto text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
            {planos.length} plano{planos.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {sucesso ? (
        <div className="flex flex-col items-center gap-4 mt-16 animate-scale-in">
          <CheckCircle size={48} className="text-[var(--color-success)]" />
          <p className="text-[var(--color-text)] font-semibold text-lg">
            {planosValidos.length > 1
              ? `${planosValidos.length} planos criados com sucesso!`
              : 'Plano criado com sucesso!'}
          </p>
          <p className="text-[var(--color-text-muted)] text-sm">Redirecionando...</p>
        </div>
      ) : (
        <>
          {/* Template info */}
          <div className="card p-4 mb-4 animate-fade-up">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-3">
                <h2 className="text-sm font-bold text-[var(--color-text)]">Formato do CSV</h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Use a coluna <strong>plano</strong> para criar múltiplos planos de uma só vez.
                  Separe reps/pesos com ponto e vírgula (;) e instruções com pipe (|).
                </p>
              </div>
              <button
                onClick={downloadTemplateCsv}
                className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 flex-shrink-0"
              >
                <Download size={14} />
                Template
              </button>
            </div>
            <pre className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-surface-2)] p-3 rounded-xl overflow-x-auto font-mono">
              {`plano,nome_exercicio,grupo_muscular,series,repeticoes,peso_kg,...`}
            </pre>
          </div>

          {/* Drop zone */}
          {!planos && (
            <div
              className="border-2 border-dashed border-[var(--color-border-strong)] rounded-2xl p-10 text-center cursor-pointer hover:border-[var(--color-accent)] transition-colors animate-fade-up"
              style={{ animationDelay: '50ms' }}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
            >
              <FileUp size={36} className="mx-auto text-[var(--color-text-subtle)] mb-3" />
              <p className="text-[var(--color-text)] font-semibold text-sm">Solte o arquivo aqui</p>
              <p className="text-[var(--color-text-muted)] text-xs mt-1">ou clique para selecionar</p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
            </div>
          )}

          {/* Errors */}
          {erros.length > 0 && (
            <div className="mt-4 card p-4 border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.05)] animate-fade-up">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-[var(--color-danger)]" />
                <p className="text-sm font-semibold text-[var(--color-danger)]">
                  {erros.length} erro(s) encontrado(s)
                </p>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {erros.map((e, i) => (
                  <li key={i} className="text-xs text-[var(--color-text-muted)]">{e}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Plan editor */}
          {planos && (
            <div className="mt-4 animate-fade-up flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--color-text)]">
                  Revise e edite antes de salvar
                </h2>
                <button
                  onClick={() => { setPlanos(null); setErros([]) }}
                  className="btn-ghost p-2 text-[var(--color-text-muted)]"
                >
                  <X size={16} />
                </button>
              </div>

              {planos.map((plano) => (
                <PlanoEditCard
                  key={plano.id}
                  plano={plano}
                  expandedExs={expandedExs}
                  onToggleEx={toggleExpandEx}
                  onChange={changePlano(plano.id)}
                  onRemove={() => setPlanos(prev => prev?.filter(p => p.id !== plano.id) ?? null)}
                />
              ))}

              {planos.length === 0 && (
                <p className="text-xs text-[var(--color-text-muted)] text-center py-6">
                  Todos os planos foram removidos.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Sticky save button */}
      {planos && !sucesso && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--color-bg)]/90 backdrop-blur border-t border-[var(--color-border)] z-50">
          <button
            onClick={salvar}
            disabled={planosValidos.length === 0 || salvando}
            className="btn-primary w-full disabled:opacity-40"
          >
            {salvando
              ? 'Criando planos...'
              : planosValidos.length === 1
                ? `Criar "${planosValidos[0].nome}"`
                : `Criar ${planosValidos.length} planos`}
          </button>
        </div>
      )}
    </div>
  )
}
