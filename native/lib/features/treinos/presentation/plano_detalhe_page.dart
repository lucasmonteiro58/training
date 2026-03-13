import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_design_constants.dart';
import '../../../data/models/exercicio_no_plano_entity.dart';
import '../../../data/models/plano_de_treino.dart';
import '../../../data/repositories/exercicios_repository.dart';
import '../../../data/repositories/treinos_repository.dart';
import '../../exercicios/presentation/exercicio_picker.dart';

class PlanoDetalhePage extends ConsumerStatefulWidget {
  const PlanoDetalhePage({super.key, required this.planoId});

  final int planoId;

  @override
  ConsumerState<PlanoDetalhePage> createState() => _PlanoDetalhePageState();
}

class _PlanoDetalhePageState extends ConsumerState<PlanoDetalhePage> {
  PlanoDeTreino? _plano;
  bool _loading = true;
  bool _editando = false;
  final _nomeController = TextEditingController();
  final _descricaoController = TextEditingController();
  int? _corSelecionada;

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  @override
  void dispose() {
    _nomeController.dispose();
    _descricaoController.dispose();
    super.dispose();
  }

  void _iniciarEdicao() {
    if (_plano == null) return;
    _nomeController.text = _plano!.nome;
    _descricaoController.text = _plano!.descricao ?? '';
    _corSelecionada = _plano!.cor;
    setState(() => _editando = true);
  }

  void _cancelarEdicao() {
    setState(() => _editando = false);
  }

  Future<void> _salvarEdicao() async {
    final nome = _nomeController.text.trim();
    if (nome.isEmpty) return;
    await ref.read(treinosRepositoryProvider).atualizar(
          widget.planoId,
          nome: nome,
          descricao: _descricaoController.text.trim().isEmpty
              ? null
              : _descricaoController.text.trim(),
          cor: _corSelecionada,
        );
    if (mounted) {
      setState(() => _editando = false);
      _carregar();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Plano atualizado')),
      );
    }
  }

  Future<void> _carregar() async {
    final repo = ref.read(treinosRepositoryProvider);
    final plano = await repo.getById(widget.planoId);
    if (mounted) {
      setState(() {
        _plano = plano;
        _loading = false;
      });
    }
  }

  Future<void> _excluir() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('Excluir plano'),
        content: Text(
          'Excluir "${_plano?.nome}"? Esta ação não pode ser desfeita.',
          style: const TextStyle(color: AppColors.textMuted),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text('Cancelar', style: TextStyle(color: AppColors.textMuted)),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
            child: const Text('Excluir'),
          ),
        ],
      ),
    );
    if (confirm != true || !mounted) return;
    await ref.read(treinosRepositoryProvider).excluir(widget.planoId);
    if (mounted) {
      context.pop();
    }
  }

  Future<void> _duplicar() async {
    await ref.read(treinosRepositoryProvider).duplicar(widget.planoId);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Plano duplicado')),
      );
    }
  }

  Future<void> _arquivar() async {
    await ref.read(treinosRepositoryProvider).arquivar(widget.planoId);
    if (mounted) context.pop();
  }

  Future<void> _desarquivar() async {
    await ref.read(treinosRepositoryProvider).desarquivar(widget.planoId);
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        backgroundColor: AppColors.bg,
        appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
        body: const Center(child: CircularProgressIndicator(color: AppColors.accent)),
      );
    }

    if (_plano == null) {
      return Scaffold(
        backgroundColor: AppColors.bg,
        appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Plano não encontrado', style: TextStyle(color: AppColors.textMuted)),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => context.pop(),
                child: const Text('Voltar'),
              ),
            ],
          ),
        ),
      );
    }

    final plano = _plano!;
    final cor = plano.cor != null ? Color(plano.cor!) : AppColors.accent;

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(plano.nome),
        actions: [
          if (_editando)
            TextButton(
              onPressed: _cancelarEdicao,
              child: Text('Cancelar', style: TextStyle(color: AppColors.textMuted)),
            )
          else
            IconButton(
              onPressed: _iniciarEdicao,
              icon: const Icon(Icons.edit_outlined),
              tooltip: 'Editar',
            ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert),
            color: AppColors.surface,
            onSelected: (value) async {
              switch (value) {
                case 'duplicar':
                  await _duplicar();
                  break;
                case 'arquivar':
                  await _arquivar();
                  break;
                case 'desarquivar':
                  await _desarquivar();
                  break;
                case 'excluir':
                  await _excluir();
                  break;
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'duplicar', child: Text('Duplicar')),
              PopupMenuItem(
                value: plano.arquivado ? 'desarquivar' : 'arquivar',
                child: Text(plano.arquivado ? 'Desarquivar' : 'Arquivar'),
              ),
              const PopupMenuItem(
                value: 'excluir',
                child: Text('Excluir', style: TextStyle(color: AppColors.danger)),
              ),
            ],
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(16),
            ),
            child: _editando
                ? _FormEdicao(
                    nomeController: _nomeController,
                    descricaoController: _descricaoController,
                    corSelecionada: _corSelecionada,
                    onCorChanged: (v) => setState(() => _corSelecionada = v),
                    onSalvar: _salvarEdicao,
                    onCancelar: _cancelarEdicao,
                  )
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: cor,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.fitness_center, color: Colors.white, size: 24),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  plano.nome,
                                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                        color: AppColors.text,
                                        fontWeight: FontWeight.w700,
                                      ),
                                ),
                                if (plano.descricao != null && plano.descricao!.isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Text(
                                      plano.descricao!,
                                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                            color: AppColors.textMuted,
                                          ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
          ),
          const SizedBox(height: 24),
          _SecaoExercicios(planoId: widget.planoId),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: () {
                // TODO: navegar para treino ativo com este plano
                context.go('/treino-ativo');
              },
              icon: const Icon(Icons.play_arrow_rounded),
              label: const Text('Iniciar treino'),
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.accent,
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FormEdicao extends StatelessWidget {
  const _FormEdicao({
    required this.nomeController,
    required this.descricaoController,
    required this.corSelecionada,
    required this.onCorChanged,
    required this.onSalvar,
    required this.onCancelar,
  });

  final TextEditingController nomeController;
  final TextEditingController descricaoController;
  final int? corSelecionada;
  final ValueChanged<int?> onCorChanged;
  final VoidCallback onSalvar;
  final VoidCallback onCancelar;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextFormField(
          controller: nomeController,
          decoration: const InputDecoration(labelText: 'Nome'),
          validator: (v) => (v == null || v.trim().isEmpty) ? 'Obrigatório' : null,
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: descricaoController,
          decoration: const InputDecoration(labelText: 'Descrição (opcional)'),
          maxLines: 2,
        ),
        const SizedBox(height: 16),
        Text(
          'Cor',
          style: Theme.of(context).textTheme.labelMedium?.copyWith(color: AppColors.textMuted),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            GestureDetector(
              onTap: () => onCorChanged(null),
              child: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppColors.surface2,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: corSelecionada == null ? AppColors.accent : AppColors.border,
                    width: corSelecionada == null ? 2 : 1,
                  ),
                ),
              ),
            ),
            ...coresPlano.map((c) => GestureDetector(
                  onTap: () => onCorChanged(c.toARGB32()),
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: c,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: corSelecionada == c.toARGB32() ? AppColors.accent : AppColors.border,
                        width: corSelecionada == c.toARGB32() ? 2 : 1,
                      ),
                    ),
                  ),
                )),
          ],
        ),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            TextButton(onPressed: onCancelar, child: const Text('Cancelar')),
            const SizedBox(width: 8),
            FilledButton(
              onPressed: () {
                if (nomeController.text.trim().isNotEmpty) onSalvar();
              },
              style: FilledButton.styleFrom(backgroundColor: AppColors.accent),
              child: const Text('Salvar'),
            ),
          ],
        ),
      ],
    );
  }
}

class _SecaoExercicios extends ConsumerWidget {
  const _SecaoExercicios({required this.planoId});

  final int planoId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final exerciciosAsync = ref.watch(exerciciosDoPlanoProvider(planoId));
    final repo = ref.read(exerciciosRepositoryProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Exercícios',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: AppColors.text,
                    fontWeight: FontWeight.w600,
                  ),
            ),
            TextButton.icon(
              onPressed: () async {
                final ex = await showExercicioPicker(context, ref);
                if (ex != null && context.mounted) {
                  await repo.addExercicioAoPlano(
                    planoId: planoId,
                    exercicioId: ex.id.toString(),
                    exercicioNome: ex.nome,
                  );
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('${ex.nome} adicionado')),
                    );
                  }
                }
              },
              icon: const Icon(Icons.add, size: 20),
              label: const Text('Adicionar'),
              style: TextButton.styleFrom(foregroundColor: AppColors.accent),
            ),
          ],
        ),
        const SizedBox(height: 8),
        exerciciosAsync.when(
          data: (list) {
            if (list.isEmpty) {
              return Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Center(
                  child: Text(
                    'Nenhum exercício no plano.\nToque em Adicionar para incluir.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textMuted,
                        ),
                    textAlign: TextAlign.center,
                  ),
                ),
              );
            }
            return Column(
              children: list.map((ent) => _ExercicioPlanoTile(
                key: ValueKey(ent.id),
                entity: ent,
                onRemover: () async {
                  await repo.removeExercicioDoPlano(ent.id);
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Exercício removido')),
                    );
                  }
                },
                onEditar: () => _mostrarEdicaoExercicio(context, ref, ent),
              )).toList(),
            );
          },
          loading: () => const Center(
            child: Padding(
              padding: EdgeInsets.all(24),
              child: CircularProgressIndicator(color: AppColors.accent),
            ),
          ),
          error: (e, _) => Text(
            'Erro: $e',
            style: TextStyle(color: AppColors.danger, fontSize: 12),
          ),
        ),
      ],
    );
  }

  void _mostrarEdicaoExercicio(
    BuildContext context,
    WidgetRef ref,
    ExercicioNoPlanoEntity ent,
  ) {
    final seriesController = TextEditingController(text: ent.series.toString());
    final repController = TextEditingController(text: ent.repeticoesMeta.toString());
    final pesoController = TextEditingController(
      text: ent.pesoMeta != null ? ent.pesoMeta.toString() : '',
    );
    final descansoController = TextEditingController(
      text: ent.descansoSegundos.toString(),
    );

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: Text('Editar: ${ent.exercicioNome ?? "Exercício"}'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: seriesController,
                decoration: const InputDecoration(labelText: 'Séries'),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),
              TextField(
                controller: repController,
                decoration: const InputDecoration(labelText: 'Repetições'),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),
              TextField(
                controller: pesoController,
                decoration: const InputDecoration(labelText: 'Peso (kg)'),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: descansoController,
                decoration: const InputDecoration(labelText: 'Descanso (seg)'),
                keyboardType: TextInputType.number,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text('Cancelar', style: TextStyle(color: AppColors.textMuted)),
          ),
          FilledButton(
            onPressed: () async {
              final series = int.tryParse(seriesController.text) ?? ent.series;
              final rep = int.tryParse(repController.text) ?? ent.repeticoesMeta;
              final peso = double.tryParse(pesoController.text.replaceAll(',', '.'));
              final descanso = int.tryParse(descansoController.text) ?? ent.descansoSegundos;
              ent.series = series;
              ent.repeticoesMeta = rep;
              ent.pesoMeta = (peso != null && !peso.isNaN) ? peso : null;
              ent.descansoSegundos = descanso;
              await ref.read(exerciciosRepositoryProvider).updateExercicioNoPlano(ent);
              if (context.mounted) Navigator.of(context).pop();
            },
            style: FilledButton.styleFrom(backgroundColor: AppColors.accent),
            child: const Text('Salvar'),
          ),
        ],
      ),
    );
  }
}

class _ExercicioPlanoTile extends StatelessWidget {
  const _ExercicioPlanoTile({
    super.key,
    required this.entity,
    required this.onRemover,
    required this.onEditar,
  });

  final ExercicioNoPlanoEntity entity;
  final VoidCallback onRemover;
  final VoidCallback onEditar;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  entity.exercicioNome ?? 'Exercício',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        color: AppColors.text,
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${entity.series} x ${entity.repeticoesMeta}'
                  '${entity.pesoMeta != null ? ' • ${entity.pesoMeta} kg' : ''}'
                  ' • ${entity.descansoSegundos}s desc.',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textMuted,
                        fontSize: 12,
                      ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: onEditar,
            icon: const Icon(Icons.edit_outlined, size: 20),
            color: AppColors.textMuted,
          ),
          IconButton(
            onPressed: () async {
              final ok = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  backgroundColor: AppColors.surface,
                  title: const Text('Remover exercício'),
                  content: Text(
                    'Remover "${entity.exercicioNome}" do plano?',
                    style: const TextStyle(color: AppColors.textMuted),
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, false),
                      child: Text('Cancelar', style: TextStyle(color: AppColors.textMuted)),
                    ),
                    FilledButton(
                      onPressed: () => Navigator.pop(ctx, true),
                      style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
                      child: const Text('Remover'),
                    ),
                  ],
                ),
              );
              if (ok == true) onRemover();
            },
            icon: const Icon(Icons.delete_outline, size: 20),
            color: AppColors.danger,
          ),
        ],
      ),
    );
  }
}
