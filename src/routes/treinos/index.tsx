import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { usePlanos } from '../../hooks/usePlanos'
import { Dumbbell, Plus, FileUp, Play, ChevronRight, Clock, Trash2, Archive, ArchiveRestore } from 'lucide-react'
import { useState } from 'react'

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
    desarquivarPlano
  } = usePlanos()
  const [deletando, setDeletando] = useState<string | null>(null)
  const [processando, setProcessando] = useState<string | null>(null)
  const [mostrarArquivados, setMostrarArquivados] = useState(false)
  const navigate = useNavigate()

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
    <div className="page-container pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Meus Treinos</h1>
        <div className="flex gap-2 items-center">
          <Link to="/treinos/importar" style={{ textDecoration: 'none' }}>
            <button
              className="btn-ghost flex items-center gap-1.5 text-sm"
              title="Importar CSV"
            >
              <FileUp size={16} />
              CSV
            </button>
          </Link>
          <Link to="/treinos/novo" style={{ textDecoration: 'none' }}>
            <button className="btn-primary flex items-center gap-1.5 py-2.5 px-4 text-sm">
              <Plus size={16} />
              Novo
            </button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : planosAtivos.length === 0 && planosArquivados.length === 0 ? (
        <div className="flex flex-col items-center gap-6 mt-16 animate-scale-in">
          <div className="w-20 h-20 rounded-3xl bg-[var(--color-surface-2)] flex items-center justify-center">
            <Dumbbell size={36} className="text-[var(--color-text-subtle)]" />
          </div>
          <div className="text-center">
            <p className="text-[var(--color-text)] font-semibold text-lg">Nenhum plano ainda</p>
            <p className="text-[var(--color-text-muted)] text-sm mt-1">
              Crie seu primeiro plano ou importe via CSV
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Link to="/treinos/novo" style={{ textDecoration: 'none' }}>
              <button className="btn-primary w-full">Criar Plano</button>
            </Link>
            <Link to="/treinos/importar" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary w-full">
                <FileUp size={16} />
                Importar CSV
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Planos Ativos */}
          <div className="flex flex-col gap-3">
            {planosAtivos.length === 0 && (
              <p className="text-center text-[var(--color-text-muted)] text-sm py-8">
                Nenhum treino ativo no momento.
              </p>
            )}
            {planosAtivos.map((plano, idx) => (
              <div
                key={plano.id}
                className="card p-4 animate-fade-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${plano.cor ?? '#6366f1'}22` }}
                  >
                    <Dumbbell size={20} style={{ color: plano.cor ?? '#6366f1' }} />
                  </div>

                  <Link
                    to="/treinos/$planoId"
                    params={{ planoId: plano.id }}
                    className="flex-1 min-w-0"
                    style={{ textDecoration: 'none' }}
                  >
                    <p className="text-[var(--color-text)] font-semibold truncate">{plano.nome}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {plano.exercicios.length} exercícios
                      </span>
                    </div>
                  </Link>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link to="/treino-ativo/$planoId" params={{ planoId: plano.id }} style={{ textDecoration: 'none' }}>
                      <button className="w-10 h-10 rounded-xl bg-[var(--color-accent)] flex items-center justify-center hover:bg-[var(--color-accent-hover)] transition-colors">
                        <Play size={14} className="text-white ml-0.5" />
                      </button>
                    </Link>
                    <button
                      className="w-10 h-10 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-subtle)] hover:text-[var(--color-accent)] hover:bg-[rgba(99,102,241,0.1)] transition-colors"
                      onClick={() => handleArchive(plano.id)}
                      disabled={processando === plano.id}
                      title="Arquivar"
                    >
                      <Archive size={14} />
                    </button>
                  </div>
                </div>

                {plano.exercicios.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {[...new Set(plano.exercicios.map((e) => e.exercicio.grupoMuscular))]
                      .slice(0, 4)
                      .map((grupo) => (
                        <span
                          key={grupo}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                        >
                          {grupo}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Seção Arquivados */}
          {planosArquivados.length > 0 && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setMostrarArquivados(!mostrarArquivados)}
                className="flex items-center justify-between px-2 py-1 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Archive size={16} />
                  <span>Arquivados ({planosArquivados.length})</span>
                </div>
                <ChevronRight
                  size={16}
                  className={`transition-transform ${mostrarArquivados ? 'rotate-90' : ''}`}
                />
              </button>

              {mostrarArquivados && (
                <div className="flex flex-col gap-3 animate-fade-down">
                  {planosArquivados.map((plano) => (
                    <div
                      key={plano.id}
                      className="card p-4 opacity-70 grayscale-[0.5]"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--color-surface-2)]"
                        >
                          <Archive size={18} className="text-[var(--color-text-muted)]" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[var(--color-text)] font-semibold truncate text-sm">{plano.nome}</p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                            {plano.exercicios.length} exercícios
                          </p>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            className="w-9 h-9 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-subtle)] hover:text-[var(--color-accent)] transition-colors"
                            onClick={() => handleRestore(plano.id)}
                            disabled={processando === plano.id}
                            title="Desarquivar"
                          >
                            <ArchiveRestore size={14} />
                          </button>
                          <button
                            className="w-9 h-9 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-subtle)] hover:text-[var(--color-danger)] transition-colors"
                            onClick={() => handleDelete(plano.id, plano.nome)}
                            disabled={deletando === plano.id}
                            title="Excluir Permanentemente"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
