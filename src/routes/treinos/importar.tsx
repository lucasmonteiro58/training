import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { parsearCsv } from '../../lib/csvImport'
import { usePlanos } from '../../hooks/usePlanos'
import { useAuthStore } from '../../stores'
import { salvarExercicioPersonalizado } from '../../lib/db/dexie'
import { syncExercicioParaFirestore } from '../../lib/firestore/sync'
import { carregarExercicios } from '../../lib/exercises/freeExerciseDb'
import { toast } from 'sonner'
import type { Exercicio } from '../../types'
import { X } from 'lucide-react'
import type { PlanoEditado } from './components/-PlanoEditCard'
import { PlanoEditCard } from './components/-PlanoEditCard'
import { ImportarHeader } from './components/-ImportarHeader'
import { ImportarSucesso } from './components/-ImportarSucesso'
import { FormatoCsvCard } from './components/-FormatoCsvCard'
import { ImportarDropZone } from './components/-ImportarDropZone'
import { ErrosImportacao } from './components/-ErrosImportacao'

export const Route = createFileRoute('/treinos/importar')({
  component: ImportarCsvPage,
})

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
  const [exerciciosDb, setExerciciosDb] = useState<Exercicio[]>([])

  useEffect(() => {
    carregarExercicios().then(setExerciciosDb)
  }, [])

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const texto = e.target?.result as string
      const resultado = parsearCsv(texto, exerciciosDb)
      setPlanos(resultado.planos.map(p => ({ ...p, collapsed: false })))
      setErros(resultado.erros)
      setExpandedExs(new Set())
    }
    reader.readAsText(file)
  }

  const toggleExpandEx = (exId: string) =>
    setExpandedExs(prev => {
      const next = new Set(prev)
      if (next.has(exId)) next.delete(exId)
      else next.add(exId)
      return next
    })

  const changePlano = (planoId: string) => (fn: (p: PlanoEditado) => PlanoEditado) =>
    setPlanos(prev => prev?.map(p => (p.id === planoId ? fn(p) : p)) ?? null)

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
          planoData.exercicios.map(async ex => {
            if (ex.exercicio.personalizado === false) return ex
            const exFinal = { ...ex.exercicio, userId: user.uid }
            await salvarExercicioPersonalizado(exFinal)
            syncExercicioParaFirestore(exFinal)
            return { ...ex, exercicio: exFinal }
          })
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
    <div className="page-container pt-4 pb-[450px]">
      <ImportarHeader onBack={() => navigate({ to: '/treinos' })} planosCount={planos?.length} />

      {sucesso ? (
        <ImportarSucesso planosCount={planosValidos.length} />
      ) : (
        <>
          <FormatoCsvCard />

          {!planos && (
            <ImportarDropZone inputRef={inputRef} onFile={handleFile} />
          )}

          <ErrosImportacao erros={erros} />

          {planos && (
            <div className="mt-4 animate-fade-up flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-text">Revise e edite antes de salvar</h2>
                <button
                  type="button"
                  onClick={() => {
                    setPlanos(null)
                    setErros([])
                  }}
                  className="btn-ghost p-2 text-text-muted"
                >
                  <X size={16} />
                </button>
              </div>

              {planos.map(plano => (
                <PlanoEditCard
                  key={plano.id}
                  plano={plano}
                  expandedExs={expandedExs}
                  onToggleEx={toggleExpandEx}
                  onChange={changePlano(plano.id)}
                  onRemove={() =>
                    setPlanos(prev => prev?.filter(p => p.id !== plano.id) ?? null)
                  }
                />
              ))}

              {planos.length === 0 && (
                <p className="text-xs text-text-muted text-center py-6">
                  Todos os planos foram removidos.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {planos && !sucesso && (
        <div
          className="fixed left-0 right-0 p-4 bg-bg/90 backdrop-blur border-t border-border z-60"
          style={{ bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            type="button"
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
