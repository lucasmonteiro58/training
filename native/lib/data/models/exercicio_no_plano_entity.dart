import 'package:isar/isar.dart';

part 'exercicio_no_plano_entity.g.dart';

/// Tipo de série no plano (valor inteiro para Isar).
/// 0 = reps, 1 = tempo, 2 = falha.
int tipoSerieToInt(String v) {
  switch (v) {
    case 'tempo':
      return 1;
    case 'falha':
      return 2;
    default:
      return 0;
  }
}

String intToTipoSerie(int v) {
  switch (v) {
    case 1:
      return 'tempo';
    case 2:
      return 'falha';
    default:
      return 'reps';
  }
}

@collection
class ExercicioNoPlanoEntity {
  Id id = Isar.autoIncrement;

  late int planoId;

  /// ID do exercício (Exercicio.id ou nome se custom).
  late String exercicioId;

  /// Nome para exibição (evita join se exercício for removido).
  String? exercicioNome;

  late int ordem;

  late int series;

  late int repeticoesMeta;

  double? pesoMeta;

  late int descansoSegundos;

  String? notas;

  /// 0=reps, 1=tempo, 2=falha
  int tipoSerie = 0;

  int? duracaoMetaSegundos;
}
