import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_design_constants.dart';
import '../../../data/repositories/treinos_repository.dart';

class NovoPlanoPage extends ConsumerStatefulWidget {
  const NovoPlanoPage({super.key});

  @override
  ConsumerState<NovoPlanoPage> createState() => _NovoPlanoPageState();
}

class _NovoPlanoPageState extends ConsumerState<NovoPlanoPage> {
  final _formKey = GlobalKey<FormState>();
  final _nomeController = TextEditingController();
  final _descricaoController = TextEditingController();
  int? _corSelecionada;
  bool _saving = false;

  @override
  void dispose() {
    _nomeController.dispose();
    _descricaoController.dispose();
    super.dispose();
  }

  Future<void> _salvar() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final repo = ref.read(treinosRepositoryProvider);
      await repo.criarPlano(
        nome: _nomeController.text.trim(),
        descricao: _descricaoController.text.trim().isEmpty
            ? null
            : _descricaoController.text.trim(),
        cor: _corSelecionada,
      );
      if (mounted) context.pop();
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('Novo plano'),
        actions: [
          if (_saving)
            const Padding(
              padding: EdgeInsets.only(right: 16),
              child: Center(
                child: SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.accent),
                ),
              ),
            )
          else
            TextButton(
              onPressed: _salvar,
              child: const Text('Salvar'),
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _nomeController,
              decoration: const InputDecoration(
                labelText: 'Nome do plano',
                hintText: 'Ex: Treino A',
              ),
              validator: (v) {
                if (v == null || v.trim().isEmpty) return 'Informe o nome';
                return null;
              },
              onFieldSubmitted: (_) => _salvar(),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _descricaoController,
              decoration: const InputDecoration(
                labelText: 'Descrição (opcional)',
                hintText: 'Ex: Peito e tríceps',
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 24),
            Text(
              'Cor do plano',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    color: AppColors.textMuted,
                  ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                _CorChip(
                  cor: null,
                  label: 'Nenhuma',
                  selected: _corSelecionada == null,
                  onTap: () => setState(() => _corSelecionada = null),
                ),
                ...coresPlano.map((cor) => _CorChip(
                      cor: cor.toARGB32(),
                      label: '',
                      selected: _corSelecionada == cor.toARGB32(),
                      onTap: () => setState(() => _corSelecionada = cor.toARGB32()),
                    )),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _CorChip extends StatelessWidget {
  const _CorChip({
    required this.cor,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final int? cor;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: cor != null ? Color(cor!) : AppColors.surface2,
          shape: BoxShape.circle,
          border: Border.all(
            color: selected ? AppColors.accent : AppColors.border,
            width: selected ? 3 : 1,
          ),
        ),
        child: label.isEmpty
            ? null
            : Center(
                child: Text(
                  label,
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: AppColors.textMuted,
                      ),
                ),
              ),
      ),
    );
  }
}
