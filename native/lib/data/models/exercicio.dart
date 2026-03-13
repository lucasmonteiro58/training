import 'package:isar/isar.dart';

part 'exercicio.g.dart';

@collection
class Exercicio {
  Id id = Isar.autoIncrement;

  /// ID no catálogo remoto (ex.: free-exercise-db). Null = apenas local/custom.
  String? externalId;

  late String nome;

  String? grupoMuscular;

  String? equipamento;

  String? instrucoes;

  String? imageUrl;

  bool favorito = false;

  /// Exercício criado pelo usuário (catalogo remoto = false).
  bool isCustom = false;
}
