# Projeto de Migracao: React PWA -> Flutter Native

Este documento consolida a analise do aplicativo atual e descreve um plano de migracao completo para uma versao Flutter nativa dentro de `native/`, mantendo o comportamento visual, funcional e arquitetural do app web atual. O alvo e reproduzir a experiencia existente com paridade de design e features, preservando a abordagem local-first com sincronizacao em segundo plano, e adicionar na etapa final recursos nativos que hoje nao existem: Live Activities / notificacao persistente rica e um sistema de notificacoes mais avancado.

## Objetivo do Projeto

- Recriar o app atual com o mesmo fluxo, mesma navegacao e a mesma modelagem de dados.
- Preservar o comportamento offline-first.
- Preservar a sincronizacao com Firebase Auth + Firestore.
- Preservar a identidade visual dark-first, os componentes, as cores por grupo muscular e as cores de plano.
- Preservar todas as features existentes antes de iniciar as features nativas novas.
- Garantir que a Etapa 1 ja resulte em um app Flutter executavel e testavel.

## Analise do Aplicativo Atual

O app atual nao e apenas uma lista de treinos. Ele possui varias camadas funcionais que precisam ser transportadas para Flutter sem simplificacao:

### Stack atual da versao web

- Frontend: React 19 + Vite + TanStack Router.
- Estado: Zustand, incluindo persistencia do treino ativo.
- Banco local: Dexie / IndexedDB.
- Backend: Firebase Auth + Cloud Firestore.
- UI: Tailwind CSS v4 + componentes customizados + Radix Select.
- Graficos: Recharts.
- Notificacoes: Service Worker + Notification API + Web Audio API + vibracao.
- Utilitarios: importacao CSV, exportacao JSON/CSV, compartilhamento de relatorio como imagem, cache local, fila de sincronizacao offline.

### Modulos e rotas existentes hoje

- `/`: dashboard inicial com saudacao, meta semanal, streaks, banner de treino ativo, atalhos e sincronizacao manual.
- `/treinos`: lista de planos ativos e arquivados, iniciar treino, reordenar, arquivar, desarquivar, excluir e importar CSV.
- `/treinos/novo`: criacao de plano com configuracao de cor, series, descanso, observacoes e agrupamentos.
- `/treinos/$planoId`: edicao completa do plano, duplicacao, reordenacao, agrupamentos e inicio de treino.
- `/treinos/importar`: importacao CSV com validacao, revisao dos dados e criacao de exercicios customizados quando necessario.
- `/treino-ativo/$planoId`: fluxo principal do produto, com timers, progresso de treino, PRs, agrupamentos, descanso, notificacoes, pausas e relatorio final com compartilhamento.
- `/historico`: lista de sessoes com filtros por plano e periodo, grafico de volume e exclusao.
- `/historico/$sessaoId`: detalhes de sessao, edicao retroativa de series e deteccao de recordes.
- `/exercicios`: catalogo de exercicios, busca, filtro, favoritos, criacao de exercicios customizados, modal de detalhes e calculadora 1RM.
- `/perfil`: estatisticas gerais, conquistas, notificacoes, exportacao, logout.
- `/perfil/evolucao`: evolucao por exercicio e volume por sessao.
- `/perfil/medidas`: registro e acompanhamento de medidas corporais com grafico.

### Features reais que precisam de paridade

- Login com Google.
- Shell autenticado com bottom navigation fixa e FAB para treino ativo.
- Tema escuro customizado com tokens visuais do app atual.
- Banco local com modelos de planos, sessoes, exercicios customizados, cache do catalogo e medidas corporais.
- Sincronizacao Firestore em background para planos, sessoes, exercicios customizados, medidas e configuracoes do usuario.
- Fila offline para escritas quando nao houver internet.
- Indicador visual de sync e estado online/offline.
- Persistencia do treino ativo entre reinicios do app.
- Sincronizacao em tempo real do treino ativo pela colecao `ativo` do Firestore.
- Catalogo base carregado de uma base remota e cacheado localmente.
- Favoritos de exercicios.
- Criacao de exercicios personalizados com imagem GIF, equipamento e instrucoes.
- Busca de imagem web para exercicios customizados e para revisao da importacao CSV.
- Importacao CSV multi-plano com mapeamento por ID ou nome e revisao antes de salvar.
- Agrupamentos de treino: superset, dropset e giantset.
- Tipos de serie: repeticoes, tempo e falha.
- Auto-preenchimento de carga/repeticoes com base no plano e na ultima sessao.
- Timer geral do treino com pausa precisa e exclusao do tempo pausado.
- Timer de descanso com alerta sonoro, vibracao e notificacao.
- Detecao de PRs por peso, volume da serie e 1RM estimado.
- Relatorio final do treino com compartilhamento como imagem.
- Historico com filtros e grafico de volume.
- Edicao retroativa de sessoes.
- Estatisticas, streaks e conquistas.
- Evolucao de carga por exercicio e evolucao corporal.
- Exportacao de sessoes e planos em JSON e CSV.

## Principios da Migracao Flutter

- O app nativo vivera em `native/`, mantendo a PWA atual intacta.
- A migracao deve ser feita por etapas verticais, nao por camada isolada sem UI testavel.
- A Etapa 1 precisa entregar build executavel, autenticacao basica, navegacao principal, design tokens e persistencia local minima.
- A ordem de implementacao deve seguir risco tecnico: base de dados, sincronizacao, treino ativo e background execution precisam ser resolvidos cedo.
- O objetivo e paridade real. Nada deve ser reduzido para uma versao simplificada apenas para "funcionar".

## Arquitetura Flutter Recomendada

### Stack sugerida

- Estado: `flutter_riverpod`.
- Roteamento: `go_router`.
- Banco local: `isar`.
- Serializacao e modelos: `freezed` + `json_serializable`.
- Firebase: `firebase_core`, `firebase_auth`, `cloud_firestore`, `google_sign_in`.
- Notificacoes locais: `flutter_local_notifications`.
- Audio e vibracao: `audioplayers` ou `just_audio`, `vibration`.
- Graficos: `fl_chart`.
- Compartilhamento: `share_plus`.
- Captura de widget como imagem: `screenshot` ou `widgets_to_image`.
- Preferencias simples: `shared_preferences`.
- HTTP externo: `dio`.
- Drag and drop / reorder: widgets nativos (`ReorderableListView`) e, onde necessario, pacote dedicado.

### Equivalencias tecnicas

- Zustand -> Riverpod providers/notifiers.
- Dexie -> Isar collections com indexes e objetos embutidos.
- localStorage -> SharedPreferences para flags e configuracoes pequenas.
- Service Worker notifications -> Flutter Local Notifications + servicos nativos de background.
- TanStack Router -> go_router com ShellRoute para navegao por abas.
- Recharts -> fl_chart.
- HTML canvas para relatorio -> composicao Flutter renderizada em imagem.

### Estrutura sugerida de pastas em `native/`

```text
native/
	android/
	ios/
	lib/
		app/
			app.dart
			bootstrap.dart
			router/
			theme/
		core/
			constants/
			utils/
			services/
			widgets/
		data/
			local/
			remote/
			models/
			repositories/
			sync/
		features/
			auth/
			dashboard/
			treinos/
			treino_ativo/
			exercicios/
			historico/
			perfil/
			medidas/
			evolucao/
			shared/
	pubspec.yaml
```

## Mapeamento de Dados

Os modelos Flutter devem refletir integralmente os tipos atuais:

- `Exercicio`
- `SerieRegistrada`
- `SeriePlano`
- `ExercicioNoPlano`
- `PlanoDeTreino`
- `ExercicioNaSessao`
- `SessaoDeTreino`
- `EstatisticasTreino`
- `MedidaCorporal`
- enums `TipoSerie`, `TipoAgrupamento`, `GrupoMuscular`

Tambem devem ser preservados:

- `CORES_GRUPO`
- `CORES_PLANO`
- `AGRUPAMENTO_CONFIG`
- `CAMPOS_MEDIDA`
- configuracao de traducao `GRUPOS_EN_PT`

## Persistencia e Sincronizacao

### Banco local nativo

O banco local precisa replicar as tabelas e o comportamento atual:

- planos
- sessoes
- exercicios personalizados
- cache de exercicios base
- medidas corporais
- fila de sincronizacao offline

### Firestore

As colecoes atuais devem continuar existindo e ser consumidas pela app Flutter:

- `planos`
- `sessoes`
- `ativo`
- `exercicios`
- `medidas`
- `configuracoes`

### Regras de sincronizacao a preservar

- Salvar primeiro no banco local.
- Sincronizar em background para Firestore.
- Escutar mudancas remotas quando o usuario estiver autenticado.
- Em caso de offline, enfileirar escritas e reenviar ao reconectar.
- Persistir o treino ativo localmente e tambem refletir no documento `ativo/{userId}`.

## Design System Flutter

O design do app precisa ser reproduzido exatamente, nao apenas aproximado. Isso inclui:

- layout mobile-first com largura util equivalente ao container atual;
- fundo escuro, surfaces em camadas e bordas suaves;
- botao central destacado na bottom nav;
- cards com borda e estados de hover/press equivalentes em mobile;
- tipografia, hierarquia, espacamento e densidade visual atuais;
- cores de grupos musculares, planos e agrupamentos;
- modais fullscreen e bottom sheets equivalentes aos modais web;
- toasts, skeleton loaders, badges, pills, progress bars e confetti.

## Etapas de Implementacao

## Etapa 1 - Fundacao Testavel

> Status: em andamento — projeto Flutter inicializado em `native/`, tema dark-first base criado, shell com bottom navigation + FAB de treino ativo e rotas principais (Dashboard, Treinos, Exercicios, Historico e Perfil) ja estruturadas. 

### Objetivo

Entregar um app Flutter executavel com autenticacao, shell principal, navegacao base, tema fiel, banco local funcional e um primeiro fluxo CRUD simples para confirmar a base do projeto.

### Escopo

- Inicializar o projeto Flutter em `native/`.
- Configurar flavors e integracao Firebase para Android e iOS.
- Implementar bootstrap do app, themes, design tokens e tipografia.
- Implementar `go_router` com estrutura principal das paginas.
- Criar shell autenticado com:
	- login com Google
	- bottom nav
	- FAB de treino ativo
	- estrutura de toast/snackbar
- Configurar Isar, migrations e repositories iniciais.
- Implementar modelos principais.
- Criar a primeira vertical slice funcional:
	- abrir app
	- logar
	- navegar entre abas
	- criar um plano simples localmente
	- fechar e reabrir o app mantendo os dados
- Criar seeds tecnicos minimos para demonstracao inicial.

### Resultado esperado

Ao final da Etapa 1 ja sera possivel instalar, abrir e usar o app Flutter com base visual semelhante ao produto atual, navegacao principal e persistencia local validada.

### Validacao manual da etapa

1. Executar `flutter run` em Android e iOS.
2. Fazer login com Google.
3. Navegar por Dashboard, Treinos, Exercicios, Historico e Perfil.
4. Criar um plano simples e verificar persistencia apos reiniciar o app.
5. Confirmar que o app continua funcional sem internet para o fluxo local basico.

## Etapa 2 - Catalogo de Exercicios

### Objetivo

Migrar o modulo de exercicios com paridade de busca, filtros, favoritos, detalhes e criacao customizada.

### Escopo

- Carregar base remota de exercicios e cachear localmente.
- Reproduzir tela de catalogo com scroll performatico e grid/lista equivalente.
- Implementar busca por nome e grupo muscular.
- Implementar filtro por favoritos.
- Implementar modal de detalhe do exercicio.
- Implementar criacao de exercicio customizado com:
	- nome
	- grupo muscular existente ou novo
	- equipamento
	- GIF/URL de imagem
	- instrucoes em lista
- Implementar busca web de imagem para exercicio customizado.
- Implementar calculadora 1RM.
- Implementar seletor reutilizavel de exercicios para os fluxos de plano.

### Validacao manual da etapa

1. Abrir catalogo e carregar exercicios base.
2. Buscar por nome e por grupo.
3. Favoritar e desfavoritar exercicios.
4. Criar exercicio customizado e confirmar sync local/remoto.
5. Abrir a calculadora 1RM e validar o calculo.

## Etapa 3 - Planos de Treino e Importacao CSV

### Objetivo

Migrar toda a gestao de planos, inclusive criacao/edicao rica, duplicacao, arquivamento, reordenacao e importacao CSV assistida.

### Escopo

- Tela de listagem de planos ativos e arquivados.
- Reordenacao de planos.
- Arquivar, desarquivar, excluir e duplicar plano.
- Tela de criacao de plano.
- Tela de detalhe/edicao de plano.
- Configuracao de cor do plano.
- Adicao de exercicios via picker.
- Configuracao de series, carga, repeticoes, descanso e observacoes.
- Configuracao de `TipoSerie`:
	- reps
	- tempo
	- falha
- Agrupamentos:
	- superset
	- dropset
	- giantset
- Reordenacao dos exercicios do plano.
- Importacao CSV com:
	- download de template
	- parsing
	- validacoes
	- revisao antes de salvar
	- criacao de exercicios personalizados quando necessario
	- associacao por ID ou nome com exercicios existentes
- Sincronizacao local + Firestore de tudo o que for salvo.

### Validacao manual da etapa

1. Criar um plano completo e editar seus exercicios.
2. Agrupar exercicios em superset e giantset.
3. Duplicar um plano e verificar integridade dos dados.
4. Arquivar e restaurar um plano.
5. Importar um CSV de exemplo e confirmar o resultado no banco local e no Firestore.

## Etapa 4 - Treino Ativo

### Objetivo

Migrar a feature mais critica do produto com paridade de timers, fluxo de series, agrupamentos, descanso, PRs e relatorio final.

### Escopo

- Inicializacao de sessao a partir do plano.
- Restauracao de treino ativo persistido.
- Prefill de pesos e repeticoes com base no plano e na ultima sessao.
- Cronometro geral com pausa precisa.
- Cronometro de descanso com estado persistente.
- Suporte a exercicios por tempo.
- Conclusao e desfazer ultima serie.
- Navegacao entre exercicios.
- Regras de agrupamento durante o treino.
- Sincronizacao em tempo real do progresso ativo no Firestore.
- Atualizacao do plano com os ultimos pesos executados.
- Alertas locais de descanso com som e vibracao.
- Deteccao e celebracao de PR.
- Modal de notas durante a sessao.
- Finalizacao do treino com calculo de:
	- duracao
	- volume total
	- series completas
	- repeticoes totais
- Relatorio final com compartilhamento como imagem.

### Validacao manual da etapa

1. Iniciar um treino a partir de um plano existente.
2. Completar series e verificar descanso automatico.
3. Pausar e retomar o treino sem distorcer o tempo total.
4. Minimizar e reabrir o app mantendo o estado.
5. Finalizar o treino e validar historico e relatorio compartilhavel.

## Etapa 5 - Historico, Perfil, Evolucao, Medidas e Exportacao

### Objetivo

Migrar toda a camada de leitura analitica, historico e configuracoes do usuario.

### Escopo

- Tela de historico com filtros por plano e periodo.
- Grafico de volume semanal ou por sessoes recentes.
- Exclusao de sessoes.
- Tela de detalhe da sessao com edicao retroativa.
- Recalculo de volume ao editar sessoes.
- Deteccao de recordes em sessoes passadas.
- Tela de perfil com:
	- estatisticas gerais
	- conquistas
	- configuracoes de notificacao
	- exportacao
	- logout
- Tela de evolucao por exercicio.
- Tela de evolucao de volume.
- Tela de medidas corporais com cadastro, listagem, exclusao e grafico.
- Meta semanal sincronizada com Firestore.
- Exportacao:
	- sessoes CSV
	- sessoes JSON
	- planos JSON

### Validacao manual da etapa

1. Finalizar treinos e validar aparicao no historico.
2. Filtrar por plano e periodo.
3. Editar uma sessao passada e verificar recalculo de volume.
4. Registrar medidas corporais e visualizar grafico.
5. Exportar dados e validar arquivos gerados.

## Etapa 6 - Paridade Nativa Avancada: Live Activities e Notificacoes Aprimoradas

### Objetivo

Adicionar recursos exclusivos do ambiente nativo, mantendo a base do treino ativo funcionando tambem em background de forma confiavel.

### Escopo

- Notificacoes locais aprimoradas para treino e lembretes.
- Agendamento de lembretes recorrentes para treinar.
- Notificacoes de fim de descanso fora do app.
- Acao rapida na notificacao para parar descanso, retomar ou abrir o treino.
- Android:
	- foreground service para manter timers confiaveis
	- notificacao persistente rica com a sessao atual
	- acoes diretas na shade e lock screen
- iOS:
	- ActivityKit
	- Widget extension para Lock Screen e Dynamic Island
	- App Groups para compartilhamento de estado entre app e widget
	- atualizacao em tempo real do treino ativo
- Repasse do estado do treino ativo para as camadas nativas.
- Estrategia robusta de ressincronizacao quando o app voltar ao foreground.

### Validacao manual da etapa

1. Iniciar treino e minimizar o app.
2. Confirmar continuidade do timer de descanso e do timer geral.
3. Receber alerta de descanso finalizado com o app em background.
4. No Android, confirmar notificacao persistente com acoes.
5. No iOS, confirmar Live Activity na Lock Screen e Dynamic Island.

## Itens Fora do Escopo da Migracao

- A PWA atual nao sera removida nesta fase.
- Nao sera feita reescrita parcial do app React existente; a migracao sera paralela em `native/`.
- Nao sera feita simplificacao de modelagem ou de fluxo para "caber" no Flutter.

## Dependencias e Riscos Tecnicos

### Riscos principais

- Execucao confiavel de timers em background.
- Reproducao fiel dos agrupamentos no treino ativo.
- Sincronizacao local-first com conflitos entre dispositivos.
- Busca e cache do catalogo remoto de exercicios.
- Compartilhamento de imagem do relatorio com acabamento visual equivalente.
- Paridade de UX entre modais, feedback, vibracao, PRs e toasts.

### Dependencias externas

- Projeto Firebase atual e credenciais mobile.
- Configuracao de Google Sign-In para Android e iOS.
- Acesso a Mac com Xcode para a etapa de iOS Live Activities.
- Configuracao de certificados, capabilities e App Groups no iOS.

## User Review Required

> [!IMPORTANT]
> A Etapa 6 depende de integracao nativa especifica por plataforma. Para iOS, sera necessario um Mac com Xcode, configuracao de ActivityKit e App Groups. Para Android, sera necessario implementar Foreground Service e notificacao persistente com acoes. A migracao pode avancar ate a Etapa 5 sem esse bloqueio, mas a Etapa 6 exige validacao em dispositivo real ou simulador apropriado.

## Criterio de Conclusao do Projeto

O projeto sera considerado concluido quando:

- todas as telas existentes na PWA estiverem recriadas em Flutter;
- todos os fluxos de dados locais e remotos estiverem equivalentes;
- o treino ativo tiver paridade funcional completa;
- exportacao, medidas, historico, PRs, streaks, conquistas e CSV estiverem operacionais;
- a Etapa 6 entregar notificacoes aprimoradas e suporte nativo a Live Activities / foreground execution.

## Resumo da Ordem Recomendada

1. Fundacao testavel.
2. Catalogo de exercicios.
3. Planos de treino + CSV.
4. Treino ativo.
5. Historico + perfil + evolucao + medidas + exportacao.
6. Live Activities + notificacoes avancadas.

O checklist operacional detalhado de implementacao esta documentado em `task.md`.
