import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_design_constants.dart';
import '../../../data/models/exercicio.dart';
import '../../../data/repositories/exercicios_repository.dart';

/// Modal/bottom sheet para escolher um exercício do catálogo.
/// Retorna o [Exercicio] selecionado ou null se fechado sem escolher.
Future<Exercicio?> showExercicioPicker(BuildContext context, WidgetRef ref) async {
  await ref.read(exerciciosRepositoryProvider).seedSeVazio();
  if (!context.mounted) return null;
  return showModalBottomSheet<Exercicio?>(
    context: context,
    isScrollControlled: true,
    backgroundColor: AppColors.surface,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (context) => Consumer(
      builder: (context, ref, _) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.3,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => _ExercicioPickerContent(
          scrollController: scrollController,
          ref: ref,
        ),
      ),
    ),
  );
}

class _ExercicioPickerContent extends ConsumerStatefulWidget {
  const _ExercicioPickerContent({
    required this.scrollController,
    required this.ref,
  });

  final ScrollController scrollController;
  final WidgetRef ref;

  @override
  ConsumerState<_ExercicioPickerContent> createState() =>
      _ExercicioPickerContentState();
}

class _ExercicioPickerContentState extends ConsumerState<_ExercicioPickerContent> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const SizedBox(height: 8),
        Container(
          width: 40,
          height: 4,
          decoration: BoxDecoration(
            color: AppColors.textMuted,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Buscar exercício',
                    hintStyle: TextStyle(color: AppColors.textMuted),
                    prefixIcon: Icon(Icons.search, color: AppColors.textMuted),
                    filled: true,
                    fillColor: AppColors.surface2,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                  style: const TextStyle(color: AppColors.text),
                  onChanged: (v) => setState(() => _query = v),
                ),
              ),
              IconButton(
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(Icons.close),
                color: AppColors.textMuted,
              ),
            ],
          ),
        ),
        const Divider(height: 1),
        Expanded(
          child: FutureBuilder<List<Exercicio>>(
            future: ref.read(exerciciosRepositoryProvider).search(_query),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting &&
                  !snapshot.hasData) {
                return const Center(
                    child: CircularProgressIndicator(color: AppColors.accent));
              }
              final list = snapshot.data ?? [];
              if (list.isEmpty) {
                return Center(
                  child: Text(
                    _query.isEmpty
                        ? 'Nenhum exercício no catálogo.'
                        : 'Nenhum resultado para "$_query".',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textMuted,
                        ),
                    textAlign: TextAlign.center,
                  ),
                );
              }
              return ListView.builder(
                controller: widget.scrollController,
                itemCount: list.length,
                itemBuilder: (context, index) {
                  final ex = list[index];
                  final cor = ex.grupoMuscular != null
                      ? coresGrupo[ex.grupoMuscular]
                      : null;
                  return ListTile(
                    leading: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: (cor ?? AppColors.accent).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        Icons.fitness_center,
                        color: cor ?? AppColors.accent,
                        size: 20,
                      ),
                    ),
                    title: Text(
                      ex.nome,
                      style: const TextStyle(
                        color: AppColors.text,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    subtitle: ex.grupoMuscular != null
                        ? Text(
                            ex.grupoMuscular!,
                            style: TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 12,
                            ),
                          )
                        : null,
                    onTap: () => Navigator.of(context).pop(ex),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}
