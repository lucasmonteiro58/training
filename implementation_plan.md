# Projeto de Migração: React PWA → Native Flutter App

Este plano detalha a arquitetura e os passos para migrar o aplicativo web "Training" (construído com React, Vite, TailwindCSS, Dexie.js e Firebase) para um aplicativo nativo usando o SDK do Flutter. O objetivo é alcançar 100% de paridade de design e funcionalidades, além de adicionar novos recursos exclusivos do sistema nativo na etapa final (Live Activities e Notificações Aprimoradas).

## Visão Geral do Arquitetura Flutter
Replicaremos o comportamento *local-first* da aplicação atual. Abaixo seguem as recomendações de stack para o Flutter:
- **Gerenciamento de Estado:** \`Riverpod\` (Substituindo o Zustand)
- **Banco de Dados Local:** \`Isar\` ou \`Drift\` (Substituindo o Dexie.js). Ambos oferecem queries tipadas e suporte robusto.
- **Roteamento:** \`go_router\` (Substituindo o @tanstack/react-router)
- **Tema e UI:** Um sistema de \`ThemeData\` fortemente tipado para replicar perfeitamente as cores do Tailwind e os estilos do Shadcn.
- **Backend/Sincronização:** \`firebase_core\`, \`firebase_auth\`, \`cloud_firestore\` (mantendo o uso do Firebase atual).

## User Review Required

> [!IMPORTANT]
> A implementação das **Live Activities (iOS)** requer o uso de código nativo Swift (WidgetKit) e configuração de App Groups. Para o **Android**, precisaremos criar um Foreground Service usando Kotlin/Java para manter o cronômetro ativo e uma notificação persistente rica. Confirme se você possui acesso a um Mac com Xcode para podermos compilar e testar a funcionalidade da Ilha Dinâmica (Dynamic Island) do iOS quando chegarmos na Etapa 6.

## Proposed Changes

Todas as mudanças ocorrerão dentro do diretório `/home/lucas/Estudo/training/native`.

### 1. Fundação e Core
#### [NEW] \`native/pubspec.yaml\`
Configuração das dependências (riverpod, isar, go_router, firebase).
#### [NEW] \`native/lib/main.dart\`
Ponto de entrada do app, inicialização do Firebase e banco de dados local.
#### [NEW] \`native/lib/core/theme.dart\`
Sistema de design replicando exatamente as cores e tipografia (ex: `CORES_GRUPO`, `CORES_PLANO` definidas no `src/types/index.ts`).
#### [NEW] \`native/lib/core/router.dart\`
Definição das rotas principais (/treinos, /treino-ativo, /historico, /perfil).

### 2. Camada de Dados (Modelos)
#### [NEW] \`native/lib/data/models/exercicio.dart\`
#### [NEW] \`native/lib/data/models/plano_treino.dart\`
#### [NEW] \`native/lib/data/models/sessao_treino.dart\`
#### [NEW] \`native/lib/data/models/medida_corporal.dart\`
Replicação das interfaces TS (`Exercicio`, `PlanoDeTreino`, `SessaoDeTreino`) como entidades do banco de dados Isar/Drift.

### 3. Features e UI
#### [NEW] \`native/lib/features/dashboard/...\`
Tela inicial replicando `index.tsx`.
#### [NEW] \`native/lib/features/treinos/...\`
Telas de listagem, criação e edição de planos.
#### [NEW] \`native/lib/features/treino_ativo/...\`
A tela principal do app: o reprodutor de treino. Conterá a lógica complexa de timers (geral e descanso), registro de séries, e suporte visual para supersets/dropsets.
#### [NEW] \`native/lib/features/exercicios/...\`
Catálogo de listagem de exercícios e criação de exercícios personalizados.
#### [NEW] \`native/lib/features/historico/...\`
Listagem de sessões passadas.
#### [NEW] \`native/lib/features/perfil/...\`
Módulo de perfil e acompanhamento de medidas (`medidas.tsx`, `evolucao.tsx`).

### 4. Integração Nativa (Live Activities & Notificações)
#### [NEW] \`native/ios/TreinoWidget/...\`
Arquivos em Swift e Storyboards necessários para criar a UI da Ilha Dinâmica (Dynamic Island) e Lock Screen via WidgetKit.
#### [NEW] \`native/android/app/src/main/kotlin/.../TreinoForegroundService.kt\`
Serviço Android para manter os timers rodando em background e exibir os botões de controle na shade de notificações.

---

## Verification Plan

### Manual Verification
1. **Etapa 1 (Fundação):** Executar \`flutter run\` e verificar se a tela inicial carrega com as cores exatas do web app.
2. **Etapa 2 e 3 (Planos/Exercícios):** Criar um plano de treino, adicionar exercícios e fechar o app. Abrir novamente e verificar se os dados persistem localmente (offline-first).
3. **Etapa 4 (Treino Ativo):** Iniciar um treino, iniciar o cronômetro de descanso e minimizar o app. O cronômetro deve continuar de forma precisa ao reabrir. Verificar cálculos de volume.
4. **Etapa 6 (Live Activities):** Em um dispositivo/simulador iOS 16.1+, iniciar um treino e voltar para a home do celular. Verificar se a "Dynamic Island" expande com o tempo atual e permite ações rápidas. No Android, checar a barra de notificações.

Todas as etapas descritas com maior granularidade estão mapeadas no documento de task (checklist principal da atividade).
