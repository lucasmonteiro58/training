// ============================================================
// Training – Type Definitions
// ============================================================

export interface Exercise {
  id: string
  nome: string
  grupoMuscular: string
  grupoMuscularSecundario?: string
  equipamento?: string
  gifUrl?: string
  instrucoes?: string[]
  personalizado?: boolean
  userId?: string
  favoritado?: boolean
}

export interface RecordedSet {
  id: string
  ordem: number
  repeticoes: number
  peso: number // kg
  completada: boolean
  duracaoSegundos?: number
  rpe?: number // Rate of Perceived Exertion 1-10
  notas?: string
}

export interface PlanSet {
  peso: number
  repeticoes: number
}

export type SetType = 'reps' | 'tempo' | 'falha'
export type GroupingType = 'superset' | 'dropset' | 'giantset'

export interface ExerciseInPlan {
  id: string
  exercicioId: string
  exercicio: Exercise
  series: number
  repeticoesMeta: number
  pesoMeta?: number
  seriesDetalhadas?: PlanSet[]
  descansoSegundos: number
  ordem: number
  notas?: string
  tipoSerie?: SetType
  duracaoMetaSegundos?: number // usado quando tipoSerie === 'tempo'
  agrupamentoId?: string // ID compartilhado entre exercícios do mesmo grupo (superset/dropset/giantset)
  tipoAgrupamento?: GroupingType
}

export interface WorkoutPlan {
  id: string
  userId: string
  nome: string
  descricao?: string
  exercicios: ExerciseInPlan[]
  cor?: string // hex color para card
  arquivado?: boolean
  ordem?: number // posição na lista
  createdAt: number // timestamp
  updatedAt: number
  syncedAt?: number
}

export interface ExerciseInSession {
  exercicioId: string
  exercicioNome: string
  gifUrl?: string
  grupoMuscular: string
  series: RecordedSet[]
  descansoSegundos: number
  ordem: number
  notas?: string // Observação vinda do plano
  instrucoes?: string[] // Instruções originais do exercício
  tipoSerie?: SetType
  duracaoMetaSegundos?: number
  agrupamentoId?: string
  tipoAgrupamento?: GroupingType
}

export interface WorkoutSession {
  id: string
  userId: string
  planoId: string
  planoNome: string
  iniciadoEm: number // timestamp
  finalizadoEm?: number
  duracaoSegundos?: number
  exercicios: ExerciseInSession[]
  notas?: string
  volumeTotal?: number // soma de (peso x reps) de todas as séries
  syncedAt?: number
  /** true quando o treino foi encerrado automaticamente por inatividade (20 min) */
  autoEncerrado?: boolean
  /** quando autoEncerrado: segundos de inatividade descontados do tempo total (ex: 1200 = 20 min) */
  tempoOciosoDescontadoSegundos?: number
}

// Stats calculados do histórico
export interface WorkoutStats {
  totalTreinos: number
  totalVolume: number
  treinosEssaSemana: number
  streakAtual: number
  melhorStreak: number
  ultimoTreino?: WorkoutSession
}

// Estado do treino ativo (em memória / zustand)
export interface ActiveWorkoutState {
  sessao: WorkoutSession | null
  exercicioAtualIndex: number
  serieAtualIndex: number
  cronometroGeralSegundos: number
  cronometroDescansoSegundos: number
  cronometroDescansoAtivo: boolean
  pausado: boolean
  iniciado: boolean
}

// CSV Import
export interface WorkoutCsvRow {
  id?: string // ID do exercício no banco de dados (opcional — se presente, busca o exercício existente)
  plano?: string // Nome do plano (coluna opcional — agrupa exercícios em planos separados)
  nome_exercicio: string
  grupo_muscular: string
  series: string
  repeticoes: string
  peso_kg: string
  descanso_segundos: string
  instrucoes?: string // Separado por |
  notas?: string // Observação
}

export type GrupoMuscular =
  | 'Peito'
  | 'Costas'
  | 'Ombros'
  | 'Bíceps'
  | 'Tríceps'
  | 'Antebraço'
  | 'Abdômen'
  | 'Quadríceps'
  | 'Posterior de Coxa'
  | 'Glúteos'
  | 'Panturrilha'
  | 'Trapézio'
  | 'Cardio'
  | 'Corpo Inteiro'
  | 'Outro'

export const MUSCLE_GROUPS: GrupoMuscular[] = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Antebraço',
  'Abdômen',
  'Quadríceps',
  'Posterior de Coxa',
  'Glúteos',
  'Panturrilha',
  'Trapézio',
  'Cardio',
  'Corpo Inteiro',
  'Outro',
]

// Mapeamento de grupos musculares EN → PT-BR
export const GROUPS_EN_TO_PT: Record<string, GrupoMuscular> = {
  chest: 'Peito',
  back: 'Costas',
  shoulders: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Antebraço',
  abs: 'Abdômen',
  abdominals: 'Abdômen',
  core: 'Abdômen',
  quads: 'Quadríceps',
  quadriceps: 'Quadríceps',
  hamstrings: 'Posterior de Coxa',
  glutes: 'Glúteos',
  calves: 'Panturrilha',
  traps: 'Trapézio',
  trapezius: 'Trapézio',
  cardio: 'Cardio',
  'full body': 'Corpo Inteiro',
  lats: 'Costas',
  'lower back': 'Costas',
  'upper back': 'Costas',
  neck: 'Trapézio',
  legs: 'Quadríceps',
}

// Cores por grupo muscular
export const GROUP_COLORS: Record<string, string> = {
  Peito: '#ef4444',
  Costas: '#3b82f6',
  Ombros: '#f59e0b',
  Bíceps: '#10b981',
  Tríceps: '#8b5cf6',
  Antebraço: '#06b6d4',
  Abdômen: '#f97316',
  Quadríceps: '#6366f1',
  'Posterior de Coxa': '#ec4899',
  Glúteos: '#14b8a6',
  Panturrilha: '#84cc16',
  Trapézio: '#a78bfa',
  Cardio: '#fb7185',
  'Corpo Inteiro': '#94a3b8',
  Outro: '#64748b',
}

// Cores do app (para planos)
export const PLAN_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
]

// Labels e cores para agrupamentos (superset, dropset, giantset)
export const GROUPING_CONFIG: Record<string, { label: string; cor: string; corBg: string }> = {
  superset: { label: 'Superset', cor: '#f59e0b', corBg: 'rgba(245,158,11,0.15)' },
  dropset: { label: 'Drop Set', cor: '#ef4444', corBg: 'rgba(239,68,68,0.15)' },
  giantset: { label: 'Giant Set', cor: '#8b5cf6', corBg: 'rgba(139,92,246,0.15)' },
}

// ============================================================
// Medidas Corporais
// ============================================================
export interface BodyMeasurement {
  id: string
  userId: string
  data: number // timestamp
  peso?: number // kg
  gordura?: number // % bf
  braco?: number // cm
  peito?: number
  cintura?: number
  quadril?: number
  coxa?: number
  panturrilha?: number
  notas?: string
}

export const MEASUREMENT_FIELDS: { key: keyof BodyMeasurement; label: string; unidade: string }[] = [
  { key: 'peso', label: 'Peso', unidade: 'kg' },
  { key: 'gordura', label: 'Gordura Corporal', unidade: '%' },
  { key: 'braco', label: 'Braço', unidade: 'cm' },
  { key: 'peito', label: 'Peito', unidade: 'cm' },
  { key: 'cintura', label: 'Cintura', unidade: 'cm' },
  { key: 'quadril', label: 'Quadril', unidade: 'cm' },
  { key: 'coxa', label: 'Coxa', unidade: 'cm' },
  { key: 'panturrilha', label: 'Panturrilha', unidade: 'cm' },
]
