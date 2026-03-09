// ============================================================
// FitTrack – Type Definitions
// ============================================================

export interface Exercicio {
  id: string
  nome: string
  grupoMuscular: string
  grupoMuscularSecundario?: string
  equipamento?: string
  gifUrl?: string
  instrucoes?: string[]
  personalizado?: boolean
  userId?: string
}

export interface SerieRegistrada {
  id: string
  ordem: number
  repeticoes: number
  peso: number // kg
  completada: boolean
  duracaoSegundos?: number
  rpe?: number // Rate of Perceived Exertion 1-10
  notas?: string
}

export interface SeriePlano {
  peso: number
  repeticoes: number
}

export interface ExercicioNoPlano {
  id: string
  exercicioId: string
  exercicio: Exercicio
  series: number
  repeticoesMeta: number
  pesoMeta?: number
  seriesDetalhadas?: SeriePlano[]
  descansoSegundos: number
  ordem: number
  notas?: string
}

export interface PlanoDeTreino {
  id: string
  userId: string
  nome: string
  descricao?: string
  exercicios: ExercicioNoPlano[]
  cor?: string // hex color para card
  createdAt: number // timestamp
  updatedAt: number
  syncedAt?: number
}

export interface ExercicioNaSessao {
  exercicioId: string
  exercicioNome: string
  gifUrl?: string
  grupoMuscular: string
  series: SerieRegistrada[]
  descansoSegundos: number
  ordem: number
  notas?: string // Observação vinda do plano
  instrucoes?: string[] // Instruções originais do exercício
}

export interface SessaoDeTreino {
  id: string
  userId: string
  planoId: string
  planoNome: string
  iniciadoEm: number // timestamp
  finalizadoEm?: number
  duracaoSegundos?: number
  exercicios: ExercicioNaSessao[]
  notas?: string
  volumeTotal?: number // soma de (peso x reps) de todas as séries
  syncedAt?: number
}

// Stats calculados do histórico
export interface EstatisticasTreino {
  totalTreinos: number
  totalVolume: number
  treinosEssaSemana: number
  streakAtual: number
  melhorStreak: number
  ultimoTreino?: SessaoDeTreino
}

// Estado do treino ativo (em memória / zustand)
export interface TreinoAtivoState {
  sessao: SessaoDeTreino | null
  exercicioAtualIndex: number
  serieAtualIndex: number
  cronometroGeralSegundos: number
  cronometroDescansoSegundos: number
  cronometroDescansoAtivo: boolean
  pausado: boolean
  iniciado: boolean
}

// CSV Import
export interface LinhaCsvTreino {
  nome_exercicio: string
  grupo_muscular: string
  series: string
  repeticoes: string
  peso_kg: string
  descanso_segundos: string
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

export const GRUPOS_MUSCULARES: GrupoMuscular[] = [
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
export const GRUPOS_EN_PT: Record<string, GrupoMuscular> = {
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
export const CORES_GRUPO: Record<string, string> = {
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
export const CORES_PLANO = [
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
