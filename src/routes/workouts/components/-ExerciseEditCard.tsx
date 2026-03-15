import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'
import type { ExerciseInPlan, PlanSet, SetType } from '../../../types'
import { MUSCLE_GROUPS } from '../../../types'

interface ExerciseEditCardProps {
  ex: ExerciseInPlan
  idx: number
  expanded: boolean
  onToggle: () => void
  onUpdate: (fn: (e: ExerciseInPlan) => ExerciseInPlan) => void
  onRemove: () => void
}

export function ExerciseEditCard({
  ex,
  idx,
  expanded,
  onToggle,
  onUpdate,
  onRemove,
}: ExerciseEditCardProps) {
  const [applyAll, setApplyAll] = useState<{
    field: 'peso' | 'repeticoes'
    sIdx: number
    value: number
  } | null>(null)
  const [buscandoImagem, setBuscandoImagem] = useState(false)
  const [imagensWeb, setImagensWeb] = useState<string[]>([])
  const [termoBusca, setTermoBusca] = useState(ex.exercise.name)

  const buscarImagem = async () => {
    if (!termoBusca.trim()) return
    setBuscandoImagem(true)
    setImagensWeb([])
    try {
      const key = import.meta.env.VITE_GIPHY_API_KEY
      if (!key) {
        toast.error('Chave da API Giphy não configurada. Adicione VITE_GIPHY_API_KEY no .env')
        return
      }
      const apiUrl = `https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${encodeURIComponent(termoBusca)}&limit=12&rating=g`
      const res = await fetch(apiUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const urls: string[] = (data.data ?? []).map(
        (gif: { images?: { original?: { url?: string }; downsized?: { url?: string } } }) =>
          gif?.images?.original?.url ?? gif?.images?.downsized?.url
      ).filter(Boolean)
      setImagensWeb(urls)
      if (urls.length === 0) {
        toast.info('Nenhuma imagem encontrada. Tente outro termo.')
      }
    } catch (e) {
      console.error(e)
      toast.error('Erro ao buscar imagens. Verifique sua conexão.')
    } finally {
      setBuscandoImagem(false)
    }
  }

  const series = ex.setsDetail ?? [{ weight: ex.targetWeight ?? 0, reps: ex.targetReps }]
  const tipo: SetType = ex.setType ?? 'reps'

  const setField = (field: string, value: unknown) =>
    onUpdate(e => ({ ...e, exercise: { ...e.exercise, [field]: value } }))

  const updateSerie = (sIdx: number, campo: Partial<PlanSet>) => {
    onUpdate(e => {
      const s = (e.setsDetail ?? []).map((sr, i) => (i === sIdx ? { ...sr, ...campo } : sr))
      return {
        ...e,
        setsDetail: s,
        series: s.length,
        targetReps: s[0]?.reps ?? 1,
        targetWeight: s[0]?.weight ?? 0,
      }
    })
    if (series.length > 1) {
      if ('weight' in campo && campo.weight !== undefined)
        setApplyAll({ field: 'weight', sIdx, value: campo.weight as number })
      else if ('reps' in campo && campo.reps !== undefined)
        setApplyAll({ field: 'reps', sIdx, value: campo.reps as number })
    }
  }

  const applyAllSeries = (toAll: boolean) => {
    if (!applyAll) return
    onUpdate(e => {
      const s = (e.setsDetail ?? []).map((sr, i) =>
        toAll || i > applyAll.sIdx ? { ...sr, [applyAll.field]: applyAll.value } : sr
      )
      return { ...e, setsDetail: s }
    })
    setApplyAll(null)
  }

  const addSerie = () =>
    onUpdate(e => {
      const last =
        (e.setsDetail ?? [])[e.setsDetail!.length - 1] ?? { weight: 0, reps: 12 }
      const s = [...(e.setsDetail ?? []), { ...last }]
      return { ...e, setsDetail: s, series: s.length }
    })

  const removeSerie = (sIdx: number) =>
    onUpdate(e => {
      const s = (e.setsDetail ?? []).filter((_, i) => i !== sIdx)
      if (s.length === 0) return e
      return { ...e, setsDetail: s, series: s.length, targetReps: s[0]?.reps ?? 1 }
    })

  const ciclo: SetType[] = ['reps', 'tempo', 'falha']
  const proximoTipo = ciclo[(ciclo.indexOf(tipo) + 1) % ciclo.length]
  const labelTipo: Record<SetType, string> = { reps: 'REPS', tempo: 'MIN', falha: 'FALHA ⚡' }
  const nextLabelTipo: Record<SetType, string> = { reps: 'Min', tempo: 'Falha', falha: 'Reps' }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 p-3">
        <span className="w-6 h-6 rounded-full bg-accent-subtle text-accent text-xs font-bold flex items-center justify-center shrink-0">
          {idx + 1}
        </span>
        <button type="button" className="flex-1 text-left min-w-0" onClick={onToggle}>
          <p className="text-sm font-medium text-text truncate">{ex.exercise.name}</p>
          <p className="text-xs text-text-muted mt-0.5">
            {series.length} série{series.length !== 1 ? 's' : ''} · {ex.exercise.muscleGroup} ·
            ⏱ {ex.restSeconds}s
          </p>
        </button>
        <button type="button" onClick={onRemove} className="p-1.5 text-danger opacity-60 hover:opacity-100 shrink-0">
          <Trash2 size={15} />
        </button>
        <button type="button" onClick={onToggle} className="p-1.5 text-text-muted shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border p-3 flex flex-col gap-3 bg-surface-2/40">
          <div>
            <label className="label-xs">NOME DO EXERCÍCIO</label>
            <input
              className="input mt-1"
              value={ex.exercise.name}
              onChange={e => setField('nome', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label-xs">GRUPO MUSCULAR</label>
              <select
                className="input mt-1 text-sm"
                value={ex.exercise.muscleGroup}
                onChange={e => setField('grupoMuscular', e.target.value)}
              >
                {MUSCLE_GROUPS.map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-xs">DESCANSO (s)</label>
              <input
                className="input mt-1"
                type="number"
                min={0}
                value={ex.restSeconds}
                onChange={e =>
                  onUpdate(ex => ({ ...ex, descansoSegundos: parseInt(e.target.value, 10) || 0 }))
                }
              />
            </div>
          </div>

          <div>
            <label className="label-xs">BUSCAR IMAGEM (WEB)</label>
            <div className="flex gap-2 mt-1">
              <input
                className="input flex-1"
                value={termoBusca}
                onChange={e => setTermoBusca(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && buscarImagem()}
                placeholder="Ex: bench press"
              />
              <button
                type="button"
                onClick={buscarImagem}
                disabled={buscandoImagem}
                className="btn-secondary px-4 shrink-0"
              >
                {buscandoImagem ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
              </button>
            </div>

            {imagensWeb.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3 p-2 bg-surface-2 rounded-xl max-h-48 overflow-y-auto">
                {imagensWeb.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setField('gifUrl', url)}
                    className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                      ex.exercise.gifUrl === url
                        ? 'border-accent  opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} className="w-full h-full object-cover" loading="lazy" alt="" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3">
              <label className="label-xs">URL DA IMAGEM / GIF</label>
              <div className="flex gap-2 mt-1 items-start">
                <input
                  className="input flex-1"
                  placeholder="https://exemplo.com/exercicio.gif"
                  value={ex.exercise.gifUrl ?? ''}
                  onChange={e => setField('gifUrl', e.target.value || undefined)}
                />
                {ex.exercise.gifUrl && (
                  <img
                    src={ex.exercise.gifUrl}
                    alt={ex.exercise.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 bg-surface-2"
                    onError={e => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="label-xs">INSTRUÇÕES (uma por linha)</label>
            <textarea
              className="input mt-1 text-sm leading-relaxed"
              rows={3}
              placeholder="Ex: Deite no banco&#10;Desça a barra devagar"
              value={(ex.exercise.instructions ?? []).join('\n')}
              onChange={e =>
                setField(
                  'instructions',
                  e.target.value
                    .split('\n')
                    .map(s => s.trim())
                    .filter(Boolean)
                )
              }
            />
          </div>

          <div>
            <label className="label-xs">NOTAS / OBSERVAÇÕES</label>
            <input
              className="input mt-1"
              placeholder="Ex: Focar na contração"
              value={ex.notes ?? ''}
              onChange={e => onUpdate(ex => ({ ...ex, notes: e.target.value || undefined }))}
            />
          </div>

          <div>
            <label className="label-xs mb-2 block">SÉRIES</label>
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 px-2 text-[10px] font-bold uppercase tracking-wider">
                <span className="text-center text-text-subtle">#</span>
                <span className="text-center text-text-subtle">PESO (KG)</span>
                <button
                  type="button"
                  onClick={() => {
                    const updates: Partial<ExerciseInPlan> = { setType: proximoTipo }
                    if (proximoTipo === 'tempo')
                      updates.setsDetail = series.map(s => ({ ...s, reps: 1 }))
                    onUpdate(e => ({ ...e, ...updates }))
                    setApplyAll(null)
                  }}
                  title={`Mudar para: ${nextLabelTipo[tipo]}`}
                  className={`flex items-center justify-center gap-1 rounded-md border px-1.5 py-0.5 transition-colors ${
                    tipo === 'reps'
                      ? 'text-text-muted border-border hover:text-accent hover:border-accent /50'
                      : 'text-accent border-accent /40 bg-accent/10'
                  }`}
                >
                  {labelTipo[tipo]}
                  <RefreshCw size={8} className="opacity-60" />
                </button>
                <span />
              </div>

              <div className="flex flex-col gap-2">
                {series.map((sr, sIdx) => (
                  <div
                    key={sIdx}
                    className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 items-center bg-surface-2/50 p-1 rounded-lg"
                  >
                    <span className="text-[11px] font-bold text-text-muted text-center">
                      {sIdx + 1}
                    </span>
                    <input
                      type="number"
                      className="set-input h-9! py-0! text-sm!"
                      value={sr.weight === 0 ? '' : sr.weight}
                      onChange={e =>
                        updateSerie(sIdx, {
                          weight: e.target.value === '' ? 0 : parseFloat(e.target.value),
                        })
                      }
                      onFocus={e => e.target.select()}
                      placeholder="0"
                      step={0.5}
                    />
                    <input
                      type="number"
                      className="set-input h-9! py-0! text-sm!"
                      value={sr.reps === 0 ? '' : sr.reps}
                      onChange={e =>
                        updateSerie(sIdx, {
                          reps:
                            e.target.value === ''
                              ? 0
                              : tipo === 'tempo'
                                ? parseFloat(e.target.value)
                                : parseInt(e.target.value, 10),
                        })
                      }
                      onFocus={e => e.target.select()}
                      placeholder={
                        tipo === 'falha' ? 'Falha' : tipo === 'tempo' ? '0.0' : '0'
                      }
                      step={tipo === 'tempo' ? '0.5' : '1'}
                    />
                    <button
                      type="button"
                      onClick={() => removeSerie(sIdx)}
                      disabled={series.length <= 1}
                      className="btn-ghost p-1.5 text-text-subtle hover:text-danger disabled:opacity-20"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {applyAll && (
                <div className="bg-accent/10 border border-accent /20 rounded-xl px-3 py-2.5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-text-muted">
                      Repetir{' '}
                      <strong className="text-text">
                        {applyAll.field === 'weight'
                          ? `${applyAll.value} kg`
                          : tipo === 'tempo'
                            ? `${applyAll.value} min`
                            : `${applyAll.value} reps`}
                      </strong>{' '}
                      em:
                    </p>
                    <button
                      type="button"
                      onClick={() => setApplyAll(null)}
                      className="w-5 h-5 flex items-center justify-center rounded-full text-text-subtle hover:text-text hover:bg-surface-2 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    {applyAll.sIdx < series.length - 1 && (
                      <button
                        type="button"
                        onClick={() => applyAllSeries(false)}
                        className="flex-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-accent bg-accent/10 border border-accent /20"
                      >
                        ↓ Seguintes
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => applyAllSeries(true)}
                      className="flex-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-accent"
                    >
                      Todas
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={addSerie}
                className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-accent hover:bg-accent/5 rounded-lg border border-dashed border-accent /20 transition-colors"
              >
                <Plus size={14} />
                Adicionar Série
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
