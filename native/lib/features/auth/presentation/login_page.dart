import 'dart:ui';

import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: Stack(
        children: [
          // Blur circles de fundo (igual ao web)
          Positioned(
            top: -MediaQuery.sizeOf(context).height * 0.2,
            left: -MediaQuery.sizeOf(context).width * 0.2,
            child: Container(
              width: 500,
              height: 500,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.accent.withValues(alpha: 0.07),
              ),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 100, sigmaY: 100),
                child: const SizedBox.expand(),
              ),
            ),
          ),
          Positioned(
            bottom: -MediaQuery.sizeOf(context).height * 0.1,
            right: -MediaQuery.sizeOf(context).width * 0.2,
            child: Container(
              width: 400,
              height: 400,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF8B5CF6).withValues(alpha: 0.06),
              ),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
                child: const SizedBox.expand(),
              ),
            ),
          ),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: EdgeInsets.only(
                  left: 24,
                  right: 24,
                  bottom: MediaQuery.paddingOf(context).bottom + 20,
                ),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 400),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 24),
                      // Logo (placeholder; pode trocar por Image.asset('assets/icon.png') quando tiver o ícone)
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: AppColors.surface2,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: const Icon(Icons.fitness_center_rounded, size: 40, color: AppColors.accent),
                      ),
                      const SizedBox(height: 16),
                      // Título com gradiente (igual ao web: gradient-text)
                      ShaderMask(
                        blendMode: BlendMode.srcIn,
                        shaderCallback: (bounds) => const LinearGradient(
                          colors: [Color(0xFF6366F1), Color(0xFFA78BFA)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ).createShader(bounds),
                        child: Text(
                          'Training',
                          style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                                fontWeight: FontWeight.w900,
                                fontSize: 36,
                              ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Seu parceiro de treino inteligente',
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              color: AppColors.textMuted,
                            ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 32),
                      // Pills de features
                      Wrap(
                        alignment: WrapAlignment.center,
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          '📊 Registro de séries',
                          '⏱️ Cronômetro',
                          '📈 Histórico',
                          '🔔 Notificações',
                        ].map((text) => _Pill(label: text)).toList(),
                      ),
                      const SizedBox(height: 32),
                      // Botão Google (branco, igual ao web)
                      SizedBox(
                        width: double.infinity,
                        child: Material(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          elevation: 2,
                          shadowColor: Colors.black26,
                          child: InkWell(
                            onTap: () {
                              // TODO: login com Google
                            },
                            borderRadius: BorderRadius.circular(16),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  _GoogleIcon(),
                                  const SizedBox(width: 12),
                                  Text(
                                    'Entrar com Google',
                                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                          color: const Color(0xFF1F2937),
                                          fontWeight: FontWeight.w600,
                                        ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Seus treinos ficam seguros e sincronizados 🔒',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.textSubtle,
                              fontSize: 12,
                            ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: AppColors.textMuted,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
      ),
    );
  }
}

class _GoogleIcon extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 22,
      height: 22,
      child: CustomPaint(
        painter: _GoogleLogoPainter(),
      ),
    );
  }
}

class _GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    canvas.drawRect(
      Rect.fromLTWH(w * 0.45, 0, w * 0.55, h),
      Paint()..color = const Color(0xFF4285F4),
    );
    canvas.drawRect(
      Rect.fromLTWH(0, h * 0.45, w, h * 0.55),
      Paint()..color = const Color(0xFF34A853),
    );
    canvas.drawRect(
      Rect.fromLTWH(0, 0, w * 0.45, h * 0.55),
      Paint()..color = const Color(0xFFFBBC05),
    );
    canvas.drawRect(
      Rect.fromLTWH(w * 0.45, h * 0.45, w * 0.55, h * 0.55),
      Paint()..color = const Color(0xFFEA4335),
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
