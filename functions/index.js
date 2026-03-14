const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();

const INATIVIDADE_MS = 20 * 60 * 1000; // 20 minutos

/**
 * Calcula o volume total (peso × reps) das séries completadas da sessão.
 * Mesma lógica do app (stores/index.ts).
 */
function calcularVolume(sessao) {
  if (!sessao || !sessao.exercicios || !Array.isArray(sessao.exercicios)) {
    return 0;
  }
  return sessao.exercicios.reduce((total, ex) => {
    if (!ex.series || !Array.isArray(ex.series)) return total;
    return (
      total +
      ex.series
        .filter((s) => s && s.completada)
        .reduce((sum, s) => sum + (s.peso || 0) * (s.repeticoes || 0), 0)
    );
  }, 0);
}

/**
 * Remove campos undefined (Firestore não aceita).
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
 * Encerra treinos ativos que estão inativos há mais de 20 minutos.
 * Roda a cada 5 minutos via Cloud Scheduler.
 */
exports.encerrarTreinosInativos = onSchedule(
  {
    schedule: 'every 5 minutes',
    timeZone: 'America/Sao_Paulo',
    region: 'southamerica-east1',
  },
  async (event) => {
    const db = getFirestore();
    const ativoRef = db.collection('ativo');
    const snap = await ativoRef.get();
    const now = Date.now();

    const batch = db.batch();
    let hasWrites = false;

    for (const doc of snap.docs) {
      const d = doc.data();
      const updatedAt = d.updatedAt || 0;
      const sessao = d.sessao;

      if (now - updatedAt <= INATIVIDADE_MS) continue;
      if (!d.iniciado || !sessao || !sessao.id) continue;

      hasWrites = true;
      const cronometroGeralSegundos = d.cronometroGeralSegundos ?? 0;
      const finalizada = {
        ...sessao,
        finalizadoEm: now,
        duracaoSegundos: cronometroGeralSegundos,
        volumeTotal: calcularVolume(sessao),
        autoEncerrado: true,
        syncedAt: now,
      };

      const sessoesRef = db.collection('sessoes').doc(finalizada.id);
      batch.set(sessoesRef, stripUndefined(finalizada));
      batch.delete(doc.ref);
    }

    if (hasWrites) {
      await batch.commit();
    }
  }
);
