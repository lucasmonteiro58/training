import { GRUPOS_EN_PT } from '../../types'
import type { Exercicio } from '../../types'
import { getCachedExercicios, setCachedExercicios } from '../db/dexie'

// Dataset open-source: https://github.com/yuhonas/free-exercise-db
const RAW_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
const GIF_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

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

function mapearGrupo(en: string): string {
  return GRUPOS_EN_PT[en.toLowerCase()] ?? en
}

function convertRawToExercicio(raw: RawExercise): Exercicio {
  const primaryMuscle = raw.primaryMuscles?.[0] ?? raw.category ?? 'outro'
  const gifUrl =
    raw.images && raw.images.length > 0
      ? `${GIF_BASE}/${raw.id}/${raw.images[0]}`
      : undefined

  return {
    id: raw.id,
    nome: raw.name,
    grupoMuscular: mapearGrupo(primaryMuscle),
    grupoMuscularSecundario: raw.secondaryMuscles?.[0]
      ? mapearGrupo(raw.secondaryMuscles[0])
      : undefined,
    equipamento: raw.equipment,
    gifUrl,
    instrucoes: raw.instructions,
    personalizado: false,
  }
}

let cachedExercicios: Exercicio[] | null = null

export async function carregarExercicios(): Promise<Exercicio[]> {
  // 1. Memória
  if (cachedExercicios) return cachedExercicios

  // 2. IndexedDB local
  const dbCache = await getCachedExercicios()
  if (dbCache.length > 0) {
    cachedExercicios = dbCache
    return dbCache
  }

  // 3. Fetch remoto
  try {
    const resp = await fetch(RAW_URL)
    if (!resp.ok) throw new Error('Erro ao buscar exercícios')
    const raw: RawExercise[] = await resp.json()
    const exercicios = raw.map(convertRawToExercicio)
    cachedExercicios = exercicios
    await setCachedExercicios(exercicios)
    return exercicios
  } catch (err) {
    console.error('Erro ao carregar exercícios:', err)
    return []
  }
}

export function buscarExercicios(
  exercicios: Exercicio[],
  query: string,
  grupo?: string
): Exercicio[] {
  const q = query.toLowerCase().trim()
  return exercicios.filter((ex) => {
    const matchQuery = !q || ex.nome.toLowerCase().includes(q) ||
      ex.grupoMuscular.toLowerCase().includes(q)
    const matchGrupo = !grupo || ex.grupoMuscular === grupo
    return matchQuery && matchGrupo
  })
}
