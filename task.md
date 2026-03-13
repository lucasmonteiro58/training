# Checklist de Migracao: React PWA -> Flutter Native

Este arquivo e o checklist operacional da migracao. A ideia e marcar aqui tudo o que for sendo implementado no app Flutter dentro de `native/`.

## Definicao de pronto geral

- [ ] Todas as telas da PWA atual existem em Flutter.
- [ ] O visual do app Flutter replica o visual atual com fidelidade.
- [ ] O comportamento local-first foi preservado.
- [ ] O Firebase Auth e o Firestore estao integrados com as mesmas colecoes e fluxos.
- [ ] O treino ativo funciona com persistencia e sincronizacao.
- [ ] Historico, perfil, exportacao, evolucao e medidas estao completos.
- [ ] A etapa final entrega Live Activities / foreground notification e notificacoes aprimoradas.

## Etapa 1: Fundacao, arquitetura e UI base testavel

Objetivo: fazer o app Flutter subir, navegar e persistir dados basicos desde a primeira etapa.

### Projeto base

- [x] Inicializar o projeto Flutter em `native/`.
- [x] Configurar `pubspec.yaml` com as dependencias principais.
- [ ] Configurar Android e iOS para Firebase.
- [x] Configurar `firebase_options` e bootstrap do app.
- [x] Definir arquitetura base com `flutter_riverpod` + `go_router` + `isar`.
- [x] Criar estrutura de pastas por `app`, `core`, `data` e `features`.

### Tema e design system

- [x] Migrar tokens de cor base do app atual.
- [x] Migrar `CORES_GRUPO`.
- [x] Migrar `CORES_PLANO`.
- [x] Migrar `AGRUPAMENTO_CONFIG`.
- [x] Definir tipografia principal e escalas de texto.
- [x] Reproduzir cards, inputs, botoes, chips, modais e toasts.
- [x] Reproduzir layout dark-first e espacamentos do app atual.
- [x] Criar componentes base reutilizaveis.

### Shell e navegacao

- [x] Criar fluxo de autenticacao com tela de login.
- [x] Implementar login com Google.
- [x] Criar shell autenticado.
- [x] Implementar bottom navigation com botao central destacado.
- [x] Implementar rota inicial equivalente ao dashboard.
- [x] Implementar rotas base para Treinos, Exercicios, Historico e Perfil.
- [x] Reservar rota para Treino Ativo.

### Dados e persistencia minima

- [x] Criar models Flutter equivalentes a `Exercicio`, `PlanoDeTreino`, `SessaoDeTreino` e `MedidaCorporal`. (PlanoDeTreino feito; demais na Etapa 2+)
- [x] Criar models auxiliares para `SerieRegistrada`, `SeriePlano`, `ExercicioNoPlano` e `ExercicioNaSessao`.
- [x] Criar colecoes Isar para planos.
- [ ] Criar colecoes Isar para sessoes.
- [ ] Criar colecoes Isar para exercicios personalizados.
- [ ] Criar colecoes Isar para cache do catalogo.
- [ ] Criar colecoes Isar para medidas.
- [x] Criar camada repository local.
- [x] Persistir configuracoes simples em `SharedPreferences`.

### Vertical slice testavel

- [x] Permitir criar um plano simples localmente.
- [x] Listar o plano salvo na tela de treinos.
- [x] Reabrir o app e confirmar persistencia.
- [x] Validar navegacao entre abas.
- [x] Validar funcionamento basico sem internet.

### Validacao da etapa 1

- [ ] `flutter run` funciona em Android.
- [ ] `flutter run` funciona em iOS.
- [ ] Login com Google autenticando corretamente.
- [x] CRUD local simples de plano funcionando.
- [x] Base visual fiel ao app atual em estado inicial.

## Etapa 2: Catalogo de exercicios

Objetivo: migrar o modulo completo de exercicios com busca, filtro, favoritos e criacao customizada.

### Base de dados de exercicios

- [ ] Implementar cliente para baixar a base remota de exercicios.
- [ ] Mapear grupos EN -> PT-BR.
- [ ] Persistir catalogo em cache local.
- [ ] Implementar fallback offline usando cache.

### Tela de catalogo

- [ ] Criar tela equivalente a `/exercicios`.
- [ ] Implementar busca por nome.
- [ ] Implementar filtro por grupo muscular.
- [ ] Implementar filtro por favoritos.
- [ ] Implementar lista/grid performatica com virtualizacao ou estrategia equivalente.
- [ ] Implementar estado vazio e loading skeleton.

### Detalhe e favoritos

- [ ] Abrir detalhe do exercicio com nome, grupo, equipamento, GIF e instrucoes.
- [ ] Salvar favorito localmente.
- [ ] Refletir favoritos em exercicios base e personalizados.

### Criacao de exercicio customizado

- [ ] Criar modal ou tela de novo exercicio.
- [ ] Permitir grupo muscular existente ou grupo novo.
- [ ] Permitir equipamento.
- [ ] Permitir instrucoes multilinha.
- [ ] Permitir GIF/URL manual.
- [ ] Implementar busca web de imagem.
- [ ] Persistir exercicio customizado localmente.
- [ ] Sincronizar exercicio customizado com Firestore.

### Componentes relacionados

- [ ] Implementar `ExercicioPicker` reutilizavel para planos.
- [ ] Implementar calculadora 1RM.

### Validacao da etapa 2

- [ ] Catalogo carrega com dados reais.
- [ ] Busca e filtros retornam resultados corretos.
- [ ] Favoritos persistem apos reinicio.
- [ ] Criacao de exercicio personalizado funcionando local e remoto.
- [ ] Calculadora 1RM equivalente a web.

## Etapa 3: Planos de treino, edicao rica e importacao CSV

Objetivo: migrar toda a gestao de fichas e o fluxo de importacao assistida.

### Lista de planos

- [x] Criar tela `/treinos` equivalente.
- [x] Listar planos ativos.
- [x] Listar planos arquivados.
- [x] Arquivar plano.
- [x] Desarquivar plano.
- [x] Excluir plano.
- [x] Duplicar plano.
- [x] Reordenar planos.
- [x] Exibir estados vazios e skeletons.

### Criacao de plano

- [x] Criar tela equivalente a `/treinos/novo`.
- [x] Configurar nome e descricao.
- [x] Configurar cor do plano.
- [ ] Adicionar exercicios pelo picker.
- [ ] Configurar series, peso, repeticoes e descanso.
- [ ] Configurar notas por exercicio.
- [ ] Reordenar exercicios.
- [ ] Bloquear saida com alteracoes nao salvas.

### Edicao de plano

- [x] Criar tela equivalente a `/treinos/$planoId`.
- [x] Permitir edicao do nome.
- [ ] Permitir edicao completa dos exercicios.
- [ ] Salvar e sincronizar alteracoes.
- [x] Implementar CTA para iniciar treino.

### Tipos de serie e agrupamentos

- [ ] Implementar `TipoSerie.reps`.
- [ ] Implementar `TipoSerie.tempo`.
- [ ] Implementar `TipoSerie.falha`.
- [ ] Implementar superset.
- [ ] Implementar dropset.
- [ ] Implementar giantset.
- [ ] Implementar UI de agrupamento e desagrupamento.

### Importacao CSV

- [ ] Criar tela equivalente a `/treinos/importar`.
- [ ] Implementar download de template CSV.
- [ ] Implementar parser CSV.
- [ ] Validar colunas obrigatorias.
- [ ] Validar series, repeticoes, peso e descanso.
- [ ] Associar exercicios por ID.
- [ ] Associar exercicios por nome exato.
- [ ] Criar exercicios customizados quando necessario.
- [ ] Permitir revisar os planos importados antes de salvar.
- [ ] Permitir editar nome, imagem, grupo, instrucoes e series antes de confirmar importacao.
- [ ] Salvar os planos importados no banco local.
- [ ] Sincronizar os planos importados com Firestore.

### Validacao da etapa 3

- [ ] Criar e editar plano complexo sem perda de dados.
- [ ] Agrupamentos funcionando na edicao.
- [ ] Reordenacao persistindo corretamente.
- [ ] Importacao CSV funcionando com template e com casos reais.
- [ ] Firestore refletindo criacao, edicao e exclusao de planos.

## Etapa 4: Treino ativo

Objetivo: migrar o fluxo principal do produto com timers, series, descanso, PRs e relatorio.

### Estado do treino ativo

- [ ] Criar store/provider equivalente a `useTreinoAtivoStore`.
- [ ] Persistir treino ativo localmente.
- [ ] Restaurar treino ativo ao reabrir o app.
- [ ] Sincronizar estado do treino ativo em `ativo/{userId}`.
- [ ] Implementar reconciliacao de estado vindo de outro dispositivo.

### Inicializacao da sessao

- [ ] Criar sessao a partir do plano selecionado.
- [ ] Preencher cargas e repeticoes com base no plano.
- [ ] Preencher com base na ultima sessao quando existir.
- [ ] Respeitar `TipoSerie`, `duracaoMetaSegundos` e agrupamentos.

### Temporizadores

- [ ] Implementar cronometro geral.
- [ ] Implementar pausa e retomada sem contaminar o tempo ativo.
- [ ] Implementar cronometro de descanso.
- [ ] Persistir timestamp de fim do descanso.
- [ ] Implementar timer de serie para exercicios por tempo.

### Interacao de series

- [ ] Visualizar serie meta vs realizada.
- [ ] Marcar serie como concluida.
- [ ] Desmarcar serie concluida.
- [ ] Desfazer ultima serie.
- [ ] Atualizar peso e repeticoes durante o treino.
- [ ] Atualizar notas da sessao.
- [ ] Atualizar pesos recentes no plano ao trocar ou finalizar exercicio.

### Regras de agrupamento durante a sessao

- [ ] Fluxo correto para superset.
- [ ] Fluxo correto para dropset.
- [ ] Fluxo correto para giantset.
- [ ] Pular descanso quando a regra do agrupamento exigir.
- [ ] Avancar automaticamente ao final do grupo quando aplicavel.

### Notificacao de descanso e feedback local

- [ ] Pedir permissao de notificacao local.
- [ ] Disparar notificacao de descanso em andamento.
- [ ] Agendar alerta para fim do descanso.
- [ ] Cancelar alerta ao pular descanso.
- [ ] Tocar alerta sonoro ao final do descanso.
- [ ] Vibrar ao final do descanso.
- [ ] Implementar feedback nos 5 segundos finais do descanso.

### PRs, calculos e finalizacao

- [ ] Calcular volume total em tempo real.
- [ ] Detectar novo PR por peso.
- [ ] Detectar novo PR por volume de serie.
- [ ] Detectar novo PR por 1RM estimado.
- [ ] Exibir celebracao visual de PR.
- [ ] Finalizar treino com confirmacao.
- [ ] Cancelar treino em andamento com confirmacao.
- [ ] Salvar sessao finalizada localmente.
- [ ] Sincronizar sessao finalizada com Firestore.

### Relatorio final

- [ ] Criar tela/modal de relatorio final.
- [ ] Exibir duracao, volume, exercicios, series e repeticoes.
- [ ] Exibir distribuicao por exercicio.
- [ ] Exibir grupos musculares trabalhados.
- [ ] Gerar imagem do relatorio.
- [ ] Compartilhar imagem usando share sheet nativo.

### Validacao da etapa 4

- [ ] Treino completo executado sem falhas.
- [ ] Estado mantido ao minimizar e reabrir o app.
- [ ] Descanso e alertas funcionando com confiabilidade.
- [ ] Historico recebe a sessao finalizada.
- [ ] Relatorio compartilhavel gerado corretamente.

## Etapa 5: Historico, perfil, estatisticas, evolucao, medidas e exportacao

Objetivo: migrar toda a camada de leitura, gestao pessoal e analitica do usuario.

### Historico

- [ ] Criar tela equivalente a `/historico`.
- [ ] Listar sessoes ordenadas por data.
- [ ] Filtrar por plano.
- [ ] Filtrar por periodo.
- [ ] Exibir grafico de volume.
- [ ] Excluir sessao com confirmacao.

### Detalhe de sessao

- [ ] Criar tela equivalente a `/historico/$sessaoId`.
- [ ] Exibir metadados da sessao.
- [ ] Exibir series por exercicio.
- [ ] Destacar series concluidas.
- [ ] Exibir PRs historicos.
- [ ] Editar peso e repeticoes apos o treino.
- [ ] Recalcular volume apos edicao.
- [ ] Salvar alteracoes e sincronizar.

### Perfil e configuracoes

- [ ] Criar tela equivalente a `/perfil`.
- [ ] Exibir dados do usuario autenticado.
- [ ] Exibir estatisticas gerais.
- [ ] Exibir streak atual e melhor streak.
- [ ] Exibir conquistas desbloqueadas e bloqueadas.
- [ ] Implementar toggle de notificacoes.
- [ ] Implementar logout.

### Evolucao

- [ ] Criar tela equivalente a `/perfil/evolucao`.
- [ ] Exibir evolucao por exercicio.
- [ ] Exibir volume por sessao.
- [ ] Exibir mini sparklines e graficos expandidos.

### Medidas corporais

- [ ] Criar tela equivalente a `/perfil/medidas`.
- [ ] Cadastrar nova medida corporal.
- [ ] Excluir medida corporal.
- [ ] Plotar grafico por campo selecionado.
- [ ] Sincronizar medidas com Firestore.

### Exportacao de dados

- [ ] Exportar historico em CSV.
- [ ] Exportar sessoes em JSON.
- [ ] Exportar planos em JSON.
- [ ] Validar nomeacao e conteudo dos arquivos exportados.

### Configuracoes remotas do usuario

- [ ] Migrar `metaSemanal` para Flutter.
- [ ] Ler configuracoes do Firestore.
- [ ] Persistir configuracoes localmente.
- [ ] Sincronizar alteracoes de configuracao.

### Validacao da etapa 5

- [ ] Historico, detalhe, perfil, evolucao e medidas equivalentes a web.
- [ ] Exportacoes abrindo corretamente fora do app.
- [ ] Estatisticas coerentes com o historico existente.
- [ ] Medidas salvas e sincronizadas corretamente.

## Etapa 6: Live Activities, foreground execution e notificacoes aprimoradas

Objetivo: adicionar recursos nativos que nao existem hoje na PWA.

### Base de notificacoes aprimoradas

- [ ] Definir arquitetura de notificacoes locais e background por plataforma.
- [ ] Criar preferencia de notificacoes recorrentes.
- [ ] Implementar lembretes agendados para treinar.
- [ ] Implementar acoes rapidas nas notificacoes.
- [ ] Implementar reabertura do treino a partir da notificacao.

### Android

- [ ] Criar foreground service para treino ativo.
- [ ] Exibir notificacao persistente com estado do treino.
- [ ] Exibir exercicio atual, timer e series restantes.
- [ ] Permitir acoes de pausar, retomar e encerrar descanso.
- [ ] Garantir sobrevivencia do timer em background.

### iOS

- [ ] Configurar ActivityKit.
- [ ] Configurar Widget Extension.
- [ ] Configurar App Groups.
- [ ] Publicar estado minimo do treino ativo para a Live Activity.
- [ ] Exibir treino ativo na Lock Screen.
- [ ] Exibir treino ativo na Dynamic Island.
- [ ] Permitir atualizacao frequente do estado com baixo consumo.

### Integracao com treino ativo

- [ ] Espelhar `cronometroGeralSegundos` na camada nativa.
- [ ] Espelhar `cronometroDescansoSegundos` na camada nativa.
- [ ] Espelhar exercicio atual e progresso.
- [ ] Espelhar estado de pausa/retomada.
- [ ] Encerrar Live Activity / foreground notification ao finalizar sessao.

### Validacao da etapa 6

- [ ] Timer confiavel com app em background no Android.
- [ ] Timer confiavel com app em background no iOS.
- [ ] Notificacao de descanso finalizado disparando fora do app.
- [ ] Live Activity funcionando em iOS 16.1+.
- [ ] Notificacao persistente rica funcionando no Android.

## Cross-cutting: sincronizacao, qualidade e paridade final

### Sincronizacao e offline-first

- [ ] Implementar fila offline de escritas.
- [ ] Reprocessar fila ao voltar online.
- [ ] Exibir indicador de sync pendente.
- [ ] Exibir indicador de offline.
- [ ] Resolver conflitos simples entre local e remoto.

### Performance e UX

- [ ] Garantir scroll suave nas listas grandes.
- [ ] Otimizar cache de imagens e GIFs.
- [ ] Reproduzir skeletons e estados de loading.
- [ ] Reproduzir estados vazios e mensagens de erro.
- [ ] Testar em telas menores e maiores.

### QA de paridade

- [ ] Comparar tela por tela com a PWA.
- [ ] Comparar fluxo por fluxo com a PWA.
- [ ] Comparar payloads locais e remotos com a PWA.
- [ ] Validar dados exportados e importados.
- [ ] Validar uso offline, retorno online e troca de dispositivo.

### Entrega final

- [ ] App Flutter em `native/` completo.
- [ ] Todas as etapas acima marcadas.
- [ ] Build Android gerado.
- [ ] Build iOS gerado.
- [ ] Checklist de paridade aprovado.
