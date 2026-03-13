import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/constants/app_colors.dart';
import '../../../data/models/plano_de_treino.dart';
import '../../../data/repositories/treinos_repository.dart';

final planosProvider = StreamProvider<List<PlanoDeTreino>>(
  (ref) {
    final repo = ref.watch(treinosRepositoryProvider);
    return repo.watchPlanos();
  },
);

class TreinosPage extends ConsumerWidget {
  const TreinosPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final planosAsync = ref.watch(planosProvider);
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
          if (planos.isEmpty) {
            return const _EmptyState();
          }
          return ListView.separated(
            padding: const EdgeInsets.only(
              left: 16,
              right: 16,
              top: 8,
              bottom: 80 + 16,
            ),
            itemCount: planos.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final plano = planos[index];
              return _PlanoCard(plano: plano);
            },
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
        onPressed: () async {
          final nome = await showDialog<String>(
            context: context,
            builder: (context) => const _NovoPlanoDialog(),
          );
          if (nome != null && nome.trim().isNotEmpty) {
            await repo.criarPlanoSimples(nome: nome.trim());
          }
        },
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
              'Crie um plano simples para testar a persistência local da Etapa 1.',
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
  const _PlanoCard({required this.plano});

  final PlanoDeTreino plano;

  @override
  Widget build(BuildContext context) {
    final cor = plano.cor != null ? Color(plano.cor!) : AppColors.accent;

    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: () {
          // TODO: navegar para detalhe do plano
        },
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
              Material(
                color: AppColors.accent,
                borderRadius: BorderRadius.circular(12),
                child: InkWell(
                  onTap: () {
                    // TODO: iniciar treino
                  },
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

class _NovoPlanoDialog extends StatefulWidget {
  const _NovoPlanoDialog();

  @override
  State<_NovoPlanoDialog> createState() => _NovoPlanoDialogState();
}

class _NovoPlanoDialogState extends State<_NovoPlanoDialog> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppColors.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      title: Text('Novo plano', style: TextStyle(color: AppColors.text)),
      content: TextField(
        controller: _controller,
        autofocus: true,
        style: TextStyle(color: AppColors.text),
        decoration: const InputDecoration(
          labelText: 'Nome do plano',
        ),
        onSubmitted: (_) => _submit(),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text('Cancelar', style: TextStyle(color: AppColors.textMuted)),
        ),
        FilledButton(
          onPressed: _submit,
          style: FilledButton.styleFrom(backgroundColor: AppColors.accent),
          child: const Text('Criar'),
        ),
      ],
    );
  }

  void _submit() {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    Navigator.of(context).pop(text);
  }
}
