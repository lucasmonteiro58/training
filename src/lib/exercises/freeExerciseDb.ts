import { GROUPS_EN_TO_PT } from '../../types'
import type { Exercise } from '../../types'
import { getCachedExercises, setCachedExercises } from '../db/dexie'

// Dataset open-source: https://github.com/yuhonas/free-exercise-db
const RAW_URL =
  'https://raw.githubusercontent.com/joao-gugel/exercicios-bd-ptbr/refs/heads/main/exercises/exercises-ptbr-full-translation.json'
const GIF_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises'

interface RawExercise {
  id: string
  name: string
  force?: string
  level?: string
  mechanic?: string
  equipment?: string
  primaryMuscles?: string[]
  secondaryMuscles?: string[]
  instructions?: string[]
  category?: string
  images?: string[]
}

function mapGroup(en: string): string {
  return GROUPS_EN_TO_PT[en.toLowerCase()] ?? en
}

function convertRawToExercise(raw: RawExercise): Exercise {
  const primaryMuscle = raw.primaryMuscles?.[0] ?? raw.category ?? 'outro'
  const gifUrl =
    raw.images && raw.images.length > 0
      ? `${GIF_BASE}/${raw.images[0]}`
      : undefined

  return {
    id: raw.id,
    name: raw.name,
    muscleGroup: mapGroup(primaryMuscle),
    secondaryMuscleGroup: raw.secondaryMuscles?.[0]
      ? mapGroup(raw.secondaryMuscles[0])
      : undefined,
    equipment: raw.equipment,
    gifUrl,
    instructions: raw.instructions,
    custom: false,
  }
}

let cachedExercises: Exercise[] | null = null

export async function loadExercises(): Promise<Exercise[]> {
  // 1. Memory
  if (cachedExercises) return cachedExercises

  // 2. Local IndexedDB
  const dbCache = await getCachedExercises()
  if (dbCache.length > 0) {
    cachedExercises = dbCache
    return dbCache
  }

  // 3. Remote fetch
  try {
    const resp = await fetch(RAW_URL)
    if (!resp.ok) throw new Error('Erro ao buscar exercícios')
    const raw: RawExercise[] = await resp.json()
    const exercises = raw.map(convertRawToExercise)
    cachedExercises = exercises
    await setCachedExercises(exercises)
    return exercises
  } catch (err) {
    console.error('Erro ao carregar exercícios:', err)
    return []
  }
}

export function searchExercises(
  exercises: Exercise[],
  query: string,
  group?: string
): Exercise[] {
  const q = query.toLowerCase().trim()
  return exercises.filter((ex) => {
    const matchQuery = !q || ex.name.toLowerCase().includes(q) ||
      ex.muscleGroup.toLowerCase().includes(q)
    const matchGroup = !group || ex.muscleGroup === group
    return matchQuery && matchGroup
  })
}
