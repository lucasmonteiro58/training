import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';

class ExerciciosPage extends StatelessWidget {
  const ExerciciosPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('Exercícios'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            'Catálogo de exercícios será migrado na Etapa 2.\nPor enquanto esta tela é apenas estrutural.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textMuted,
                ),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
