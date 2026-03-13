import 'package:flutter/material.dart';

/// Tokens de cor do design system (paridade com src/styles.css).
abstract final class AppColors {
  // Cores base
  static const Color bg = Color(0xFF0D0F14);
  static const Color surface = Color(0xFF161820);
  static const Color surface2 = Color(0xFF1E2028);
  static const Color surface3 = Color(0xFF272A35);

  static Color get border => Colors.white.withValues(alpha: 0.08);
  static Color get borderStrong => Colors.white.withValues(alpha: 0.15);

  // Accent - Indigo (igual ao web)
  static const Color accent = Color(0xFF6366F1);
  static const Color accentHover = Color(0xFF818CF8);
  static Color get accentGlow => const Color(0xFF6366F1).withValues(alpha: 0.25);
  static Color get accentSubtle => const Color(0xFF6366F1).withValues(alpha: 0.12);

  // Texto
  static const Color text = Color(0xFFF0F0F5);
  static const Color textMuted = Color(0xFF8B8FA8);
  static const Color textSubtle = Color(0xFF565870);

  // Semânticas
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color danger = Color(0xFFEF4444);
  static const Color info = Color(0xFF38BDF8);

  // Bottom nav (web: rgba(22, 24, 32, 0.96))
  static Color get bottomNavBg => surface.withValues(alpha: 0.96);
}
