import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';

/// Placeholder da tela de treino ativo. Fluxo completo na Etapa 4.
class TreinoAtivoPlaceholderPage extends StatelessWidget {
  const TreinoAtivoPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('Treino ativo'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.bolt_rounded,
                size: 64,
                color: AppColors.accent.withValues(alpha: 0.8),
              ),
              const SizedBox(height: 16),
              Text(
                'Treino ativo',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: AppColors.text,
                      fontWeight: FontWeight.w700,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                'O fluxo completo (timers, séries, descanso, PRs e relatório) será implementado na Etapa 4.\n\nPor enquanto, inicie um treino pela aba Treinos.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textMuted,
                    ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
