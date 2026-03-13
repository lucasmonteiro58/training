import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../core/constants/app_design_constants.dart';
import '../models/exercicio.dart';

/// URL do catálogo PT-BR (paridade com web).
const String kExerciciosRemoteUrl =
    'https://raw.githubusercontent.com/joao-gugel/exercicios-bd-ptbr/refs/heads/main/exercises/exercises-ptbr-full-translation.json';

const String kGifBaseUrl =
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises';

/// Cliente para baixar a base remota de exercícios.
/// Retorna lista vazia em caso de erro (rede ou parse).
Future<List<Exercicio>> fetchExerciciosRemotos() async {
  try {
    final response = await http
        .get(Uri.parse(kExerciciosRemoteUrl))
        .timeout(const Duration(seconds: 15));
    if (response.statusCode != 200) return [];
    final list = json.decode(response.body) as List<dynamic>?;
    if (list == null) return [];
    return list
        .map((e) => _rawToExercicio(e as Map<String, dynamic>))
        .whereType<Exercicio>()
        .toList();
  } catch (_) {
    return [];
  }
}

String _mapearGrupoEnPt(String en) {
  final key = en.toLowerCase().trim();
  return gruposEnPt[key] ?? en;
}

Exercicio? _rawToExercicio(Map<String, dynamic> raw) {
  try {
    final id = raw['id'] as String?;
    final name = raw['name'] as String?;
    if (id == null || name == null) return null;
    final primaryMuscles = raw['primaryMuscles'] as List<dynamic>?;
    final category = raw['category'] as String?;
    final primary = primaryMuscles?.isNotEmpty == true
        ? primaryMuscles!.first as String
        : (category ?? 'outro');
    final images = raw['images'] as List<dynamic>?;
    final gifPath = images?.isNotEmpty == true ? images!.first as String : null;
    final instructions = raw['instructions'] as List<dynamic>?;
    final instrucoesStr = instructions != null
        ? (instructions.map((e) => e.toString()).toList().join('\n'))
        : null;

    final ex = Exercicio()
      ..externalId = id
      ..nome = name
      ..grupoMuscular = _mapearGrupoEnPt(primary)
      ..equipamento = raw['equipment'] as String?
      ..instrucoes = instrucoesStr?.isEmpty == true ? null : instrucoesStr
      ..imageUrl = gifPath != null ? '$kGifBaseUrl/$gifPath' : null
      ..favorito = false
      ..isCustom = false;
    return ex;
  } catch (_) {
    return null;
  }
}
