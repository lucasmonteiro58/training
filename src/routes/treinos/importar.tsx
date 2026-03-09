import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { parsearCsv, downloadTemplateCsv, CSV_TEMPLATE } from '../../lib/csvImport'
import { usePlanos } from '../../hooks/usePlanos'
import { ArrowLeft, FileUp, Download, CheckCircle, AlertCircle, X } from 'lucide-react'
import type { ExercicioNoPlano } from '../../types'

export const Route = createFileRoute('/treinos/importar')({
  component: ImportarCsvPage,
})

function ImportarCsvPage() {
  const navigate = useNavigate()
  const { criarPlano, atualizarPlano } = usePlanos()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<ExercicioNoPlano[] | null>(null)
  const [erros, setErros] = useState<string[]>([])
  const [nomePlano, setNomePlano] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const texto = e.target?.result as string
      const resultado = parsearCsv(texto)
      setPreview(resultado.exercicios)
      setErros(resultado.erros)
    }
    reader.readAsText(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.csv')) handleFile(file)
  }

  const salvar = async () => {
    if (!preview || !nomePlano.trim()) return
    setSalvando(true)
    try {
      const plano = await criarPlano(nomePlano.trim())
      await atualizarPlano({ ...plano, exercicios: preview })
      setSucesso(true)
      setTimeout(() => navigate({ to: '/treinos' }), 1500)
    } catch {
      alert('Erro ao salvar plano.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="page-container pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-fade-up">
        <button onClick={() => navigate({ to: '/treinos' })}
          className="w-10 h-10 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-muted)]">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-[var(--color-text)]">Importar CSV</h1>
      </div>

      {sucesso ? (
        <div className="flex flex-col items-center gap-4 mt-16 animate-scale-in">
          <CheckCircle size={48} className="text-[var(--color-success)]" />
          <p className="text-[var(--color-text)] font-semibold text-lg">Plano criado com sucesso!</p>
          <p className="text-[var(--color-text-muted)] text-sm">Redirecionando...</p>
        </div>
      ) : (
        <>
          {/* Template */}
          <div className="card p-4 mb-4 animate-fade-up">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-[var(--color-text)]">Formato do CSV</h2>
                <p className="text-xs text-text-muted mt-1">
                  Use ponto e vírgula (;) para repetições ou pesos diferentes por série (ex: 10;10;8).
                </p>
              </div>
              <button onClick={downloadTemplateCsv}
                className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5">
                <Download size={14} />
                Template
              </button>
            </div>
            <pre className="text-[10px] text-text-muted bg-surface-2 p-3 rounded-xl overflow-x-auto font-mono">
              {`nome_exercicio,grupo_muscular,series,\nrepeticoes,peso_kg,descanso_segundos`}
            </pre>
          </div>

          {/* Drop zone */}
          {!preview && (
            <div
              className="border-2 border-dashed border-[var(--color-border-strong)] rounded-2xl p-10 text-center cursor-pointer hover:border-[var(--color-accent)] transition-colors animate-fade-up"
              style={{ animationDelay: '50ms' }}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
            >
              <FileUp size={36} className="mx-auto text-[var(--color-text-subtle)] mb-3" />
              <p className="text-[var(--color-text)] font-semibold text-sm">
                Solte o arquivo aqui
              </p>
              <p className="text-[var(--color-text-muted)] text-xs mt-1">ou clique para selecionar</p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
            </div>
          )}

          {/* Erros */}
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

          {/* Preview */}
          {preview && preview.length > 0 && (
            <div className="mt-4 animate-fade-up">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[var(--color-text)]">
                  Preview – {preview.length} exercícios
                </h2>
                <button onClick={() => { setPreview(null); setErros([]) }} className="btn-ghost p-2 text-[var(--color-text-muted)]">
                  <X size={16} />
                </button>
              </div>

              <div className="card p-4 mb-4">
                <label className="text-xs text-[var(--color-text-muted)] font-medium mb-1.5 block">
                  NOME DO PLANO *
                </label>
                <input className="input" placeholder="Ex: Meu treino da semana"
                  value={nomePlano} onChange={(e) => setNomePlano(e.target.value)} />
              </div>

              <div className="flex flex-col gap-2 mb-4">
                {preview.map((ex, i) => (
                  <div key={i} className="card p-3 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--color-text)] text-sm font-medium truncate">{ex.exercicio.nome}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {ex.series}×{ex.repeticoesMeta}
                        {ex.pesoMeta ? ` · ${ex.pesoMeta}kg` : ''} · ⏱{ex.descansoSegundos}s
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] flex-shrink-0">
                      {ex.exercicio.grupoMuscular}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={salvar}
                disabled={!nomePlano.trim() || salvando}
                className="btn-primary w-full disabled:opacity-40"
              >
                {salvando ? 'Criando plano...' : 'Criar Plano com esses Exercícios'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
