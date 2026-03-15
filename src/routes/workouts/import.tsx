import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { parseCsv } from '../../lib/csvImport'
import { usePlans } from '../../hooks/usePlans'
import { useAuthStore } from '../../stores'
import { savePersonalizedExercise } from '../../lib/db/dexie'
import { syncExerciseToFirestore } from '../../lib/firestore/sync'
import { loadExercises } from '../../lib/exercises/freeExerciseDb'
import { toast } from 'sonner'
import type { Exercise } from '../../types'
import { X } from 'lucide-react'
import type { EditedPlan } from './components/-PlanEditCard'
import { PlanEditCard } from './components/-PlanEditCard'
import { ImportHeader } from './components/-ImportHeader'
import { ImportSuccess } from './components/-ImportSuccess'
import { CsvFormatCard } from './components/-CsvFormatCard'
import { ImportDropZone } from './components/-ImportDropZone'
import { ImportErrors } from './components/-ImportErrors'

export const Route = createFileRoute('/workouts/import')({
  component: ImportCsvPage,
})

function ImportCsvPage() {
  const navigate = useNavigate()
  const { createPlan, updatePlanById } = usePlans()
  const user = useAuthStore(s => s.user)
  const inputRef = useRef<HTMLInputElement>(null)
  const [plans, setPlans] = useState<EditedPlan[] | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [expandedExs, setExpandedExs] = useState<Set<string>>(new Set())
  const [exerciseDb, setExerciseDb] = useState<Exercise[]>([])

  useEffect(() => {
    loadExercises().then(setExerciseDb)
  }, [])

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const result = parseCsv(text, exerciseDb)
      setPlans(result.plans.map(p => ({ ...p, collapsed: false })))
      setErrors(result.errors)
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

  const changePlan = (planId: string) => (fn: (p: EditedPlan) => EditedPlan) =>
    setPlans(prev => prev?.map(p => (p.id === planId ? fn(p) : p)) ?? null)

  const savePlans = async () => {
    if (!plans || !user) return
    const validPlans = plans.filter((p) => p.name.trim() && p.exercises.length > 0)
    if (validPlans.length === 0) {
      toast.error('Nenhum plano válido para salvar.')
      return
    }
    setSaving(true)
    try {
      for (const planData of validPlans) {
        const exercisesWithUser = await Promise.all(
          planData.exercises.map(async (ex) => {
            if (ex.exercise.custom === false) return ex
            const finalExercise = { ...ex.exercise, userId: user.uid }
            await savePersonalizedExercise(finalExercise)
            syncExerciseToFirestore(finalExercise)
            return { ...ex, exercise: finalExercise }
          })
        )
        const plan = await createPlan(planData.name.trim())
        await updatePlanById({ ...plan, exercises: exercisesWithUser })
      }
      setSuccess(true)
      setTimeout(() => navigate({ to: '/workouts' }), 1500)
    } catch (e) {
      console.error(e)
      toast.error('Erro ao salvar planos.')
    } finally {
      setSaving(false)
    }
  }

  const validPlans = plans?.filter((p) => p.name.trim() && p.exercises.length > 0) ?? []

  return (
    <div className="page-container pt-4 pb-[450px]">
      <ImportHeader onBack={() => navigate({ to: '/workouts' })} planosCount={plans?.length} />

      {success ? (
        <ImportSuccess planosCount={validPlans.length} />
      ) : (
        <>
          <CsvFormatCard />

          {!plans && (
            <ImportDropZone inputRef={inputRef} onFile={handleFile} />
          )}

          <ImportErrors erros={errors} />

          {plans && (
            <div className="mt-4 animate-fade-up flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-text">Revise e edite antes de salvar</h2>
                <button
                  type="button"
                  onClick={() => {
                    setPlans(null)
                    setErrors([])
                  }}
                  className="btn-ghost p-2 text-text-muted"
                >
                  <X size={16} />
                </button>
              </div>

              {plans.map(plan => (
                <PlanEditCard
                  key={plan.id}
                  plan={plan}
                  expandedExs={expandedExs}
                  onToggleEx={toggleExpandEx}
                  onChange={changePlan(plan.id)}
                  onRemove={() =>
                    setPlans(prev => prev?.filter(p => p.id !== plan.id) ?? null)
                  }
                />
              ))}

              {plans.length === 0 && (
                <p className="text-xs text-text-muted text-center py-6">
                  Todos os planos foram removidos.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {plans && !success && (
        <div
          className="fixed left-0 right-0 p-4 bg-bg/90 backdrop-blur border-t border-border z-60"
          style={{ bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            type="button"
            onClick={savePlans}
            disabled={validPlans.length === 0 || saving}
            className="btn-primary w-full disabled:opacity-40"
          >
            {saving
              ? 'Criando planos...'
              : validPlans.length === 1
                ? `Criar "${validPlans[0].name}"`
                : `Criar ${validPlans.length} planos`}
          </button>
        </div>
      )}
    </div>
  )
}
