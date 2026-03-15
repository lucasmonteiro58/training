import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from '../../stores'
import { getUserConfig, saveUserConfig } from '../../lib/firestore/sync'
import { useState, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/profile/optional-days')({
  component: OptionalDaysPage,
})

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const STORAGE_KEY = 'diasOpcionais'

function parseSaved(value: string | null): number[] {
  if (!value) return []
  try {
    const arr = JSON.parse(value) as unknown
    if (!Array.isArray(arr)) return []
    return arr.filter((n): n is number => typeof n === 'number' && n >= 0 && n <= 6)
  } catch {
    return []
  }
}

function OptionalDaysPage() {
  const user = useAuthStore((s) => s.user)
  const [days, setDays] = useState<number[]>(() => parseSaved(localStorage.getItem(STORAGE_KEY)))

  useEffect(() => {
    if (!user) return
    getUserConfig(user.uid).then(config => {
      if (config.diasOpcionais && config.diasOpcionais.length > 0) {
        setDays(config.diasOpcionais)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config.diasOpcionais))
      }
    })
  }, [user])

  const toggle = (day: number) => {
    const next = days.includes(day) ? days.filter(d => d !== day) : [...days, day].sort((a, b) => a - b)
    setDays(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    if (user) {
      saveUserConfig(user.uid, { diasOpcionais: next }).catch(() => {
        toast.error('Falha ao sincronizar. Tente de novo.')
      })
    }
    toast.success(next.length ? 'Dias opcionais atualizados.' : 'Nenhum dia opcional.')
  }

  return (
    <div className="page-container pt-6">
      <header className="flex items-center gap-3 mb-6">
        <Link
          to="/profile"
          className="p-2 -ml-2 rounded-xl hover:bg-surface-2 transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft size={24} className="text-text" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-text">Dias opcionais</h1>
          <p className="text-sm text-text-muted">
            Dias que você pode pular sem perder a sequência
          </p>
        </div>
      </header>

      <div className="card p-1 mb-4">
        <p className="text-xs text-text-muted px-4 py-3">
          Toque para marcar os dias que você pode pular. Eles não contam para a meta nem para as conquistas.
        </p>
        {DAY_NAMES.map((name, idx) => {
          const isOptional = days.includes(idx)
          return (
            <button
              key={idx}
              type="button"
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-surface-2 rounded-xl transition-colors text-left"
            >
              <span className="text-text font-medium">{name}</span>
              <div
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                  isOptional ? 'bg-accent' : 'bg-border-strong'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    isOptional ? 'left-5' : 'left-0.5'
                  }`}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
