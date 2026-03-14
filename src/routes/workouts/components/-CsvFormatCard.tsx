import { Download } from 'lucide-react'
import { downloadTemplateCsv } from '../../../lib/csvImport'

export function CsvFormatCard() {
  return (
    <div className="card p-4 mb-4 animate-fade-up">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-3">
          <h2 className="text-sm font-bold text-text">Formato do CSV</h2>
          <p className="text-xs text-text-muted mt-1">
            Use a coluna <strong>id</strong> para vincular ao banco de exercícios. Se o nome for
            exatamente igual, o exercício também será reconhecido automaticamente. Use a coluna{' '}
            <strong>plano</strong> para criar múltiplos planos de uma só vez. Separe reps/pesos com
            ponto e vírgula (;) e instruções com pipe (|).
          </p>
        </div>
        <button
          type="button"
          onClick={downloadTemplateCsv}
          className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 shrink-0"
        >
          <Download size={14} />
          Template
        </button>
      </div>
      <pre className="text-[10px] text-text-muted bg-surface-2 p-3 rounded-xl overflow-x-auto font-mono">
        {`id,plano,nome_exercicio,grupo_muscular,series,repeticoes,peso_kg,...`}
      </pre>
    </div>
  )
}
