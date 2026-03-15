/**
 * Firestore migration: copy data from exercicios, planos, sessoes
 * to new collections exercises, plans, sessions with English keys.
 * Does NOT delete or modify the original collections.
 *
 * Run: node scripts/firestore-migrate-to-english.js
 * Requires: GOOGLE_APPLICATION_CREDENTIALS env pointing to a service account JSON
 *           with Firestore read/write permissions.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');

function resolveCredPath() {
  const env = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const tryPaths = env
    ? [path.isAbsolute(env) ? env : path.join(PROJECT_ROOT, path.normalize(env))]
    : [
        path.join(PROJECT_ROOT, 'service-account.json'),
        path.join(PROJECT_ROOT, 'services-account.json'),
      ];
  for (const p of tryPaths) {
    if (existsSync(p)) return p;
  }
  // If env was set but file missing, try alternate name in same dir
  if (env) {
    const dir = path.dirname(tryPaths[0]);
    const base = path.basename(tryPaths[0]);
    const alt = path.join(dir, base === 'service-account.json' ? 'services-account.json' : 'service-account.json');
    if (existsSync(alt)) return alt;
  }
  return tryPaths[0];
}

const credPath = resolveCredPath();
let credential;
try {
  credential = cert(JSON.parse(readFileSync(credPath, 'utf8')));
} catch (e) {
  console.error('Could not load credentials from:', credPath);
  console.error('Error:', e.message);
  console.error('Tip: set GOOGLE_APPLICATION_CREDENTIALS to the JSON path (e.g. "./service-account.json" or "./services-account.json").');
  process.exit(1);
}

try {
  initializeApp({ credential });
} catch (e) {
  console.error('Failed to initialize Firebase Admin.', e.message);
  process.exit(1);
}

const db = getFirestore();

// Dicionário completo PT → EN (usado recursivamente em todos os níveis)
const KEY_MAP = {
  nome: 'name',
  grupoMuscular: 'muscleGroup',
  grupoMuscularSecundario: 'secondaryMuscleGroup',
  equipamento: 'equipment',
  instrucoes: 'instructions',
  personalizado: 'custom',
  favoritado: 'favorited',
  descricao: 'description',
  exercicios: 'exercises',
  cor: 'color',
  arquivado: 'archived',
  ordem: 'order',
  exercicioId: 'exerciseId',
  exercicio: 'exercise',
  repeticoesMeta: 'targetReps',
  pesoMeta: 'targetWeight',
  seriesDetalhadas: 'setsDetail',
  descansoSegundos: 'restSeconds',
  notas: 'notes',
  tipoSerie: 'setType',
  duracaoMetaSegundos: 'targetDurationSeconds',
  agrupamentoId: 'groupingId',
  tipoAgrupamento: 'groupingType',
  planoId: 'planId',
  planoNome: 'planName',
  iniciadoEm: 'startedAt',
  finalizadoEm: 'finishedAt',
  duracaoSegundos: 'durationSeconds',
  volumeTotal: 'totalVolume',
  autoEncerrado: 'autoClosed',
  tempoOciosoDescontadoSegundos: 'idleSecondsDeducted',
  exercicioNome: 'exerciseName',
  series: 'sets',
  repeticoes: 'reps',
  peso: 'weight',
  completada: 'completed',
};

/** Aplica o mapeamento PT→EN recursivamente em objetos e arrays (todas as chaves aninhadas). */
function mapKeysRecursive(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(mapKeysRecursive).filter((v) => v !== undefined);
  if (typeof value !== 'object') return value;
  const out = {};
  for (const [key, v] of Object.entries(value)) {
    const enKey = KEY_MAP[key] ?? key;
    const mapped = mapKeysRecursive(v);
    if (mapped !== undefined) out[enKey] = mapped;
  }
  return out;
}

function stripUndefined(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(stripUndefined).filter((v) => v !== undefined);
  if (typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    out[k] = stripUndefined(v);
  }
  return out;
}

// ---- Mappers que usam o mapeamento recursivo ----

function mapPlan(doc) {
  return mapKeysRecursive(doc.data());
}

function mapSession(doc) {
  return mapKeysRecursive(doc.data());
}

function mapExerciseDoc(doc) {
  return mapKeysRecursive(doc.data());
}

// ---- Migration (Firestore batch limit = 500) ----

const BATCH_SIZE = 500;

async function migrateCollection(sourceName, targetName, mapFn) {
  const snapshot = await db.collection(sourceName).get();
  const entries = [];
  snapshot.docs.forEach((doc) => {
    const mapped = mapFn(doc);
    if (mapped && typeof mapped === 'object') entries.push({ id: doc.id, data: mapped });
  });
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = entries.slice(i, i + BATCH_SIZE);
    chunk.forEach(({ id, data }) => {
      batch.set(db.collection(targetName).doc(id), stripUndefined(data));
    });
    await batch.commit();
  }
  return entries.length;
}

async function run() {
  console.log('Starting migration to English collections (original collections are NOT modified).\n');

  try {
    const [exercisesCount, plansCount, sessionsCount] = await Promise.all([
      migrateCollection('exercicios', 'exercises', mapExerciseDoc),
      migrateCollection('planos', 'plans', mapPlan),
      migrateCollection('sessoes', 'sessions', mapSession),
    ]);

    console.log('Done.');
    console.log('  exercises:', exercisesCount, '(from exercicios)');
    console.log('  plans:   ', plansCount, '(from planos)');
    console.log('  sessions:', sessionsCount, '(from sessoes)');
    console.log('\nOriginal collections (exercicios, planos, sessoes) were not modified.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
  process.exit(0);
}

run();
