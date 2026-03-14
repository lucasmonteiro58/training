# Auto-encerramento de treino por inatividade

## Comportamento atual (client-side)

- O app considera **inatividade** quando o documento do treino ativo no Firestore (`ativo/{userId}`) não é atualizado há **20 minutos**.
- Enquanto o usuário está na **tela do treino ativo**, um **heartbeat** a cada 1 minuto atualiza `updatedAt` (e o estado) no Firestore, evitando encerramento por inatividade.
- Quando o **app é aberto** (ou a subscription do Firestore dispara), o cliente verifica: se existir treino ativo e `updatedAt` for maior que 20 min, o treino é **auto-encerrado**: a sessão é salva no histórico com `autoEncerrado: true`, o doc `ativo/{userId}` é removido e é exibido um aviso com opção **Retornar** ou **Fechar**.

Ou seja: o encerramento automático acontece **no momento em que o usuário volta a abrir o app** (ou quando os dados do Firestore são lidos), e não enquanto o app está fechado.

## Opcional: encerramento em background (Firebase Cloud Functions)

Para que o treino seja encerrado **realmente em background** (sem precisar abrir o app), é possível usar uma **Cloud Function agendada** que:

1. Roda a cada 5–10 minutos.
2. Lê todos os documentos da coleção `ativo`.
3. Para cada doc em que `updatedAt` (ou `lastActivityAt`) seja menor que `now - 20 minutos`:
   - Monta a sessão final (como o cliente faz hoje), com `autoEncerrado: true`.
   - Salva na coleção `sessoes`.
   - Remove o doc de `ativo`.
4. (Opcional) Grava em um doc (ex.: `ativo_encerrados/{userId}`) o id da última sessão auto-encerrada para o app mostrar o aviso “Treino encerrado por inatividade” ao abrir.

Exemplo de estrutura da função (Node.js):

```js
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const INATIVIDADE_MS = 20 * 60 * 1000

exports.encerrarTreinosInativos = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    const db = admin.firestore()
    const ativoRef = db.collection('ativo')
    const snap = await ativoRef.get()
    const now = Date.now()
    for (const doc of snap.docs) {
      const d = doc.data()
      const updatedAt = d.updatedAt || 0
      if (now - updatedAt > INATIVIDADE_MS && d.iniciado && d.sessao) {
        const finalizada = {
          ...d.sessao,
          finalizadoEm: now,
          duracaoSegundos: d.cronometroGeralSegundos ?? 0,
          volumeTotal: calcularVolume(d.sessao),
          autoEncerrado: true,
        }
        await db.collection('sessoes').doc(finalizada.id).set(finalizada)
        await doc.ref.delete()
      }
    }
  })
```

Ajustes necessários: garantir que `calcularVolume` exista no backend e que as **Firestore Security Rules** permitam à Cloud Function ler `ativo` e escrever em `sessoes` e `ativo`.

## Retornar ao treino

- **Após auto-encerramento**: o banner no app oferece **Retornar ao treino** (remove a sessão do histórico e coloca de volta como treino ativo) ou **Fechar**.
- **No histórico**: na lista e na tela de detalhe da sessão existe a opção **Retornar** / **Retornar como treino ativo**, que coloca essa sessão concluída de volta como treino ativo (sem remover do histórico).
