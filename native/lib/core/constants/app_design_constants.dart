import 'package:flutter/material.dart';

/// Cores por grupo muscular (paridade com web CORES_GRUPO).
const Map<String, Color> coresGrupo = {
  'Peito': Color(0xFFEF4444),
  'Costas': Color(0xFF3B82F6),
  'Ombros': Color(0xFFF59E0B),
  'Bíceps': Color(0xFF10B981),
  'Tríceps': Color(0xFF8B5CF6),
  'Antebraço': Color(0xFF06B6D4),
  'Abdômen': Color(0xFFF97316),
  'Quadríceps': Color(0xFF6366F1),
  'Posterior de Coxa': Color(0xFFEC4899),
  'Glúteos': Color(0xFF14B8A6),
  'Panturrilha': Color(0xFF84CC16),
  'Trapézio': Color(0xFFA78BFA),
  'Cardio': Color(0xFFFB7185),
  'Corpo Inteiro': Color(0xFF94A3B8),
  'Outro': Color(0xFF64748B),
};

/// Cores disponíveis para planos (paridade com web CORES_PLANO).
const List<Color> coresPlano = [
  Color(0xFF6366F1), // indigo
  Color(0xFF8B5CF6), // violet
  Color(0xFFEC4899), // pink
  Color(0xFFEF4444), // red
  Color(0xFFF97316), // orange
  Color(0xFFF59E0B), // amber
  Color(0xFF10B981), // emerald
  Color(0xFF06B6D4), // cyan
  Color(0xFF3B82F6), // blue
];

/// Configuração de agrupamentos: superset, dropset, giantset.
class AgrupamentoConfig {
  const AgrupamentoConfig({
    required this.label,
    required this.cor,
    required this.corBg,
  });
  final String label;
  final Color cor;
  final Color corBg;
}

const Map<String, AgrupamentoConfig> agrupamentoConfig = {
  'superset': AgrupamentoConfig(
    label: 'Superset',
    cor: Color(0xFFF59E0B),
    corBg: Color(0x26F59E0B), // rgba(245,158,11,0.15)
  ),
  'dropset': AgrupamentoConfig(
    label: 'Drop Set',
    cor: Color(0xFFEF4444),
    corBg: Color(0x26EF4444),
  ),
  'giantset': AgrupamentoConfig(
    label: 'Giant Set',
    cor: Color(0xFF8B5CF6),
    corBg: Color(0x268B5CF6),
  ),
};
