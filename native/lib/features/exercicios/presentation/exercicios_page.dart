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
  List<Exercicio>? _list;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _carregarCatalogo();
  }

  Future<void> _carregarCatalogo() async {
    final repo = ref.read(exerciciosRepositoryProvider);
    await repo.seedSeVazio();
    if (!mounted) return;
    final list = await repo.getAll();
    if (!mounted) return;
    setState(() {
      _list = list;
      _loading = false;
    });
  }

  Future<void> _atualizarCatalogo() async {
    final repo = ref.read(exerciciosRepositoryProvider);
    final ok = await repo.syncFromRemote();
    if (!mounted) return;
    final list = await repo.getAll();
    if (!mounted) return;
    setState(() => _list = list);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          ok
              ? 'Catálogo atualizado.'
              : 'Offline: exibindo catálogo em cache.',
        ),
        backgroundColor: ok ? AppColors.surface : AppColors.surface2,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('Catálogo'),
        actions: [
          IconButton(
            onPressed: _loading ? null : () async { await _atualizarCatalogo(); },
            icon: const Icon(Icons.sync_rounded),
            tooltip: 'Atualizar catálogo',
          ),
        ],
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
            child: _loading
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.accent),
                  )
                : _buildList(_list ?? []),
          ),
        ],
      ),
    );
  }

  Widget _buildList(List<Exercicio> list) {
    var filtered = list;
    if (_query.trim().isNotEmpty) {
      final q = _query.trim().toLowerCase();
      filtered = list
          .where((e) =>
              e.nome.toLowerCase().contains(q) ||
              (e.grupoMuscular?.toLowerCase().contains(q) ?? false))
          .toList();
    }
    if (filtered.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            _query.isEmpty
                ? 'Nenhum exercício no catálogo.\nArraste para baixo para atualizar.'
                : 'Nenhum resultado para "$_query".',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textMuted,
                ),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: _atualizarCatalogo,
      color: AppColors.accent,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
        itemCount: filtered.length,
        itemBuilder: (context, index) {
          final ex = filtered[index];
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
              child: ex.imageUrl != null && ex.imageUrl!.isNotEmpty
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(
                        ex.imageUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Icon(
                          Icons.fitness_center,
                          color: cor ?? AppColors.accent,
                          size: 20,
                        ),
                      ),
                    )
                  : Icon(
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
      ),
    );
  }
}
