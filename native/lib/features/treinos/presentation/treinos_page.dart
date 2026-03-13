import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../data/models/plano_de_treino.dart';
import '../../../data/repositories/treinos_repository.dart';

final planosProvider = StreamProvider<List<PlanoDeTreino>>(
  (ref) {
    final repo = ref.watch(treinosRepositoryProvider);
    return repo.watchPlanos();
  },
);

final planosArquivadosProvider = StreamProvider<List<PlanoDeTreino>>(
  (ref) {
    final repo = ref.watch(treinosRepositoryProvider);
    return repo.watchPlanosArquivados();
  },
);

class TreinosPage extends ConsumerWidget {
  const TreinosPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final planosAsync = ref.watch(planosProvider);
    final arquivadosAsync = ref.watch(planosArquivadosProvider);
    final repo = ref.watch(treinosRepositoryProvider);

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('Treinos'),
      ),
      body: planosAsync.when(
        data: (planos) {
          return arquivadosAsync.when(
            data: (arquivados) {
              if (planos.isEmpty && arquivados.isEmpty) {
                return const _EmptyState();
              }
              return ListView(
                padding: const EdgeInsets.only(
                  left: 16,
                  right: 16,
                  top: 8,
                  bottom: 80 + 16,
                ),
                children: [
                  ...planos.map((plano) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _PlanoCard(
                          plano: plano,
                          repo: repo,
                        ),
                      )),
                  if (arquivados.isNotEmpty) ...[
                    const SizedBox(height: 24),
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Text(
                        'Arquivados',
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              color: AppColors.textMuted,
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                    ),
                    ...arquivados.map((plano) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _PlanoCard(
                            plano: plano,
                            repo: repo,
                            arquivado: true,
                          ),
                        )),
                  ],
                ],
              );
            },
            loading: () => const Center(child: CircularProgressIndicator(color: AppColors.accent)),
            error: (error, stackTrace) => const SizedBox.shrink(),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.accent)),
        error: (error, stackTrace) => Center(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              'Não foi possível carregar seus treinos.\n$error',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textMuted),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/treinos/novo'),
        backgroundColor: AppColors.accent,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.fitness_center_outlined, size: 48, color: AppColors.textMuted),
            const SizedBox(height: 16),
            Text(
              'Nenhum plano ainda',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppColors.text),
            ),
            const SizedBox(height: 8),
            Text(
              'Toque em + para criar um plano.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textMuted),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _PlanoCard extends StatelessWidget {
  const _PlanoCard({
    required this.plano,
    required this.repo,
    this.arquivado = false,
  });

  final PlanoDeTreino plano;
  final TreinosRepository repo;
  final bool arquivado;

  @override
  Widget build(BuildContext context) {
    final cor = plano.cor != null ? Color(plano.cor!) : AppColors.accent;

    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: () => context.push('/treinos/${plano.id}'),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: cor,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.fitness_center, color: Colors.white, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      plano.nome,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            color: AppColors.text,
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      plano.descricao?.isNotEmpty == true
                          ? plano.descricao!
                          : 'Sem descrição',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.textMuted,
                          ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              PopupMenuButton<String>(
                icon: Icon(Icons.more_vert, color: AppColors.textMuted, size: 20),
                color: AppColors.surface,
                onSelected: (value) async {
                  switch (value) {
                    case 'duplicar':
                      await repo.duplicar(plano.id);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Plano duplicado')),
                        );
                      }
                      break;
                    case 'arquivar':
                      await repo.arquivar(plano.id);
                      break;
                    case 'desarquivar':
                      await repo.desarquivar(plano.id);
                      break;
                    case 'excluir':
                      final ok = await showDialog<bool>(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          backgroundColor: AppColors.surface,
                          title: const Text('Excluir plano'),
                          content: Text(
                            'Excluir "${plano.nome}"?',
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
                              child: const Text('Excluir'),
                            ),
                          ],
                        ),
                      );
                      if (ok == true) {
                        await repo.excluir(plano.id);
                        if (context.mounted) context.pop();
                      }
                      break;
                  }
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(value: 'duplicar', child: Text('Duplicar')),
                  PopupMenuItem(
                    value: arquivado ? 'desarquivar' : 'arquivar',
                    child: Text(arquivado ? 'Desarquivar' : 'Arquivar'),
                  ),
                  const PopupMenuItem(
                    value: 'excluir',
                    child: Text('Excluir', style: TextStyle(color: AppColors.danger)),
                  ),
                ],
              ),
              Material(
                color: AppColors.accent,
                borderRadius: BorderRadius.circular(12),
                child: InkWell(
                  onTap: () => context.push('/treinos/${plano.id}'),
                  borderRadius: BorderRadius.circular(12),
                  child: const SizedBox(
                    width: 36,
                    height: 36,
                    child: Icon(Icons.play_arrow_rounded, color: Colors.white, size: 20),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
