import { useNavigate } from '@tanstack/react-router'
import { X, Trophy, Share2 } from 'lucide-react'
import { formatarTempo } from '../../../lib/notifications'
import type { SessaoDeTreino } from '../../../types'

interface TreinoRelatorioScreenProps {
  relatorio: SessaoDeTreino
  gerandoImagem: boolean
  copiado: boolean
  onCompartilhar: (s: SessaoDeTreino) => void
}

export function TreinoRelatorioScreen({
  relatorio,
  gerandoImagem,
  copiado,
  onCompartilhar,
}: TreinoRelatorioScreenProps) {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 z-200 flex flex-col bg-bg overflow-y-auto">
      <div
        className="flex justify-end px-4 pt-4 pb-2"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: '/treinos' })}
          className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-muted"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-col items-center pt-2 pb-6 px-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-[rgba(34,197,94,0.15)] flex items-center justify-center mb-4 animate-trophy-bounce">
          <Trophy size={36} className="text-success" />
        </div>
        <h1 className="text-2xl font-bold text-text animate-celebration-pulse">Treino Concluído!</h1>
        <p className="text-text-muted text-sm mt-1">{relatorio.planoNome}</p>
        <p className="text-text-subtle text-xs mt-0.5 capitalize">
          {new Date(relatorio.iniciadoEm).toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 px-4 mb-6">
        {[
          {
            label: 'Duração',
            value: relatorio.duracaoSegundos ? formatarTempo(relatorio.duracaoSegundos) : '–',
          },
          {
            label: 'Volume (kg)',
            value: relatorio.volumeTotal ? Math.round(relatorio.volumeTotal) : '–',
          },
          {
            label: 'Séries ✓',
            value: relatorio.exercicios.reduce(
              (a, ex) => a + ex.series.filter(s => s.completada).length,
              0
            ),
          },
        ].map((stat, i) => (
          <div key={i} className="card p-3 text-center">
            <p className="text-xl font-bold text-text">{stat.value}</p>
            <p className="text-[10px] text-text-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 px-4 mb-6">
        {relatorio.exercicios.map(ex => {
          const seriesOk = ex.series.filter(s => s.completada)
          return (
            <div key={ex.exercicioId} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm text-text">{ex.exercicioNome}</p>
                <span className="text-xs text-text-muted">
                  {seriesOk.length}/{ex.series.length} séries
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {seriesOk.map((sr, i) => (
                  <span
                    key={i}
                    className="text-xs bg-surface-2 text-text-muted px-2 py-0.5 rounded-lg"
                  >
                    {sr.peso ?? 0}kg × {sr.repeticoes ?? 0}
                  </span>
                ))}
                {seriesOk.length === 0 && (
                  <span className="text-xs text-text-subtle italic">Nenhuma série completada</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div
        className="flex flex-col gap-3 px-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2.5rem)' }}
      >
        <button
          type="button"
          className="btn-primary w-full py-4 flex items-center justify-center gap-2"
          onClick={() => onCompartilhar(relatorio)}
          disabled={gerandoImagem}
        >
          {gerandoImagem ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Gerando imagem...
            </>
          ) : copiado ? (
            <>
              <Share2 size={18} />
              Imagem salva!
            </>
          ) : (
            <>
              <Share2 size={18} />
              Compartilhar como Imagem
            </>
          )}
        </button>
        <button type="button" className="btn-ghost w-full py-3" onClick={() => navigate({ to: '/historico' })}>
          Ver Histórico
        </button>
      </div>
    </div>
  )
}
