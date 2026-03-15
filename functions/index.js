const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();

const INACTIVITY_MS = 20 * 60 * 1000; // 20 minutes

/**
 * Calculates total volume (weight × reps) of completed sets in the session.
 * Same logic as the app (stores/activeWorkoutStore.ts).
 * Supports both English (exercises, sets, completed, weight, reps) and legacy Portuguese keys.
 */
function calculateVolume(session) {
  if (!session) return 0;
  const exercises = session.exercises || session.exercicios;
  if (!exercises || !Array.isArray(exercises)) return 0;
  return exercises.reduce((total, ex) => {
    const sets = ex.sets || ex.series;
    if (!sets || !Array.isArray(sets)) return total;
    return (
      total +
      sets
        .filter((s) => s && (s.completed === true || s.completada === true))
        .reduce(
          (sum, s) =>
            sum + (s.weight ?? s.peso ?? 0) * (s.reps ?? s.repeticoes ?? 0),
          0
        )
    );
  }, 0);
}

/**
 * Removes undefined fields (Firestore does not accept them).
 */
function stripUndefined(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(stripUndefined);
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, stripUndefined(v)])
  );
}

/**
 * Closes active workouts that have been inactive for more than 20 minutes.
 * Runs every 10 minutes via Cloud Scheduler.
 * Client writes to active/{userId} with updatedAt on each heartbeat; if no write for 20 min, we close.
 */
exports.closeInactiveWorkouts = onSchedule(
  {
    schedule: 'every 10 minutes',
    timeZone: 'America/Sao_Paulo',
    region: 'southamerica-east1',
  },
  async () => {
    const db = getFirestore();
    const activeRef = db.collection('active');
    const snap = await activeRef.get();
    const now = Date.now();

    const batch = db.batch();
    let hasWrites = false;

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const updatedAt = data.updatedAt || 0;
      const session = data.session || data.sessao;

      if (now - updatedAt <= INACTIVITY_MS) continue;
      if (!data.started && !data.iniciado) continue;
      if (!session || !session.id) continue;

      hasWrites = true;
      const totalTimerSeconds =
        data.totalTimerSeconds ?? data.cronometroGeralSegundos ?? 0;
      const idleSeconds = Math.floor(INACTIVITY_MS / 1000);
      const closedSession = {
        ...session,
        finishedAt: now,
        durationSeconds: Math.max(0, totalTimerSeconds - idleSeconds),
        idleSecondsDeducted: idleSeconds,
        totalVolume: calculateVolume(session),
        autoClosed: true,
        syncedAt: now,
      };

      const sessionsRef = db.collection('sessions').doc(closedSession.id);
      batch.set(sessionsRef, stripUndefined(closedSession));
      batch.delete(docSnap.ref);
    }

    if (hasWrites) {
      await batch.commit();
    }
  }
);
