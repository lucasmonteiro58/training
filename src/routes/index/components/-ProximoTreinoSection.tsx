import { Zap, Play } from 'lucide-react'
import { useStartWorkout } from '../../../hooks/useStartWorkout'

interface ProximoTreinoSectionProps {
  proximoPlano: { id: string; nome: string; cor?: string | null; exercicios: unknown[] }
  ultimaSessao: { planoId: string } | undefined
}

export function ProximoTreinoSection({
  proximoPlano,
  ultimaSessao,
}: ProximoTreinoSectionProps) {
  const { handleIniciar, modal } = useStartWorkout()

  return (
    <>
      <div className="mb-6 animate-fade-up" style={{ animationDelay: '112ms' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-text">Próximo Treino</h2>
          {ultimaSessao && (
            <span className="text-[10px] text-text-subtle font-medium">
              baseado no último concluído
            </span>
          )}
        </div>
        <div className="card p-4 flex items-center justify-between border border-accent/30">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: proximoPlano.cor ?? '#6366f1' }}
            >
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-text font-bold text-sm">{proximoPlano.nome}</p>
              <p className="text-text-muted text-xs mt-0.5">
                {proximoPlano.exercicios.length} exercícios
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 bg-accent text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-accent-hover active:scale-95 transition-all"
            onClick={() => handleIniciar(proximoPlano.id)}
          >
            <Play size={14} className="ml-0.5" /> Iniciar
          </button>
        </div>
      </div>
      {modal}
    </>
  )
}
