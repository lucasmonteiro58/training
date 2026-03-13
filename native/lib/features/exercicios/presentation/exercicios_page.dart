import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_design_constants.dart';
import '../../../data/models/exercicio.dart';
import '../../../data/repositories/exercicios_repository.dart';

class ExerciciosPage extends ConsumerStatefulWidget {
  const ExerciciosPage({super.key});

  @override
  ConsumerState<ExerciciosPage> createState() => _ExerciciosPageState();
}

class _ExerciciosPageState extends ConsumerState<ExerciciosPage> {
  String _query = '';

  @override
  void initState() {
    super.initState();
    ref.read(exerciciosRepositoryProvider).seedSeVazio();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('Exercícios'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Buscar exercício',
                hintStyle: TextStyle(color: AppColors.textMuted),
                prefixIcon: Icon(Icons.search, color: AppColors.textMuted),
                filled: true,
                fillColor: AppColors.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              style: const TextStyle(color: AppColors.text),
              onChanged: (v) => setState(() => _query = v),
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: FutureBuilder<List<Exercicio>>(
              key: ValueKey(_query),
              future: ref.read(exerciciosRepositoryProvider).search(_query),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting &&
                    !snapshot.hasData) {
                  return const Center(
                    child: CircularProgressIndicator(color: AppColors.accent),
                  );
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
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
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
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
