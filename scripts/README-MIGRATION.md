# Migração Firestore: coleções em inglês

Este script cria as coleções **exercises**, **plans** e **sessions** no Firestore, copiando os dados de **exercicios**, **planos** e **sessoes** e traduzindo as chaves para inglês. As coleções originais **não são alteradas nem apagadas**.

## Pré-requisitos

1. **Conta de serviço (service account)** do Firebase com permissão de leitura e escrita no Firestore.
   - No Console do Firebase: Project settings → Service accounts → Generate new private key.
   - Salve o JSON (ex.: `service-account.json`) em um local seguro (não faça commit no git).

2. **Variável de ambiente** apontando para esse arquivo:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/caminho/para/service-account.json"
   ```

3. **Dependência** (para rodar o script):
   ```bash
   pnpm add -D firebase-admin
   ```

## Como rodar

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/caminho/para/service-account.json"
node scripts/firestore-migrate-to-english.js
```

Ou, com o arquivo na raiz do projeto:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="./service-account.json"
node scripts/firestore-migrate-to-english.js
```

## Mapeamento de chaves (PT → EN)

Todas as chaves são mapeadas recursivamente (incluindo objetos e arrays aninhados). Dicionário único usado pelo script:

| Português | Inglês |
|-----------|--------|
| nome | name |
| grupoMuscular | muscleGroup |
| grupoMuscularSecundario | secondaryMuscleGroup |
| equipamento | equipment |
| instrucoes | instructions |
| personalizado | custom |
| favoritado | favorited |
| descricao | description |
| exercicios | exercises |
| cor | color |
| arquivado | archived |
| ordem | order |
| exercicioId | exerciseId |
| exercicio | exercise |
| repeticoesMeta | targetReps |
| pesoMeta | targetWeight |
| seriesDetalhadas | setsDetail |
| descansoSegundos | restSeconds |
| notas | notes |
| tipoSerie | setType |
| duracaoMetaSegundos | targetDurationSeconds |
| agrupamentoId | groupingId |
| tipoAgrupamento | groupingType |
| planoId | planId |
| planoNome | planName |
| iniciadoEm | startedAt |
| finalizadoEm | finishedAt |
| duracaoSegundos | durationSeconds |
| volumeTotal | totalVolume |
| autoEncerrado | autoClosed |
| tempoOciosoDescontadoSegundos | idleSecondsDeducted |
| exercicioNome | exerciseName |
| series | sets |
| repeticoes | reps |
| peso | weight |
| completada | completed |

### Estrutura aninhada (referência)

- **exercises** (doc raiz): name, muscleGroup, secondaryMuscleGroup, equipment, gifUrl, instructions, custom, userId, favorited, syncedAt.
- **plans** (doc raiz): name, description, **exercises** (array), color, archived, order, createdAt, updatedAt, syncedAt.
  - **plans.exercises[]**: id, exerciseId, **exercise** (objeto), sets, targetReps, targetWeight, **setsDetail** (array), restSeconds, order, notes, setType, targetDurationSeconds, groupingId, groupingType.
  - **plans.exercises[].exercise**: id, name, muscleGroup, … (mesmo shape do doc da coleção exercises).
  - **plans.exercises[].setsDetail[]**: weight, reps.
- **sessions** (doc raiz): planId, planName, startedAt, finishedAt, durationSeconds, **exercises** (array), notes, totalVolume, syncedAt, autoClosed, idleSecondsDeducted.
  - **sessions.exercises[]**: exerciseId, exerciseName, gifUrl, muscleGroup, **sets** (array), restSeconds, order, notes, instructions, setType, targetDurationSeconds, groupingId, groupingType.
  - **sessions.exercises[].sets[]**: id, order, reps, weight, completed, durationSeconds, rpe, notes.

## Depois da migração

Para o app passar a usar apenas as novas coleções e chaves em inglês, é necessário:

1. Atualizar **tipos** em `src/types/index.ts` para usar as propriedades em inglês (name, planId, startedAt, etc.).
2. Atualizar **sync** em `src/lib/firestore/sync.ts` para ler/escrever nas coleções `exercises`, `plans`, `sessions` e usar as novas chaves.
3. Atualizar **Dexie** em `src/lib/db/dexie.ts`: nova versão do schema com nomes em inglês e migração dos dados locais.
4. Atualizar **todo o código** que acessa `plano.nome`, `sessao.planoId`, `exercicio.grupoMuscular`, etc., para `plan.name`, `session.planId`, `exercise.muscleGroup`, etc.

As coleções antigas (exercicios, planos, sessoes) podem permanecer no projeto apenas como backup.
