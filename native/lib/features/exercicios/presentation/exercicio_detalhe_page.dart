import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_design_constants.dart';
import '../../../data/models/exercicio.dart';
import '../../../data/repositories/exercicios_repository.dart';

class ExercicioDetalhePage extends ConsumerStatefulWidget {
  const ExercicioDetalhePage({super.key, required this.exercicioId});

  final int exercicioId;

  @override
  ConsumerState<ExercicioDetalhePage> createState() => _ExercicioDetalhePageState();
}

class _ExercicioDetalhePageState extends ConsumerState<ExercicioDetalhePage> {
  Exercicio? _ex;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  Future<void> _carregar() async {
    final repo = ref.read(exerciciosRepositoryProvider);
    final ex = await repo.getById(widget.exercicioId);
    if (mounted) {
      setState(() {
        _ex = ex;
        _loading = false;
      });
    }
  }

  Future<void> _toggleFavorito() async {
    if (_ex == null) return;
    await ref.read(exerciciosRepositoryProvider).toggleFavorito(_ex!.id);
    if (mounted) _carregar();
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
    final ex = _ex;
    if (ex == null) {
      return Scaffold(
        backgroundColor: AppColors.bg,
        appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Exercício não encontrado', style: TextStyle(color: AppColors.textMuted)),
              const SizedBox(height: 16),
              TextButton(onPressed: () => context.pop(), child: const Text('Voltar')),
            ],
          ),
        ),
      );
    }
    final cor = ex.grupoMuscular != null ? coresGrupo[ex.grupoMuscular] : null;

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(ex.nome),
        actions: [
          IconButton(
            onPressed: _toggleFavorito,
            icon: Icon(
              ex.favorito ? Icons.favorite : Icons.favorite_border,
              color: ex.favorito ? AppColors.danger : AppColors.textMuted,
            ),
            tooltip: ex.favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (ex.imageUrl != null && ex.imageUrl!.isNotEmpty)
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.network(
                ex.imageUrl!,
                height: 220,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  height: 220,
                  color: AppColors.surface2,
                  child: Icon(Icons.fitness_center, size: 64, color: cor ?? AppColors.accent),
                ),
              ),
            )
          else
            Container(
              height: 160,
              decoration: BoxDecoration(
                color: (cor ?? AppColors.accent).withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(Icons.fitness_center, size: 64, color: cor ?? AppColors.accent),
            ),
          const SizedBox(height: 20),
          if (ex.grupoMuscular != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: (cor ?? AppColors.accent).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      ex.grupoMuscular!,
                      style: TextStyle(
                        color: cor ?? AppColors.accent,
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          if (ex.equipamento != null && ex.equipamento!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  Icon(Icons.sports_gymnastics, size: 18, color: AppColors.textMuted),
                  const SizedBox(width: 8),
                  Text(
                    ex.equipamento!,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textMuted,
                        ),
                  ),
                ],
              ),
            ),
          if (ex.instrucoes != null && ex.instrucoes!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              'Instruções',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    color: AppColors.text,
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              ex.instrucoes!,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textMuted,
                    height: 1.5,
                  ),
            ),
          ],
        ],
      ),
    );
  }
}
