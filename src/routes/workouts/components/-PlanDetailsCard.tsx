import { PLAN_COLORS } from '../../../types'

interface PlanDetailsCardProps {
  name: string
  onNameChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  selectedColor: string
  onColorChange: (color: string) => void
}

export function PlanDetailsCard({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  selectedColor,
  onColorChange,
}: PlanDetailsCardProps) {
  return (
    <div className="card p-4 mb-4 animate-fade-up">
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-text-muted font-medium mb-1.5 block">NOME DO PLANO *</label>
          <input
            className="input"
            placeholder="Ex: Treino A – Peito e Tríceps"
            value={name}
            onChange={e => onNameChange(e.target.value)}
            maxLength={60}
          />
        </div>
        <div>
          <label className="text-xs text-text-muted font-medium mb-1.5 block">
            DESCRIÇÃO (opcional)
          </label>
          <textarea
            className="input resize-none"
            placeholder="Ex: Foco em hipertrofia..."
            rows={2}
            value={description}
            onChange={e => onDescriptionChange(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-text-muted font-medium mb-1.5 block">COR</label>
          <div className="flex gap-2 flex-wrap">
            {PLAN_COLORS.map(color => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-full transition-transform ${
                  selectedColor === color
                    ? 'scale-105 ring-2 ring-offset-2 ring-offset-surface ring-white'
                    : 'opacity-60 hover:opacity-100 hover:scale-110'
                }`}
                style={{ background: color }}
                onClick={() => onColorChange(color)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
