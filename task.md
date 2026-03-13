# Plano de Migração: React para Flutter (Treino App)

Este documento detalha o plano de implementação para reconstruir o aplicativo web React/PWA em uma versão nativa Flutter, mantendo 100% das funcionalidades, design visual e a arquitetura _local-first_ (com sincronização).

## Etapa 1: Fundação, Arquitetura e UI Base (Testável)
*Objetivo: Estruturar o projeto Flutter, navegação base, banco de dados local e o design system nativo equivalente ao Tailwind/Shadcn atual. No final desta etapa o app já roda, permitindo testar a navegação e a persistência básica.*

- [ ] Inicializar o projeto Flutter na pasta `/native` (usando Riverpod ou Provider, go_router, etc.)
- [ ] Configurar o banco de dados local (ex: Isar ou Drift como equivalente ao Dexie.js)
- [ ] Criar os modelos de dados equivalentes do TypeScript (`Exercicio`, `PlanoDeTreino`, `SessaoDeTreino`, `MedidaCorporal`)
- [ ] Implementar as paletas de cores e temas (modo escuro, cores por grupo muscular, cores de plano)
- [ ] Construir componentes base de UI (Botões, Inputs, Cards de exercício, BottomNavigationBar)
- [ ] Implementar a navegação principal (Dashboard, Treinos, Histórico, Perfil)
- [ ] Testar persistência CRUD simples localmente para garantir o funcionamento do banco.

## Etapa 2: Catálogo de Exercícios
*Objetivo: Implementar a listagem, busca, filtro e criação de exercícios.*

- [ ] Popular o banco local com os exercícios base iniciais (seed)
- [ ] Tela de Catálogo de Exercícios (`/exercicios`)
- [ ] Busca e filtros por grupo muscular
- [ ] Tela/Modal de Adicionar Exercício Personalizado
- [ ] Lógica para favoritar exercícios

## Etapa 3: Planos de Treino (Criação e Gestão)
*Objetivo: Permitir que o usuário crie, edite e organize suas fichas de treino.*

- [ ] Tela de Listagem de Planos (`/treinos`) com drag & drop (reordenação)
- [ ] Tela de Criação/Edição de Plano (`novo.tsx` / `$planoId.tsx` equivalente)
- [ ] Adicionar exercícios no plano selecionando do catálogo
- [ ] Lógica de reordenação dos exercícios dentro do plano
- [ ] Configuração de metas (Reps, Peso, Descanso, Tipo de Série: reps/tempo/falha)
- [ ] Integração de Agrupamentos: Superset, Dropset e Giantset
- [ ] Implementar recurso de Importação via CSV

## Etapa 4: Treino Ativo (Active Workout Tracking)
*Objetivo: A funcionalidade principal do app. Registrar o treino em tempo real.*

- [ ] Tela de Treino Ativo (`/treino-ativo`)
- [ ] Temporizador/Cronômetro geral da sessão
- [ ] Cronômetro de descanso entre séries (com alertas sonoros/vibração)
- [ ] Visualização das séries (meta vs. realizado) e registro prático (checar série como completada)
- [ ] Suporte aos tipos de série especiais (Superset/Dropset renderização unida)
- [ ] Cálculo de Volume Total da sessão em tempo real
- [ ] Gravar e salvar sessão no banco de dados local (`historico`) no final do treino

## Etapa 5: Histórico, Estatísticas e Perfil
*Objetivo: Visualização de progresso e gestão da conta.*

- [ ] Tela de Histórico de Treinos (Lista de sessões passadas)
- [ ] Tela de Detalhes da Sessão (`$sessaoId.tsx` equivalente)
- [ ] Tela de Perfil e Configurações
- [ ] Acompanhamento de Medidas Corporais (Registro e gráficos de evolução)
- [ ] Dashboard de Estatísticas (Volume total, Total de treinos, Streaks atuais e melhores)
- [ ] Calculadora 1RM (1 Rep Max) referenciada em `src/lib/calculadora1rm.ts`
- [ ] Exportação de dados (backup via JSON/CSV) e sincronização base Firebase (Auth/Sync) equivalente à web.

## Etapa 6: Funcionalidades Nativas Exclusivas (Nova Feature!)
*Objetivo: Integrar as melhorias no sistema que não existiam na versão web, aproveitando as capacidades do sistema nativo (iOS e Android).*

- [ ] **Notificações Aprimoradas:**
  - [ ] Lembretes agendados e locais para treinar.
  - [ ] Alertas locais fora do app quando o tempo de descanso terminar na sessão ativa.
- [ ] **Live Activities (iOS) & Persistent Media Notification (Android):**
  - [ ] Implementar Widget de "Live Activity" (iOS Dynamic Island / Lock Screen) exibindo o cronômetro do treino atual, o exercício atual e as séries restantes.
  - [ ] Implementar Notificação Persistente Rica no Android equivalante, controlando cronômetros de descanso diretamente pela tela de bloqueio.
  - [ ] Garantir que o app permaneça vivo rodando o cronômetro em background confiavelmente.
